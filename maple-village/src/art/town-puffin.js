// Puffin Isle (round 216): four screens of a small wild island off the British coast, after the Farnes, Skomer and
// Lundy. Nothing like Saltwick's pantiles and cobbles: short bright green turf, whitewashed cottages with grey slate
// roofs, grey granite (yellow lichen on the rocks), dry-stone walls, one gravel track from the landing to the
// lighthouse, and a deep blue sea on every screen. Calm and windswept: a few strong pieces and plenty of open turf.
//   pi_lighthouse: the sea to the north and west, the tower, the keeper's cottage, the foghorn, the bird hide
//   pi_village:    the cottage row, the tearoom, the walled garden, the little church, the goats, the sea to the east
//   pi_cliffs:     the granite cliff and its seabird ledges, the puffin burrows, the zig-zag path to the sea glass cove
//   pi_landing:    the boathouse and slipway, the post office, the stone jetty and the island boat, the seal rocks
// Seasons: sea pinks bright in spring, bracken green in summer and rust-brown in autumn, frost and snow in winter.
// Puffins stand at their burrows from April to July only; white-coated seal pups on the landing's shore in October
// and November.
import { dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";
import { puffinsIn, pupsIn } from "../data/puffin.js";

const C = {grass: "#8DC264", grass2: "#77AE50", grass3: "#A6D27E", turf: "#6E9E48", track: "#DCD5C2", track2: "#BFB7A0",
  granite: ["#A9A8A3", "#9A9994", "#B6B5AF"], gline: "#77766F", rock: "#8E8D88", rock2: "#ACABA5", rock3: "#72716C", lichen: "#E2B444",
  sea: "#2F6DA6", sea2: "#4589C4", sea3: "#22547F", foam: "#E8F2F8", shingle: "#D8D1BF", shingle2: "#C2BAA6",
  white: "#FAFAF5", white2: "#E6E6DF", slate: "#59626C", slate2: "#454D56", glass: "#3F4B57", tar: "#2E2C2B", tar2: "#423E3B",
  wood: "#7A6050", wood2: "#5E4A3E", rope: "#B49A6A", ink: "#2F2B28", red: "#C8372D", boat: "#2E6DB4",
  doors: ["#2E6DB4", "#C8372D", "#3F7A4E", "#E3B53C", "#2F4E6E", "#5FA3A0"]};
const ssn = () => seasonOf(dayKey());
const puffinTime = () => puffinsIn(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 10) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#4E5E6C" opacity=".2" pointer-events="none"/>`;
// a sign board with lettering
const board = (x, y, w, t, bg = C.white, fg = C.ink, size = 8) => `<rect x="${f1(x - w/2)}" y="${y}" width="${w}" height="${size + 5}" rx="2" style="fill:${bg};stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x}" y="${f1(y + size + 1)}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="${size}" fill="${fg}" pointer-events="none">${t}</text>`;
// a chalkboard (a: an A-board on legs)
const chalk = (x, y, w, lines, a = false) => { const h = lines.length*8 + 6;
  return `<g pointer-events="none">${a ? `<path d="M${x + 4} ${y + h} l-3 10 M${x + w - 4} ${y + h} l3 10" style="stroke:${C.wood2}" stroke-width="2"/>` : ""}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" style="fill:#33403B;stroke:${C.wood}" stroke-width="2"/>
  ${lines.map((t, i) => `<text x="${x + w/2}" y="${y + 10 + i*8}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6.4" fill="#F2F0E6">${t}</text>`).join("")}</g>`; };
// rough granite blocks on a wall face
const blocks = (x, y, w, h, seed = 0, op = .45) => { let d = "";
  for (let ry = y, k = 0; ry < y + h - 1; ry += 8, k++) { d += `M${x} ${ry} H${x + w} `; for (let bx = x + 4 + rnd(seed + k)*10; bx < x + w - 3; bx += 10 + rnd(seed + k*7 + bx)*10) d += `M${f1(bx)} ${ry} v${Math.min(8, y + h - ry)} `; }
  return `<path d="${d}" style="stroke:${C.gline}" stroke-width=".6" opacity="${op}" fill="none"/>`; };
// a grey slate roof with straight courses and a dark ridge (frosted in winter)
function slateRoof(x, y, w, rh, col = C.slate){
  const shape = `M${x - 5} ${y + rh} L${x + 6} ${y} H${x + w - 6} L${x + w + 5} ${y + rh}z`;
  const rows = Array.from({length: Math.floor(rh/5)}, (_, k) => { const ry = y + 5 + k*5, t = (ry - y)/rh; return `M${f1(x + 6 - 11*t)} ${ry} H${f1(x + w - 6 + 11*t)}`; }).join(" ");
  const frost = ssn() === "winter" ? `<path d="M${x + 6} ${y + 1} H${x + w - 6} L${x + w - 3} ${y + rh*.45} H${x + 3}z" style="fill:#FFFFFF" opacity=".6"/>` : "";
  return { art: `<path d="${shape}" style="fill:${col}"/><path d="${rows}" style="stroke:${C.slate2}" stroke-width=".7"/><path d="M${x + 6} ${y + 1} H${x + w - 6}" style="stroke:#353B42" stroke-width="2.6"/>${frost}`, line: `<path d="${shape}"/>` };
}
// a small deep-set window in a thick white wall
const win = (x, y, w = 12, h = 13) => `<rect x="${f1(x - 1)}" y="${f1(y - 1)}" width="${w + 2}" height="${h + 2}" style="fill:#C9CBC6"/><rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" style="fill:${C.glass}"/><path d="M${f1(x + w/2)} ${f1(y)} v${h} M${f1(x)} ${f1(y + h/2)} h${w}" style="stroke:${C.white}" stroke-width="1.1"/><rect x="${f1(x - 2)}" y="${f1(y + h)}" width="${w + 4}" height="2" style="fill:#B9B8B2"/>`;
// a painted plank door with a granite step
const door = (x, y, col, w = 14, h = 23) => `<rect x="${f1(x - w/2 - 2)}" y="${f1(y - h - 2)}" width="${w + 4}" height="${h + 2}" style="fill:#C9CBC6"/><rect x="${f1(x - w/2)}" y="${f1(y - h)}" width="${w}" height="${h}" style="fill:${col}"/><path d="M${f1(x - w/2 + 2)} ${f1(y - h + 4)} h${w - 4} M${f1(x - w/2 + 2)} ${f1(y - 5)} h${w - 4}" style="stroke:#000" stroke-width=".6" opacity=".25"/><circle cx="${f1(x + w/2 - 3)}" cy="${f1(y - h/2)}" r="1" style="fill:#E3C26A"/><rect x="${f1(x - w/2 - 3)}" y="${f1(y - 1)}" width="${w + 6}" height="3" style="fill:${C.granite[1]}"/>`;
// a gable-end chimney of granite with two pots
const chimney = (cx, y) => `<rect x="${f1(cx - 5)}" y="${y - 12}" width="10" height="14" style="fill:${C.granite[0]}"/><rect x="${f1(cx - 6)}" y="${y - 14}" width="12" height="3" style="fill:${C.gline}"/><rect x="${f1(cx - 3.5)}" y="${y - 18}" width="3" height="4" style="fill:#9A6A50"/><rect x="${f1(cx + .5)}" y="${y - 17}" width="3" height="3" style="fill:#9A6A50"/>`;
// a low cottage: whitewashed (or granite, o.stone), deep-set windows, a painted door, a slate roof, gable chimneys
function cottage(x, y, w, h, o = {}){
  const rh = o.rh || Math.round(Math.min(30, Math.max(18, h*.36))), wy = y + rh, wh = h - rh;
  const wall = o.stone ? C.granite[2] : o.wall || C.white;
  const cols = o.cols ?? Math.max(1, Math.floor(w/30)), dx = o.doorX ?? w/2;
  let wins = "";
  for (let c = 0; c < cols; c++) { const cx = x + (c + .5)*w/cols; if (o.door !== false && Math.abs(cx - (x + dx)) < 16) continue; wins += win(cx - 6, wy + Math.max(5, (wh - 13)/2 - 3)); }
  const roof = slateRoof(x, y, w, rh);
  const chims = o.chimney === false ? "" : chimney(x + 9, y) + (w > 50 ? chimney(x + w - 9, y) : "");
  return (o.noShade ? "" : shade(x, wy, w, wh)) + sk(`${chims}<rect x="${x}" y="${wy}" width="${w}" height="${wh}" style="fill:${wall}"/>${o.stone ? blocks(x, wy + 2, w, wh - 2, x + y) : `<path d="M${x} ${wy + wh - 3} H${x + w}" style="stroke:#D9D9D1" stroke-width="3"/>`}${wins}${o.door === false ? "" : door(x + dx, y + h, o.doorCol || C.doors[0])}${roof.art}`,
    `<rect x="${x}" y="${wy}" width="${w}" height="${wh}"/>${roof.line}${o.door === false ? "" : `<rect x="${f1(x + dx - 8)}" y="${y + h - 25}" width="16" height="25"/>`}`);
}
// a dry-stone wall of granite
// (every path filter gets a full-screen box, so a flat wall or path isn't clipped to a sliver by the filter region)
const BB = `<rect width="520" height="640" fill="none" style="stroke:none"/>`;
const stones = (d, w = 10) => `<g pointer-events="none" filter="url(#wob)">${BB}<path d="${d}" fill="none" style="stroke:var(--line)" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#8E8D87" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" style="stroke:#C4C3BC" stroke-width="${w - 3}" stroke-dasharray="2.5 6" stroke-linecap="round"/><path d="${d}" fill="none" style="stroke:#ADACA5" stroke-width="${w - 4}" stroke-dasharray="1.5 7" stroke-dashoffset="4.5" stroke-linecap="round"/></g>`;
// the island track: crushed granite gravel with a worn centre
const track = (d, w = 24) => `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:${C.track2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.track}" stroke-width="${w - 7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#EAE5D6" stroke-width="${Math.max(2, w - 18)}" stroke-dasharray="2 7" stroke-linecap="round" opacity=".8"/></g>`;
// a narrow footpath through the turf
const foot = (d, w = 16) => `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:#B9B08E" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#D7CFAE" stroke-width="${w - 6}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const waves = (pts, col = C.foam) => `<g pointer-events="none" style="stroke:${col}" stroke-width="1.5" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${3.5 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
const gulls = pts => `<g pointer-events="none" fill="none" style="stroke:#3A3430" stroke-width="1.2">${pts.map(([x, y], i) => `<path d="M${x - 7} ${y} q3.5 -5 7 0 q3.5 -5 7 0"><animateTransform attributeName="transform" type="translate" values="0 0;${18 + i*6} ${-4 + i*2};0 0" dur="${12 + i*3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// granite boulders with a splash of yellow lichen
const rocks = (pts, col = C.rock) => `<g pointer-events="none">${sk(pts.map(([x, y, r], i) => `<path d="M${f1(x - r)} ${f1(y + r*.3)} Q${f1(x - r)} ${f1(y - r*.55)} ${f1(x - r*.2)} ${f1(y - r*.6)} Q${f1(x + r*.9)} ${f1(y - r*.62)} ${f1(x + r)} ${f1(y + r*.1)} Q${f1(x + r*.8)} ${f1(y + r*.6)} ${f1(x)} ${f1(y + r*.6)} Q${f1(x - r*.8)} ${f1(y + r*.6)} ${f1(x - r)} ${f1(y + r*.3)}z" style="fill:${col}"/><ellipse cx="${f1(x - r*.3)}" cy="${f1(y - r*.25)}" rx="${f1(r*.42)}" ry="${f1(r*.2)}" style="fill:${C.rock2}"/>${r > 7 ? `<circle cx="${f1(x + r*.35)}" cy="${f1(y - r*.1)}" r="${f1(Math.min(3.4, r*.16))}" fill="${C.lichen}" opacity=".85"/><circle cx="${f1(x + r*.15 + (i % 2)*3)}" cy="${f1(y + r*.2)}" r="${f1(Math.min(2.2, r*.1))}" fill="${C.lichen}" opacity=".7"/>` : ""}`).join(""),
  pts.slice(0, 10).map(([x, y, r]) => `<path d="M${f1(x - r)} ${f1(y + r*.3)} Q${f1(x - r)} ${f1(y - r*.55)} ${f1(x - r*.2)} ${f1(y - r*.6)} Q${f1(x + r*.9)} ${f1(y - r*.62)} ${f1(x + r)} ${f1(y + r*.1)}"/>`).join(""))}</g>`;
// sea pinks (thrift) in cushions: bright pink in spring, paler in summer, papery seedheads the rest of the year
const thrift = pts => { const se = ssn(), on = se === "spring" || se === "summer", col = se === "spring" ? "#EE6F9C" : on ? "#F2A9C0" : "#BDA894";
  return `<g pointer-events="none">${pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 1}" rx="7" ry="2.8" fill="#6E8E4A"/>${[[-4, -2], [0, -4.5], [4, -2], [-1.5, -1]].map(([dx, dy]) => `<path d="M${x + dx*.5} ${y} L${x + dx} ${y + dy}" style="stroke:#5E7E40" stroke-width=".8"/><circle cx="${x + dx}" cy="${y + dy}" r="${on ? 2.5 : 1.4}" fill="${col}"/>`).join("")}`).join("")}</g>`; };
// sea campion: little white flowers on grey-green mats (green mats only out of season)
const campion = pts => { const on = ssn() === "spring" || ssn() === "summer";
  return `<g pointer-events="none">${pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="#8FAE7A"/>${on ? [[-4, -1], [1, -2.5], [5, 0], [-1, 1]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.8" fill="#FFFFFF" style="stroke:#C9C9C0" stroke-width=".4"/>`).join("") : ""}`).join("")}</g>`; };
// bracken: green fronds in spring and summer, rust-brown in autumn, dead brown in winter
const bracken = pts => { const se = ssn(), col = se === "autumn" ? ["#B96E2E", "#CB8838", "#A35C28"] : se === "winter" ? ["#8C6A4C", "#7C6046", "#987656"] : se === "spring" ? ["#88BE52", "#78B048", "#98C862"] : ["#5E9A3A", "#6CA844", "#528C34"];
  return `<g pointer-events="none">${pts.map(([x, y, s = 1], i) => `<ellipse cx="${x}" cy="${y + 2}" rx="${16*s}" ry="${4*s}" fill="#3E6A2A" opacity=".18"/>${[[-11, -1, -1], [-5, 1, -1], [1, 0, 1], [7, 1, 1], [12, -1, 1], [-2, -3, -1]].map(([dx, dy, dir], k) => { const bx = x + dx*s, by = y + dy*s, h = (12 + rnd(i*9 + k)*7)*s;
    return `<path d="M${f1(bx)} ${f1(by)} Q${f1(bx + dir*2*s)} ${f1(by - h*.6)} ${f1(bx + dir*7*s)} ${f1(by - h)}" fill="none" style="stroke:${col[(i + k) % 3]}" stroke-width="${f1(5.5*s)}" stroke-dasharray="1.6 1.1"/><path d="M${f1(bx)} ${f1(by)} Q${f1(bx + dir*2*s)} ${f1(by - h*.6)} ${f1(bx + dir*7*s)} ${f1(by - h)}" fill="none" style="stroke:${col[2]}" stroke-width=".7"/>`; }).join("")}`).join("")}</g>`; };
// turf tussocks: little darker tufts to break up the green
const tufts = pts => `<g pointer-events="none" fill="none" style="stroke:${C.turf}" stroke-width="1.1" opacity=".7">${pts.map(([x, y]) => `<path d="M${x - 3} ${y} l-1 -4 M${x} ${y} v-5 M${x + 3} ${y} l1 -4"/>`).join("")}</g>`;
function seasonFx(){
  if (ssn() === "winter") return `<g pointer-events="none">${Array.from({length: 14}, (_, i) => `<circle r="1.8" fill="#FFFFFF" opacity=".9"><animateMotion dur="${10 + (i % 5)}s" begin="${-i*1.3}s" repeatCount="indefinite" path="M${20 + i*36} -10 q-12 330 8 660"/></circle>`).join("")}</g>`;
  return "";
}
const frost = pts => ssn() !== "winter" ? "" : `<g filter="url(#wash)" opacity=".5" pointer-events="none">${pts.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#F4F6F6"/>`).join("")}</g>`;
// a puffin standing (dir 1 faces right): black back, white face and front, the striped beak, orange feet
const puffin = (x, y, dir = 1, s = 1) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${dir*s} ${s})"><path d="M-3 0 h-3 M1 0 h3" style="stroke:#F07A22" stroke-width="2" stroke-linecap="round"/>${sk(`<ellipse cx="-.5" cy="-8" rx="5.2" ry="8" style="fill:#262422"/><ellipse cx="1.4" cy="-6.5" rx="3.4" ry="5.8" style="fill:${C.white}"/><circle cx="1" cy="-17" r="4.6" style="fill:#262422"/><ellipse cx="2" cy="-16.6" rx="3.2" ry="2.9" style="fill:#F2F0EA"/>
  <path d="M4.4 -18.6 Q9.6 -17.6 9.8 -15.2 Q7.4 -14 4.4 -14.6z" style="fill:#F07A22"/><path d="M5.4 -18.2 v3.4" style="stroke:#E8C64A" stroke-width="1"/><path d="M7.4 -17.6 v2.8" style="stroke:#3E6A9A" stroke-width=".6" opacity=".6"/>`, `<ellipse cx="-.5" cy="-8" rx="5.2" ry="8"/><circle cx="1" cy="-17" r="4.6"/>`)}<circle cx="2.4" cy="-17.4" r=".9" fill="#1E1C1A"/><path d="M1 -16.6 l2.6 -.9" style="stroke:#7A7066" stroke-width=".4"/></g>`;
// a puffin whirring low over the water: a black body, a blur of wings, the bright beak
const flyingPuffins = (pts, span = 120) => `<g pointer-events="none">${pts.map(([x, y, dir = 1], i) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${dir*span} ${-3 + (i % 3)*3};${dir*span*2} 0" dur="${7 + i*1.5}s" begin="${-i*2}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(${dir} 1)"><ellipse cx="0" cy="0" rx="5.5" ry="2.6" fill="#262422"/><circle cx="5" cy="-.6" r="2.2" fill="#F2F0EA"/><path d="M6.6 -1.4 l3 1 l-3 1z" fill="#F07A22"/><path d="M-2 -1 l-2 -5 l4 4z M-2 1 l-2 5 l4 -4z" fill="#3A3634"><animateTransform attributeName="transform" type="scale" values="1 1;1 -.2;1 1" dur=".18s" repeatCount="indefinite"/></path><path d="M-3 2 h-2 M-1 2.4 h-2" style="stroke:#F07A22" stroke-width="1"/></g></g>`).join("")}</g>`;
// a grey seal hauled out (and a white-coated pup)
const seal = (x, y, dir, i) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">${sk(`<path d="M-17 0 Q-15 -11 0 -11 Q10 -11 14 -19 Q21 -21 21 -14 Q19 -6 15 0z" style="fill:${i % 2 ? "#8C8B88" : "#6E6D6A"}"/><circle cx="18" cy="-16" r=".9" style="fill:#2F2B28"/><path d="M-17 0 l-5 -4 M-17 0 l-5 3" style="stroke:#5E5C58" stroke-width="2"/>${i % 2 ? `<path d="M-6 -8 q2 -1 4 0 M2 -6 q2 -1 3 0" style="stroke:#5E5C58" stroke-width=".8" fill="none"/>` : ""}`, `<path d="M-17 0 Q-15 -11 0 -11 Q10 -11 14 -19 Q21 -21 21 -14 Q19 -6 15 0z"/>`)}</g>`;
const pup = (x, y, dir = 1) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${dir} 1)"><ellipse cx="0" cy="1" rx="13" ry="3" fill="#5E6C78" opacity=".2"/>${sk(`<path d="M-12 0 Q-12 -10 0 -10 Q9 -10 11 -5 Q12 0 8 0z" style="fill:#FBFAF4"/><path d="M-12 0 l-3 -3 M-12 0 l-3 2" style="stroke:#D9D6CC" stroke-width="2"/><path d="M-9 -6 Q-2 -11 6 -9" fill="none" style="stroke:#DAD6CA" stroke-width="2.4"/><path d="M1 0 q2 -4 6 -2" fill="none" style="stroke:#CFCABD" stroke-width="1.6"/>`, `<path d="M-12 0 Q-12 -10 0 -10 Q9 -10 11 -5 Q12 0 8 0z"/>`)}<circle cx="6" cy="-6.5" r="1.4" fill="#1E1C1A"/><circle cx="9" cy="-6" r="1.3" fill="#1E1C1A"/><circle cx="10.6" cy="-3.6" r=".8" fill="#3A3634"/></g>`;
// the way on: a fingerpost, a white arm with a green tip
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.wood2}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:${C.white}"/><path d="M${x + 22} ${y - 28} h3 l6 6 l-6 6 h-3z" style="fill:#3F7A4E"/><path d="M${x + 6} ${y - 22} h12" style="stroke:${C.ink}" stroke-width="1.4"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// the sea: a deep blue fill, a darker deep, foam at the edge, and a granite fringe along the shore
const sea = (fill, edge, foamPts, fringe = []) => `<g pointer-events="none">${sk(`<path d="${fill}" style="fill:${C.sea}"/>`, `<path d="${edge}"/>`)}<path d="${edge}" fill="none" style="stroke:${C.foam}" stroke-width="3.2" opacity=".8"/>${waves(foamPts)}</g>${fringe.length ? rocks(fringe) : ""}`;
const glow = () => ssn() === "winter" ? "#DCE3E8" : "#FFFFFF";

/* ---------- pi_landing: the boathouse, the post office, the jetty and the island boat, the seal rocks ---------- */
function landingScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="250" cy="330" rx="170" ry="120" style="fill:${C.grass3}"/><ellipse cx="80" cy="440" rx="90" ry="60" style="fill:${C.grass2}"/><ellipse cx="420" cy="320" rx="60" ry="90" style="fill:${C.grass2}"/></g>`;
  // the shingle above the tide line, along the bottom and up the east side
  const shingle = `<g pointer-events="none">${sk(`<path d="M0 534 Q80 524 160 536 Q240 544 300 528 H360 Q420 520 448 480 Q452 380 446 280 Q452 160 448 0 H476 V600 H0z" style="fill:${C.shingle}"/>`, `<path d="M0 534 Q80 524 160 536 Q240 544 300 528 M360 528 Q420 520 448 480 Q452 380 446 280 Q452 160 448 0"/>`)}
    ${Array.from({length: 46}, (_, k) => { const t = rnd(k*3), x = k < 26 ? 8 + rnd(k*5)*290 : 456 + rnd(k*5)*14, y = k < 26 ? 544 + t*24 : 40 + rnd(k*7)*440; return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(2 + t*2)}" ry="${f1(1.2 + t)}" fill="${k % 3 ? C.shingle2 : "#A9A396"}"/>`; }).join("")}
    <path d="M10 566 q20 -5 40 0 q20 5 40 0 q20 -5 40 0 M200 568 q16 -4 32 0" fill="none" style="stroke:#5E7A4E" stroke-width="2" opacity=".55"/></g>`;
  const water = sea("M476 0 Q468 90 474 180 Q466 280 474 380 Q468 460 472 530 Q450 572 380 576 L300 576 Q200 572 120 580 Q60 584 0 576 V640 H520 V0z",
    "M476 0 Q468 90 474 180 Q466 280 474 380 Q468 460 472 530 Q450 572 380 576 M300 576 Q200 572 120 580 Q60 584 0 576",
    [[490, 60], [500, 160], [488, 260], [500, 360], [490, 460], [430, 600], [470, 628], [270, 620], [20, 624]],
    [[474, 120, 9], [478, 300, 8], [472, 440, 10], [466, 540, 9]]);
  // the seal rocks just offshore, grey seals hauled out on them
  const sealrocks = `<g data-place="piseals" aria-label="The seal rocks: grey seals hauled out"><ellipse class="hov" cx="150" cy="530" rx="32" ry="11" style="fill:var(--butter)"/>
    <g pointer-events="none">${rocks([[66, 612, 30], [170, 620, 24], [118, 600, 14], [234, 616, 13]], C.rock3)}${seal(62, 600, 1, 0)}${seal(170, 610, -1, 1)}${seal(118, 592, 1, 2)}
      <path d="M30 630 q10 -4 20 0 M196 634 q8 -4 16 0" fill="none" style="stroke:${C.foam}" stroke-width="1.4"/></g>${lab(150, 508, "Seal rocks", "#E2E6EA", 10)}</g>`;
  const pups = pupsIn(dayKey()) ? `<g transform="translate(78 556) scale(1.25) translate(-78 -556)">${pup(78, 556, 1)}</g><g transform="translate(226 560) scale(1.25) translate(-226 -560)">${pup(226, 560, -1)}</g>` : "";
  // the stone jetty running down into the sea, steps at its foot, the island boat tied alongside
  const jetty = `<g pointer-events="none">${sk(`<path d="M302 500 H358 V634 H302z" style="fill:${C.granite[1]}"/><path d="M308 500 H352 V634 H308z" style="fill:${C.granite[2]}"/>`, `<path d="M302 500 V634 H358 V500"/>`)}
    ${blocks(308, 504, 44, 128, 7, .5)}<path d="M358 600 h8 v6 h-8 M358 612 h8 v6 h-8 M358 624 h8 v6 h-8" style="fill:${C.granite[0]};stroke:var(--line)" stroke-width=".7"/>
    ${[[355, 540], [355, 596], [305, 560]].map(([x, y]) => `<rect x="${x - 3.5}" y="${y - 7}" width="7" height="8" rx="2" style="fill:#3A3836;stroke:var(--line)" stroke-width=".8"/>`).join("")}
    <path d="M300 590 Q294 600 300 612" fill="none" style="stroke:#3E6A3E" stroke-width="2.4" opacity=".5"/></g>`;
  const boat = `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.6;0 0" dur="3.6s" repeatCount="indefinite"/><ellipse cx="412" cy="626" rx="52" ry="4" fill="${C.foam}" opacity=".7"/>
    ${sk(`<path d="M366 604 H460 Q458 618 444 628 H382 Q370 620 366 604z" style="fill:${C.boat}"/><path d="M367 607 H459" style="stroke:${C.white}" stroke-width="2.4"/><path d="M370 614 H456" style="stroke:#C8372D" stroke-width="1.2"/>
      <rect x="426" y="584" width="22" height="20" rx="2" style="fill:${C.white}"/><rect x="430" y="588" width="14" height="7" rx="1.5" style="fill:#9DB8C4"/><path d="M424 584 h26 l-3 -4 h-20z" style="fill:${C.boat}"/><path d="M437 580 v-10" style="stroke:${C.wood2}" stroke-width="1.4"/><path d="M437 570 h7 l-2 2.5 l2 2.5 h-7" style="fill:#E3B53C"/>
      <path d="M378 604 h40" style="stroke:${C.wood}" stroke-width="2"/><text x="402" y="624" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="5.5" fill="${C.white}">PUFFIN</text>`,
      `<path d="M366 604 H460 Q458 618 444 628 H382 Q370 620 366 604z"/><rect x="426" y="584" width="22" height="20" rx="2"/>`)}</g>
    <path d="M366 606 Q360 600 355 597" fill="none" style="stroke:${C.rope}" stroke-width="1.4"/></g>`;
  const pier = `<g data-place="pipier" aria-label="The jetty: the boat home to Honeybrook"><ellipse class="hov" cx="330" cy="560" rx="26" ry="12" style="fill:var(--butter)"/>${lab(408, 556, "Boat home", "#CFE2EE", 10)}</g>`;
  const jettyBits = `<g pointer-events="none">${sk(`<rect x="371" y="512" width="3" height="24" style="fill:${C.wood2}"/><circle cx="372.5" cy="514" r="8" style="fill:none;stroke:#E8573A" stroke-width="4"/><path d="M366 510 l3 3 M378 510 l-3 3 M366 518 l3 -3 M378 518 l-3 -3" style="stroke:${C.white}" stroke-width="2"/>
    <ellipse cx="290" cy="514" rx="9" ry="4.5" style="fill:${C.rope}"/><ellipse cx="290" cy="514" rx="4" ry="2" style="fill:#8A7448"/>`, `<circle cx="372.5" cy="514" r="10"/><ellipse cx="290" cy="514" rx="9" ry="4.5"/>`)}</g>`;
  // the old tarred boathouse: black planks, a slate roof, wide doors onto a stone slipway
  const slip = `<g pointer-events="none">${sk(`<path d="M86 168 H146 L152 214 H80z" style="fill:${C.granite[2]}"/>`, `<path d="M86 168 L80 214 M146 168 L152 214"/>`)}<path d="M100 170 L98 214 M132 170 L134 214" style="stroke:${C.wood}" stroke-width="2.6"/>${blocks(82, 172, 68, 40, 3, .3)}</g>`;
  const boathouse = (() => { const rf = slateRoof(44, 62, 144, 36, "#4E555D");
    return `<g data-place="piboathouse" aria-label="The old boathouse"><ellipse class="hov" cx="116" cy="186" rx="38" ry="11" style="fill:var(--butter)"/>${shade(44, 98, 144, 72)}
    ${sk(`<rect x="44" y="98" width="144" height="72" style="fill:${C.tar}"/><path d="${Array.from({length: 17}, (_, k) => `M${50 + k*8.4} 98 v72`).join(" ")}" style="stroke:${C.tar2}" stroke-width="1.4"/>
      <rect x="88" y="116" width="56" height="54" style="fill:#5A4A3E"/><path d="M116 116 v54 M88 116 l28 27 l28 -27 M88 170 l28 -27 l28 27" style="stroke:#3E3229" stroke-width="1.4" fill="none"/><path d="M88 116 h56" style="stroke:#3E3229" stroke-width="2"/>
      ${win(58, 118, 14, 12)}${win(160, 118, 14, 12)}${rf.art}`,
      `<rect x="44" y="98" width="144" height="72"/>${rf.line}<rect x="88" y="116" width="56" height="54"/>`)}
    <g pointer-events="none">${board(66, 144, 34, "WELCOME", "#F2EEE2", C.ink, 5.5)}${sk(`<path d="M168 168 q6 -26 12 0z" style="fill:#5E7E6A" opacity=".8"/><path d="M174 142 v26" style="stroke:${C.wood}" stroke-width="1.6"/><path d="M162 152 h24" style="stroke:${C.wood}" stroke-width="1.6"/>`, `<path d="M174 142 v26"/>`)}</g>${lab(116, 210, "Boathouse", "#E2E6EA", 10)}</g>`; })();
  // the island post office: tiny and whitewashed, a red postbox in the wall, a puffin painted on the door
  const post = (() => { const c = cottage(312, 72, 116, 98, {doorX: 58, doorCol: "#2E6DB4", cols: 2, rh: 32});
    const pd = `<g transform="translate(370 166) scale(.55)">${puffin(0, 0, 1, 1)}</g>`;
    return `<g data-place="pipost" aria-label="The island post office"><ellipse class="hov" cx="370" cy="186" rx="36" ry="11" style="fill:var(--butter)"/>${c}
    <g pointer-events="none">${stones("M294 166 V150 H312 M428 150 H446 V166", 7)}${pd}
      ${sk(`<path d="M394 124 h14 v18 h-14z" style="fill:${C.red}"/><path d="M394 124 q7 -6 14 0" style="fill:${C.red}"/><rect x="396" y="128" width="10" height="2" style="fill:#2A1E1C"/><path d="M398 134 h6" style="stroke:#E3C26A" stroke-width=".8"/>`, `<path d="M394 142 V124 q7 -6 14 0 V142z"/>`)}
      ${board(370, 108, 72, "POST OFFICE", "#C8372D", "#FFF6E8", 8)}</g>${lab(370, 210, "Post office", "#F6D6CF", 10)}</g>`; })();
  const tr = track("M300 14 Q296 90 276 170 Q258 250 262 320 Q268 420 316 480 Q330 506 330 540") + track("M14 330 Q100 330 170 318 Q230 306 262 300", 20)
    + foot("M270 206 Q200 196 136 190") + foot("M284 196 Q330 190 370 190") + foot("M300 466 Q230 506 150 528");
  const wall = stones("M14 226 Q100 222 170 234 Q206 240 232 238");
  const flora = bracken([[40, 270, 1], [190, 262, 1.1], [80, 460, 1.2], [210, 420, .9], [400, 240, 1], [420, 420, 1.1], [40, 120, .9], [230, 70, .9]])
    + thrift([[10, 528], [44, 522], [100, 530], [200, 536], [250, 532], [384, 518], [430, 498], [440, 400], [436, 300], [440, 200], [438, 100]])
    + campion([[340, 470], [400, 470], [220, 470], [120, 400]]) + tufts([[160, 380], [300, 380], [380, 330], [120, 290], [220, 160], [420, 140], [360, 230], [60, 380]]);
  const birds = gulls([[200, 360], [480, 90], [100, 590]]) + (puffinTime() ? flyingPuffins([[0, 596, 1], [500, 630, -1]], 140) : "");
  return lampDefs + ground + shingle + water + slip + tr + wall + flora + jetty + jettyBits + boat + sealrocks + pups + boathouse + post + pier + birds + frost([[250, 330, 150, 90]]) + seasonFx()
    + gate("piToVillage", 300, 26, "Village", 238, 30, "North up the track to the village", "#DCEBC8")
    + gate("piToCliffs", 16, 330, "Cliffs", 60, 296, "West along the path to the cliffs", "#E2E6EA");
}

/* ---------- pi_village: the cottages, the tearoom, the walled garden, the little church, the goats ---------- */
function villageScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="270" cy="250" rx="150" ry="80" style="fill:${C.grass3}"/><ellipse cx="100" cy="580" rx="100" ry="50" style="fill:${C.grass2}"/><ellipse cx="420" cy="500" rx="70" ry="60" style="fill:${C.grass3}"/></g>`;
  const water = sea("M484 0 Q478 100 486 200 Q478 320 486 420 Q478 520 484 640 H520 V0z", "M484 0 Q478 100 486 200 Q478 320 486 420 Q478 520 484 640",
    [[494, 60], [500, 180], [492, 300], [500, 420], [494, 540], [498, 620]], [[480, 90, 9], [484, 260, 8], [478, 380, 10], [482, 500, 8], [480, 600, 9]]);
  const tr = track("M300 626 Q300 594 270 576 Q232 556 232 510 Q232 460 248 404 Q268 330 268 270 Q266 210 236 186 Q206 172 170 168") + track("M14 240 Q120 236 200 232 Q240 230 268 244", 20)
    + foot("M266 250 Q340 214 410 190") + foot("M258 380 Q320 438 400 438") + foot("M232 496 Q190 490 140 488") + foot("M240 456 Q290 462 330 470");
  // the washing line behind the row, flapping over the roofs
  const wash = (() => { const items = [[78, "#E88AA8", 14, 12], [100, C.white, 18, 16], [128, "#6E9ACB", 12, 14], [176, "#F2D06B", 16, 11], [206, C.white, 14, 15], [236, "#C8372D", 12, 12], [258, "#9FD3B2", 14, 13]];
    return `<g pointer-events="none"><path d="M60 22 V58 M282 22 V58" style="stroke:${C.wood2}" stroke-width="2.4"/><path d="M60 24 Q171 34 282 24" fill="none" style="stroke:#6E6A66" stroke-width=".8"/>
    ${items.map(([x, c, w, h], i) => { const y = 24 + Math.sin((x - 60)/222*Math.PI)*10; return `<g transform="translate(${x} ${f1(y)})"><path d="M0 0 h${w} l${i % 2 ? 2 : -1} ${h} h${-w}z" style="fill:${c};stroke:var(--line)" stroke-width=".7"><animateTransform attributeName="transform" type="skewX" values="0;${8 + i % 3*3};0" dur="${1.4 + (i % 3)*.3}s" repeatCount="indefinite"/></path><path d="M2 -1 v3 M${w - 2} -1 v3" style="stroke:#C9A24A" stroke-width="1.2"/></g>`; }).join("")}</g>`; })();
  // the cottage row: four white cottages with slate roofs and painted doors, bicycles against the walls
  const bike = (x, y, col) => `<g pointer-events="none">${sk(`<circle cx="${x - 9}" cy="${y - 6}" r="6" style="fill:none;stroke:#2F2B28" stroke-width="1.4"/><circle cx="${x + 9}" cy="${y - 6}" r="6" style="fill:none;stroke:#2F2B28" stroke-width="1.4"/><path d="M${x - 9} ${y - 6} L${x - 3} ${y - 15} H${x + 6} L${x + 9} ${y - 6} M${x - 3} ${y - 15} L${x} ${y - 6} L${x + 6} ${y - 15} M${x - 5} ${y - 18} h5 M${x + 6} ${y - 15} l-1 -4 h4" fill="none" style="stroke:${col}" stroke-width="1.8"/>`, "")}</g>`;
  const rowArt = [[40, 64, "#2E6DB4"], [105, 58, "#C8372D"], [170, 66, "#3F7A4E"], [235, 60, "#E3B53C"]].map(([x, y, dc], i) => cottage(x, y, 65 - (i < 3 ? 1 : 0), 150 - y, {doorX: [32, 50, 14, 32][i], doorCol: dc, cols: 2, rh: 26, noShade: i < 3})).join("");
  const cottages = `<g data-place="picottages" aria-label="The cottages"><ellipse class="hov" cx="170" cy="166" rx="40" ry="11" style="fill:var(--butter)"/><g pointer-events="none">${rowArt}${bike(84, 150, "#2E6DB4")}${bike(258, 150, "#C8372D")}</g>${lab(170, 190, "Cottages", "#F6EFE3", 10)}</g>`;
  // the tearoom: a low granite cottage, a blue door, a chalkboard, a bench outside facing the sea
  const tea = `<g data-place="pitearoom" aria-label="The tearoom"><ellipse class="hov" cx="410" cy="186" rx="38" ry="11" style="fill:var(--butter)"/>${cottage(346, 76, 128, 94, {stone: true, doorX: 64, doorCol: "#2E6DB4", cols: 3, rh: 30})}
    <g pointer-events="none">${board(410, 110, 64, "TEAROOM", "#2E6DB4", "#FFF6E8", 8)}${chalk(434, 142, 44, ["TEAS · CAKES"], true)}
      ${sk(`<rect x="348" y="152" width="34" height="4" style="fill:${C.wood}"/><path d="M351 156 v10 M379 156 v10" style="stroke:${C.wood2}" stroke-width="2.2"/><rect x="348" y="142" width="34" height="3" style="fill:${C.wood}"/><path d="M352 145 v7 M378 145 v7" style="stroke:${C.wood2}" stroke-width="1.4"/>`, `<rect x="348" y="152" width="34" height="4"/>`)}</g>${lab(410, 210, "Tearoom", "#CFE2EE", 10)}</g>`;
  // the walled garden: high granite walls, a green door, vegetable beds and a fig tree inside
  const garden = (() => { const veg = Array.from({length: 4}, (_, r) => Array.from({length: 7}, (_, c) => { const x = 84 + c*14, y = 372 + r*18, k = r*7 + c;
      return r === 1 ? `<path d="M${x - 3} ${y} q3 -10 6 0" style="fill:#5E9A3A"/><path d="M${x} ${y} v-8" style="stroke:#9AC26A" stroke-width="1"/>` : r === 2 ? `<circle cx="${x}" cy="${y - 3}" r="4.6" style="fill:#7FA86A"/><circle cx="${x}" cy="${y - 3}" r="2.2" style="fill:#A8C890"/>` : `<path d="M${x - 4} ${y} l2 -7 l2 5 l2 -6 l2 8z" style="fill:${k % 2 ? "#6EA844" : "#5E9A3A"}"/>`; }).join("")).join("");
    return `<g data-place="pigarden" aria-label="The walled garden"><ellipse class="hov" cx="140" cy="486" rx="36" ry="11" style="fill:var(--butter)"/>${shade(60, 330, 160, 140)}
    ${sk(`<rect x="60" y="330" width="160" height="140" style="fill:${C.granite[1]}"/><rect x="72" y="350" width="136" height="100" style="fill:#7A6448"/><rect x="72" y="350" width="136" height="6" style="fill:#5E4A36" opacity=".5"/>
      <rect x="60" y="330" width="160" height="20" style="fill:${C.granite[2]}"/>${blocks(60, 332, 160, 18, 1)}<rect x="60" y="448" width="160" height="22" style="fill:${C.granite[2]}"/>${blocks(60, 450, 160, 20, 2)}
      <path d="M84 360 v86 M106 360 v86" style="stroke:#9A8A6A" stroke-width="0"/>${veg}<path d="M130 470 V454 Q140 446 150 454 V470z" style="fill:#3F7A4E"/><path d="M140 452 v18" style="stroke:#2E5A3A" stroke-width="1"/><circle cx="146" cy="462" r="1" style="fill:#E3C26A"/>
      <path d="M186 446 q-2 -24 4 -40" style="stroke:#6E5A48" stroke-width="4" fill="none"/>${[[178, 400, 13], [196, 392, 14], [190, 376, 12], [204, 410, 10], [170, 384, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${ssn() === "winter" ? "#8A7A62" : "#4E8A3A"}"/>`).join("")}
      ${ssn() === "summer" || ssn() === "autumn" ? [[184, 396], [198, 404], [192, 384]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="3" style="fill:#7A4A6A"/>`).join("") : ""}`,
      `<rect x="60" y="330" width="160" height="140"/><rect x="72" y="350" width="136" height="98"/><path d="M130 470 V454 Q140 446 150 454 V470"/>`)}
    ${lab(140, 510, "Walled garden", "#DCEBC8", 10)}</g>`; })();
  // the little grey church: a granite nave, a slate roof, a bell-cote on the west gable
  const church = (() => { const rf = slateRoof(340, 320, 120, 34);
    const lancet = (x, y) => `<path d="M${x} ${y + 22} V${y + 6} Q${x} ${y} ${x + 4} ${y - 2} Q${x + 8} ${y} ${x + 8} ${y + 6} V${y + 22}z" style="fill:${C.glass}"/>`;
    return `<g data-place="pichurch" aria-label="The little church"><ellipse class="hov" cx="400" cy="436" rx="36" ry="11" style="fill:var(--butter)"/>${shade(340, 354, 120, 66)}
    ${sk(`<path d="M342 322 V296 H362 V322z" style="fill:${C.granite[2]}"/><path d="M346 314 V302 Q352 294 358 302 V314z" style="fill:#5A5E62"/><path d="M349 302 q3 -4 6 0 v6 h-6z" style="fill:#C9A24A"/><path d="M340 296 L352 286 L364 296z" style="fill:${C.slate}"/><path d="M352 286 v-8 M348 281 h8" style="stroke:${C.granite[0]}" stroke-width="1.8"/>
      <rect x="340" y="354" width="120" height="66" style="fill:${C.granite[2]}"/>${blocks(340, 356, 120, 64, 4)}${rf.art}${lancet(354, 372)}${lancet(432, 372)}<path d="M386 420 V394 Q400 380 414 394 V420z" style="fill:${C.granite[1]}"/><path d="M390 420 V396 Q400 386 410 396 V420z" style="fill:#5E4A3E"/><path d="M400 388 v32" style="stroke:#3E3229" stroke-width=".8"/>
      <path d="M456 320 v-12 M451 313 h10" style="stroke:${C.granite[0]}" stroke-width="2"/>`,
      `<rect x="340" y="354" width="120" height="66"/>${rf.line}<path d="M342 322 V296 H362 V322"/><path d="M386 420 V394 Q400 380 414 394 V420"/>`)}
    ${lab(400, 458, "Church", "#E2E6EA", 10)}</g>`; })();
  // the goats' paddock: a dry-stone wall with a wooden gate, three shaggy goats
  const goat = (x, y, dir, col, beard = "#E8E2D2", i = 0) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">${sk(`<path d="M-9 -2 v8 M-4 -2 v8 M4 -2 v8 M9 -2 v8" style="stroke:#3A3430" stroke-width="2"/><path d="M-13 -4 Q-14 -15 0 -15 Q12 -15 13 -5 Q8 2 0 1 Q-10 3 -13 -4z" style="fill:${col}"/><path d="M-12 -2 l-1 5 M-6 0 l-1 5 M2 0 l0 5 M8 -1 l1 5" style="stroke:${col}" stroke-width="2.4"/>
    <path d="M10 -13 Q14 -${i % 2 ? 22 : 18} 20 -${i % 2 ? 20 : 16} Q23 -12 19 -9 Q14 -8 10 -10z" style="fill:${col}"/><path d="M19 -9 l-1 6 l-2 -5" style="fill:${beard}"/><path d="M13 -${i % 2 ? 21 : 17} q-4 -6 -8 -5 M15 -${i % 2 ? 21 : 17} q-2 -7 -6 -8" fill="none" style="stroke:#6E6458" stroke-width="1.6"/>`, `<path d="M-13 -4 Q-14 -15 0 -15 Q12 -15 13 -5 Q8 2 0 1 Q-10 3 -13 -4z"/>`)}<circle cx="${i % 2 ? 17 : 17}" cy="-${i % 2 ? 18 : 14}" r=".9" fill="#1E1C1A"/></g>`;
  const goats = `<g data-place="pigoats" aria-label="The goats' paddock"><ellipse class="hov" cx="330" cy="470" rx="28" ry="10" style="fill:var(--butter)"/><g pointer-events="none"><rect x="254" y="486" width="162" height="70" style="fill:${C.grass2}" opacity=".7"/><g filter="url(#wash)" opacity=".5"><ellipse cx="300" cy="530" rx="30" ry="12" fill="#B9A97E"/></g>
    ${stones("M318 484 H252 V558 H418 V484 H342")}${sk(`<path d="M318 478 v12 M342 478 v12 M318 482 h24 M318 487 h24 M318 482 l24 5" style="stroke:${C.wood}" stroke-width="2.2"/>`, `<path d="M318 478 v12 M342 478 v12"/>`)}
    ${goat(290, 520, 1, "#F2EEE4", "#D9D2C0", 0)}${goat(376, 512, -1, "#8A5A3A", "#5E3E2A", 1)}${goat(340, 546, 1, "#3A3634", "#F2EEE4", 0)}</g>${lab(456, 500, "Goats", "#F6EFE3", 10)}</g>`;
  const flora = bracken([[30, 520, 1.1], [60, 600, 1], [200, 600, .9], [440, 600, 1.1], [30, 300, .9], [450, 270, .9], [300, 300, .8]])
    + thrift([[468, 40], [470, 140], [466, 230], [470, 330], [464, 440], [470, 540], [462, 620]]) + campion([[150, 300], [430, 470], [40, 420], [250, 610]])
    + tufts([[120, 270], [200, 290], [320, 270], [420, 250], [160, 560], [80, 520], [400, 590], [30, 380]]);
  return lampDefs + ground + water + tr + flora + wash + cottages + tea + garden + church + goats + gulls([[300, 340], [500, 120]]) + (puffinTime() ? flyingPuffins([[470, 300, 1]], 30) : "")
    + frost([[270, 250, 140, 70], [100, 580, 90, 40]]) + seasonFx()
    + gate("piToLanding", 300, 612, "Landing", 362, 600, "South down the track to the landing", "#CFE2EE")
    + gate("piToLighthouse", 16, 240, "Lighthouse", 68, 208, "West along the wall to the lighthouse", "#F6EFE3");
}

/* ---------- pi_lighthouse: the tower, the keeper's cottage, the foghorn, the bird hide ---------- */
function lighthouseScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="300" cy="320" rx="160" ry="100" style="fill:${C.grass3}"/><ellipse cx="140" cy="520" rx="90" ry="70" style="fill:${C.grass2}"/><ellipse cx="440" cy="560" rx="80" ry="50" style="fill:${C.grass2}"/></g>`;
  const water = sea("M0 0 H520 V36 Q440 46 360 40 Q260 48 160 40 Q90 46 44 40 Q36 120 44 200 Q34 320 42 440 Q36 540 40 640 H0z",
    "M520 36 Q440 46 360 40 Q260 48 160 40 Q90 46 44 40 Q36 120 44 200 Q34 320 42 440 Q36 540 40 640",
    [[200, 14], [320, 20], [440, 10], [80, 16], [12, 120], [16, 260], [10, 400], [18, 540]],
    [[480, 46, 10], [400, 48, 8], [260, 50, 9], [46, 300, 9], [44, 470, 10], [48, 590, 8]]);
  const tr = track("M512 240 Q470 262 430 276 Q380 290 340 250 Q320 222 310 200") + track("M336 250 Q240 272 180 252 Q140 240 116 238", 20)
    + track("M252 262 Q216 340 222 420 Q226 480 250 510 Q262 560 262 626", 20) + foot("M232 490 Q290 512 330 498");
  // the lighthouse: a tall white tower on a granite plinth, the black gallery and lantern, the light turning
  const lh = `<g data-place="pilighthouse" aria-label="The lighthouse"><ellipse class="hov" cx="116" cy="236" rx="30" ry="11" style="fill:var(--butter)"/>${shade(88, 96, 56, 124, 12)}
    ${sk(`<path d="M80 222 V206 H152 V222z" style="fill:${C.granite[1]}"/>${blocks(80, 207, 72, 15, 5)}<path d="M90 206 L97 92 H135 L142 206z" style="fill:${C.white}"/><path d="M92 176 H140" style="stroke:${C.white2}" stroke-width="1.4"/><path d="M94 140 H138" style="stroke:${C.white2}" stroke-width="1.4"/>
      <rect x="88" y="84" width="56" height="8" style="fill:#2A2A2A"/><path d="M90 84 v-9 M98 84 v-9 M106 84 v-9 M126 84 v-9 M134 84 v-9 M142 84 v-9 M89 76 H143" style="stroke:#2A2A2A" stroke-width="1.2"/>
      <rect x="102" y="62" width="28" height="22" style="fill:#F6E7A8"/><path d="M109 62 v22 M116 62 v22 M123 62 v22" style="stroke:#2A2A2A" stroke-width="1.4"/><path d="M98 63 Q116 40 134 63z" style="fill:#2A2A2A"/><circle cx="116" cy="47" r="2.6" style="fill:#2A2A2A"/><path d="M116 45 v-6" style="stroke:#2A2A2A" stroke-width="1.2"/>
      <path d="M109 206 V188 Q116 180 123 188 V206z" style="fill:#2A2A2A"/>${win(112, 150, 8, 11)}${win(113, 110, 7, 10)}`,
      `<path d="M90 206 L97 92 H135 L142 206"/><rect x="80" y="206" width="72" height="16"/><rect x="88" y="84" width="56" height="8"/><rect x="102" y="62" width="28" height="22"/><path d="M98 63 Q116 40 134 63z"/>`)}
    <g pointer-events="none"><circle cx="116" cy="73" r="10" fill="#FFF3B0" opacity=".5"><animate attributeName="opacity" values=".15;.75;.15" dur="5s" repeatCount="indefinite"/></circle>${lampGlow(116, 73, 30)}</g>${lab(116, 260, "Lighthouse", "#F6EFE3", 10)}</g>`;
  // the keeper's cottage: low and white, a weather vane on the ridge, sea kale by the wall
  const keeper = `<g data-place="pikeeper" aria-label="The keeper's cottage"><ellipse class="hov" cx="310" cy="196" rx="38" ry="11" style="fill:var(--butter)"/>${cottage(226, 96, 168, 84, {doorX: 84, doorCol: "#2F4E6E", cols: 4, rh: 28})}
    <g pointer-events="none">${sk(`<path d="M364 96 V74" style="stroke:#2A2A2A" stroke-width="1.6"/><path d="M358 82 h12 M364 76 v12" style="stroke:#2A2A2A" stroke-width=".8"/>`, "")}<g transform="translate(364 74)"><path d="M-12 0 H10 M10 0 l-4 -3 M10 0 l-4 3 M-12 0 l-3 -4 h5z" style="stroke:#2A2A2A;fill:#2A2A2A" stroke-width="1.4"><animateTransform attributeName="transform" type="scale" values="1 1;.7 1;1 1" dur="7s" repeatCount="indefinite"/></path></g>
      <text x="356" y="90" font-family="Klee One,serif" font-size="5" fill="#2A2A2A">W</text><text x="369" y="90" font-family="Klee One,serif" font-size="5" fill="#2A2A2A">E</text>
      ${[[236, 176], [384, 176]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#8FAAA6"/><ellipse cx="${x - 3}" cy="${y - 2}" rx="4" ry="2.4" fill="#A8C2BE"/>${ssn() === "spring" || ssn() === "summer" ? `<circle cx="${x + 2}" cy="${y - 4}" r="1.6" fill="#FFFFFF"/><circle cx="${x + 5}" cy="${y - 3}" r="1.4" fill="#FFFFFF"/>` : ""}`).join("")}</g>${lab(310, 218, "Keeper's cottage", "#CFE2EE", 10)}</g>`;
  // the foghorn: a big red trumpet on a granite plinth, turned to the sea
  const fog = `<g data-place="pifoghorn" aria-label="The foghorn"><ellipse class="hov" cx="460" cy="266" rx="28" ry="10" style="fill:var(--butter)"/>${shade(430, 228, 64, 22, 6)}
    ${sk(`<rect x="430" y="228" width="64" height="22" style="fill:${C.granite[2]}"/>${blocks(430, 230, 64, 20, 9)}<rect x="474" y="212" width="16" height="16" rx="2" style="fill:#6E737A"/><path d="M466 222 v6 M482 212 v-4" style="stroke:#3A3836" stroke-width="2"/>
      <path d="M476 214 L476 224 Q458 226 440 238 L440 196 Q458 210 476 214z" style="fill:${C.red}"/><ellipse cx="440" cy="217" rx="6" ry="21" style="fill:#A82A22"/><ellipse cx="441" cy="217" rx="3.4" ry="16" style="fill:#4A1A16"/><path d="M450 205 Q462 213 474 215" fill="none" style="stroke:#E8735E" stroke-width="1.4"/>`,
      `<rect x="430" y="228" width="64" height="22"/><path d="M476 214 L476 224 Q458 226 440 238 L440 196 Q458 210 476 214z"/><ellipse cx="440" cy="217" rx="6" ry="21"/>`)}
    ${lab(464, 186, "Foghorn", "#F6D6CF", 10)}</g>`;
  // the bird hide: a long low hut of weathered planks, a turf roof, a slot of a window
  const hide = `<g data-place="pihide" aria-label="The bird hide"><ellipse class="hov" cx="330" cy="496" rx="36" ry="11" style="fill:var(--butter)"/>${shade(266, 426, 128, 52)}
    ${sk(`<rect x="266" y="426" width="128" height="52" style="fill:#9A8E7E"/><path d="${Array.from({length: 15}, (_, k) => `M${274 + k*8.4} 426 v52`).join(" ")}" style="stroke:#7E7364" stroke-width="1"/><path d="M262 428 L272 404 H388 L398 428z" style="fill:#5C7A44"/><path d="M262 428 H398" style="stroke:#4A4440" stroke-width="3"/>
      <rect x="276" y="436" width="40" height="6" rx="1" style="fill:#2A2622"/><rect x="344" y="436" width="40" height="6" rx="1" style="fill:#2A2622"/><rect x="321" y="450" width="18" height="28" style="fill:#6E6252"/><circle cx="335" cy="465" r="1" style="fill:#3A3430"/>`,
      `<rect x="266" y="426" width="128" height="52"/><path d="M262 428 L272 404 H388 L398 428z"/><rect x="321" y="450" width="18" height="28"/>`)}
    <g pointer-events="none" fill="none" style="stroke:#7FA858" stroke-width="1.2">${Array.from({length: 12}, (_, k) => `<path d="M${276 + k*10} 405 l-1 -5 M${279 + k*10} 405 l1 -4"/>`).join("")}</g>${board(330, 412, 54, "BIRD HIDE", "#E8E2D2", C.ink, 7)}${lab(330, 520, "Bird hide", "#E8E2D2", 10)}</g>`;
  const gannets = `<g pointer-events="none">${[[300, 22], [420, 26]].map(([x, y], i) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${30 + i*10} 2;0 0" dur="${9 + i*3}s" repeatCount="indefinite"/><path d="M${x - 10} ${y} q5 -3 10 0 q5 -3 10 0" fill="none" style="stroke:#FFFFFF" stroke-width="2.4"/><path d="M${x - 10} ${y} l-2 1 M${x + 10} ${y} l2 1" style="stroke:#2A2A2A" stroke-width="2"/><circle cx="${x}" cy="${y}" r="1.6" fill="#F2DE9A"/></g>`).join("")}</g>`;
  const flora = bracken([[90, 330, 1], [150, 420, 1.1], [100, 580, 1], [440, 380, 1], [470, 470, .9], [400, 590, 1], [200, 140, .8]])
    + thrift([[70, 54], [200, 56], [300, 58], [430, 56], [500, 54], [56, 120], [56, 240], [58, 360], [56, 500], [58, 620]]) + campion([[160, 300], [360, 340], [470, 160], [200, 560]])
    + tufts([[260, 300], [360, 300], [180, 340], [420, 330], [300, 580], [120, 500], [400, 540]]);
  return lampDefs + ground + water + tr + flora + lh + keeper + fog + hide + gannets + gulls([[200, 380], [460, 120]]) + (puffinTime() ? flyingPuffins([[0, 24, 1]], 160) : "")
    + frost([[300, 320, 150, 90]]) + seasonFx()
    + gate("piToVillageE", 504, 240, "Village", 466, 302, "East along the wall to the village", "#DCEBC8")
    + gate("piToCliffsS", 262, 612, "Cliffs", 326, 600, "South along the clifftop to the cliffs", "#E2E6EA");
}

/* ---------- pi_cliffs: the cliff and its seabird ledges, the puffin burrows, the sea glass cove ---------- */
function cliffsScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="300" cy="300" rx="140" ry="90" style="fill:${C.grass3}"/><ellipse cx="460" cy="110" rx="60" ry="80" style="fill:${C.grass2}"/></g>`;
  // the sea far below on the west, the sheer granite cliff face with its ledges, the turf lip along the top
  const cliffD = "M50 0 H124 Q118 80 126 160 Q118 260 126 360 Q118 460 124 640 H50 Q44 520 52 400 Q44 260 52 120 Q46 60 50 0z";
  const westSea = `<g pointer-events="none">${sk(`<path d="M0 0 H54 Q46 60 52 120 Q44 260 52 400 Q44 520 52 640 H0z" style="fill:${C.sea}"/>`, `<path d="M54 0 Q46 60 52 120 Q44 260 52 400 Q44 520 52 640"/>`)}<path d="M50 0 Q42 60 48 120 Q40 260 48 400 Q40 520 48 640" fill="none" style="stroke:${C.foam}" stroke-width="3" opacity=".75"/>${waves([[8, 60], [20, 200], [6, 330], [18, 460], [6, 560]])}</g>`;
  const ledgeYs = [70, 104, 140, 176, 212, 248, 284, 320, 360, 404, 452, 500, 548];
  const cliff = `<g pointer-events="none">${sk(`<path d="${cliffD}" style="fill:${C.granite[1]}"/>${[[56, 0, 22], [86, 0, 18]].map(([x, , w]) => `<path d="M${x} 0 V640" style="stroke:${C.granite[0]}" stroke-width="${w}" opacity=".35"/>`).join("")}`, `<path d="${cliffD}"/>`)}
    <path d="${ledgeYs.map((y, i) => `M${56 + (i % 3)*3} ${y} H${116 - (i % 2)*4}`).join(" ")}" style="stroke:${C.rock3}" stroke-width="2.4"/><path d="${ledgeYs.map((y, i) => `M${58 + (i % 3)*3} ${y + 1.6} H${114 - (i % 2)*4}`).join(" ")}" style="stroke:#C9C8C2" stroke-width="1" opacity=".7"/>
    <path d="M70 0 l4 60 l-6 50 l8 70 M100 90 l-4 80 l6 60 M78 300 l6 70 l-8 80 M104 420 l-4 90 l4 70" fill="none" style="stroke:${C.rock3}" stroke-width="1.2" opacity=".7"/>
    <path d="M70 108 q2 20 -2 40 M96 180 q3 18 0 30 M84 252 q2 16 -1 26" fill="none" style="stroke:#F4F2EA" stroke-width="3" opacity=".7"/>
    <path d="M120 0 Q114 80 122 160 Q114 260 122 360 Q114 460 120 640" fill="none" style="stroke:${C.turf}" stroke-width="8" stroke-linecap="round"/></g>`;
  // the seabirds packed on the ledges: gannets up top, guillemots and razorbills below, shouting at each other
  const gannet = (x, y) => `<ellipse cx="${x}" cy="${y - 4}" rx="3.4" ry="4" fill="#FBFAF4" style="stroke:#5A5A56" stroke-width=".4"/><circle cx="${x + 1}" cy="${y - 8.4}" r="2.2" fill="#F2DE9A"/><path d="M${x + 2.6} ${y - 8.6} l3 1" style="stroke:#8A9AA8" stroke-width="1"/><path d="M${x - 3} ${y - 2} l-1.4 2" style="stroke:#2A2A2A" stroke-width="1.2"/>`;
  const auk = (x, y, back) => `<ellipse cx="${x}" cy="${y - 4}" rx="2.6" ry="4.2" fill="${back}"/><ellipse cx="${x + .8}" cy="${y - 3.4}" rx="1.4" ry="3" fill="#FBFAF4"/><circle cx="${x + .4}" cy="${y - 8.6}" r="1.9" fill="${back}"/><path d="M${x + 2} ${y - 8.8} l2.4 .6" style="stroke:${back}" stroke-width="1"/>`;
  const birds = ledgeYs.map((y, i) => { const n = 8 - (i % 2); return Array.from({length: n}, (_, k) => { const x = 62 + (i % 3)*3 + k*(48/n) + rnd(i*11 + k)*3;
    return i < 4 ? gannet(x, y) : auk(x, y, (i + k) % 3 ? "#3A2E26" : "#1E1C1A"); }).join(""); }).join("");
  const ledges = `<g data-place="piledges" aria-label="The seabird ledges: gannets, guillemots and razorbills"><ellipse class="hov" cx="160" cy="200" rx="30" ry="11" style="fill:var(--butter)"/><g pointer-events="none">${birds}</g>${lab(170, 176, "Seabird ledges", "#F6EFE3", 10)}</g>`;
  // the cove: a steep green bank down to a little pebble beach between granite rocks
  const bank = `<g pointer-events="none"><g filter="url(#wash)" opacity=".75"><path d="M126 480 Q240 470 330 478 Q420 474 520 466 V610 H120z" fill="${C.grass2}"/><path d="M140 510 Q240 500 340 508 Q430 502 510 494 V580 Q420 576 360 580 H160z" fill="${C.turf}" opacity=".6"/></g>
    <path d="M126 478 Q240 468 330 476 Q420 472 506 464" fill="none" style="stroke:${C.turf}" stroke-width="2.4" stroke-dasharray="7 4" opacity=".8"/>
    <path d="${Array.from({length: 36}, (_, k) => `M${f1(140 + rnd(k*7)*360)} ${f1(488 + rnd(k*13)*60)} l-4 9`).join(" ")}" style="stroke:#557E38" stroke-width="1.2" opacity=".6"/></g>`
    + rocks([[160, 500, 9], [440, 510, 10], [480, 540, 12], [140, 540, 8], [462, 580, 11], [500, 590, 8]]);
  const beachD = "M150 600 Q148 572 168 558 Q250 540 340 552 Q362 566 362 600z";
  const glints = [[180, 580, "#7FC79A"], [212, 566, "#FFFFFF"], [238, 588, "#7FB8E0"], [270, 572, "#9FD3B2"], [300, 586, "#FFFFFF"], [326, 566, "#5E9AD0"], [200, 592, "#9FD3B2"], [284, 594, "#E2F2F6"], [250, 562, "#7FC79A"]];
  const cove = `<g pointer-events="none">${sk(`<path d="${beachD}" style="fill:#CFC6B2"/>`, `<path d="${beachD}"/>`)}${Array.from({length: 40}, (_, k) => `<ellipse cx="${f1(160 + rnd(k*3)*196)}" cy="${f1(558 + rnd(k*5)*40)}" rx="${f1(2 + rnd(k)*2.4)}" ry="${f1(1.4 + rnd(k)*1.4)}" fill="${["#A9A396", "#B9B2A2", "#8E8A82", "#DAD3C2"][k % 4]}"/>`).join("")}
    ${glints.map(([x, y, c], i) => `<path d="M${x - 2.4} ${y} l2 -2.4 l2.6 .8 l-.6 2.6z" style="fill:${c};stroke:#5A6A72" stroke-width=".4"/><circle cx="${x + 1}" cy="${y - 2}" r="1.2" fill="#FFFFFF"><animate attributeName="opacity" values="0;1;0" dur="${2.4 + (i % 4)*.6}s" begin="${-i*.7}s" repeatCount="indefinite"/></circle>`).join("")}</g>`
    + rocks([[136, 580, 18], [128, 600, 12], [388, 580, 26], [410, 600, 16], [372, 596, 12]], C.rock3);
  const bottomSea = sea("M0 600 Q100 596 150 604 L362 604 Q440 598 520 602 V640 H0z", "M0 600 Q100 596 150 604 L362 604 Q440 598 520 602", [[180, 620], [300, 628], [420, 618], [480, 632], [60, 626]]);
  const coveP = `<g data-place="picove" aria-label="The sea glass cove"><ellipse class="hov" cx="250" cy="540" rx="32" ry="11" style="fill:var(--butter)"/>${lab(250, 618, "Sea glass cove", "#CFE2EE", 10)}</g>`;
  const tr = track("M262 14 Q258 80 270 150 Q284 220 300 262", 20) + track("M300 330 Q360 350 430 336 Q480 330 512 330", 20) + foot("M268 170 Q220 196 160 202")
    + foot("M300 330 Q340 380 400 420 L196 456 L388 494 L250 538", 14);
  // the puffin burrows: holes all through the clifftop turf, each with its spill of earth; puffins April to July
  const holes = [[230, 262], [256, 246], [344, 252], [372, 268], [222, 300], [386, 300], [240, 334], [270, 352], [334, 354], [368, 336], [300, 376], [206, 368], [400, 362], [318, 236]];
  const stand = puffinTime() ? [[230, 262, 1], [344, 252, -1], [386, 300, -1], [240, 334, 1], [334, 354, -1], [300, 376, 1], [206, 368, 1], [400, 362, -1]] : [];
  const burrows = `<g data-place="piburrows" aria-label="The puffin burrows"><ellipse class="hov" cx="300" cy="300" rx="34" ry="12" style="fill:var(--butter)"/><g pointer-events="none">
    ${holes.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 3}" rx="9" ry="3.2" fill="#B39A72" opacity=".8"/><ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#2E2A24"/><path d="M${x - 7} ${y - 2} q7 -6 14 0" fill="none" style="stroke:${C.turf}" stroke-width="2"/>`).join("")}
    ${thrift([[214, 284], [262, 270], [356, 276], [312, 352], [252, 380], [380, 380], [286, 236]])}${stand.map(([x, y, d]) => puffin(x + d*7, y + 4, d, 1.05)).join("")}</g>${lab(300, 220, "Puffin burrows", "#F6D6CF", 10)}</g>`;
  const wall = stones("M420 14 Q428 100 466 160 Q488 196 506 210");
  const flora = bracken([[456, 70, 1], [486, 120, .9], [470, 230, 1], [440, 420, 1.1], [180, 420, 1], [160, 300, .9], [480, 400, .9]])
    + thrift([[134, 60], [138, 130], [134, 250], [138, 330], [134, 420], [136, 460], [180, 480], [300, 478], [420, 472]]) + campion([[200, 100], [340, 120], [170, 360], [360, 440]])
    + tufts([[200, 160], [340, 180], [400, 220], [200, 440], [300, 420], [460, 300], [380, 100]]);
  return lampDefs + ground + westSea + cliff + bank + bottomSea + cove + tr + wall + flora + ledges + burrows + coveP + gulls([[30, 150], [40, 420], [380, 560]])
    + (puffinTime() ? flyingPuffins([[0, 620, 1], [30, 300, 1]], 60) : "") + frost([[300, 300, 140, 80]]) + seasonFx()
    + gate("piToLighthouseN", 262, 26, "Lighthouse", 330, 30, "North along the clifftop to the lighthouse", "#F6EFE3")
    + gate("piToLandingE", 504, 330, "Landing", 456, 296, "East down to the landing", "#CFE2EE");
}

export function puffinArt(scene){
  return scene === "pi_village" ? villageScreen() : scene === "pi_lighthouse" ? lighthouseScreen() : scene === "pi_cliffs" ? cliffsScreen() : landingScreen();
}
// The crossing to Puffin Isle (both ways): the little blue island boat in a choppy deep blue sea; going out, a green
// hump of an island with granite cliffs and a white lighthouse; coming home, Honeybrook's green hills; puffins
// whirring low over the waves (in their months; gulls the rest of the year)
export function piFerryRideArt(home){
  const birds = puffinTime() ? [[150, 50], [190, 58], [226, 46]].map(([x, y], i) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${30 + i*8} ${-2 + i*2};${60 + i*16} 0" dur="${2.6 + i*.5}s" repeatCount="indefinite"/><ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" fill="#262422" stroke="none"/><circle cx="${x + 4.6}" cy="${y - .4}" r="2" fill="#F2F0EA" stroke="none"/><path d="M${x + 6} ${y - 1} l3 1 l-3 1z" fill="#F07A22" stroke="none"/><path d="M${x - 2} ${y - 1} l-2 -5 l4 4z M${x - 2} ${y + 1} l-2 5 l4 -4z" fill="#3A3634" stroke="none"><animate attributeName="opacity" values="1;.25;1" dur=".16s" repeatCount="indefinite"/></path></g>`).join("")
    : `<g fill="none" stroke-width="1.4">${[[160, 24], [196, 16]].map(([x, y], i) => `<path d="M${x - 8} ${y} q4 -6 8 0 q4 -6 8 0"><animateTransform attributeName="transform" type="translate" values="0 0;${10 + i*6} ${-3 + i*4};0 0" dur="${3 + i}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    ${home ? `<path d="M0 56 Q75 34 150 50 T300 50 V60 H0z" fill="#9CC27E"/><path d="M180 56 Q240 40 300 50 T420 52 V60 H180z" fill="#B2CF92"/>`
      : `<path d="M380 56 Q384 40 400 36 Q440 22 500 24 Q560 28 590 56z" fill="${C.grass}"/><path d="M380 56 Q384 40 400 36 L404 56z" fill="${C.granite[1]}"/><path d="M430 30 q4 -2 8 0 M470 26 q4 -2 8 0" fill="none" stroke="${C.turf}" stroke-width="1"/>
        <path d="M534 26 L536 10 H542 L544 26z" fill="${C.white}"/><rect x="534" y="5" width="10" height="5" fill="#2A2A2A"/><path d="M533 5 Q539 0 545 5z" fill="#2A2A2A"/><rect x="548" y="20" width="14" height="6" fill="${C.white}"/><path d="M547 20 l7 -4 l7 4z" fill="${C.slate}"/>`}
    <path d="M0 56 H600 V90 H0z" fill="${C.sea}"/><path d="M0 56 H600" stroke="${C.foam}" stroke-width="1.6"/>${[20, 90, 150, 220, 290, 350, 420, 480, 550].map((x, i) => `<path d="M${x} ${66 + (i % 3)*8} q5 -6 10 0 q5 6 10 0" fill="none" stroke="${C.foam}" stroke-width="1.4"><animateTransform attributeName="transform" type="translate" values="0 0;5 -1;0 0" dur="${1.4 + (i % 3)*.4}s" repeatCount="indefinite"/></path>`).join("")}
    ${birds}</g></svg>`;
  const boat = `<div class="taxiboat"><svg viewBox="0 0 160 60" width="190" height="71" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.4" stroke-linejoin="round">
    <path d="M12 34 H152 Q150 46 138 54 H28 Q16 46 12 34z" fill="${C.boat}"/><path d="M13 37 H151" stroke="${C.white}" stroke-width="3"/><path d="M18 45 H146" stroke="${C.red}" stroke-width="1.2"/>
    <rect x="104" y="10" width="30" height="24" rx="2" fill="${C.white}"/><rect x="109" y="14" width="20" height="9" rx="1.5" fill="#9DB8C4"/><path d="M101 10 h36 l-4 -5 h-28z" fill="${C.boat}"/><path d="M119 5 v-4" /><path d="M119 1 h8 l-2 2 l2 2 h-8" fill="#E3B53C"/>
    <circle cx="44" cy="28" r="4.4" fill="#F2D3BC"/><path d="M38 34 q6 -6 12 0" fill="#C8372D"/><circle cx="66" cy="28" r="4.4" fill="#C99A78"/><path d="M60 34 q6 -6 12 0" fill="#E3B53C"/><circle cx="88" cy="28" r="4.4" fill="#F2D3BC"/><path d="M82 34 q6 -6 12 0" fill="#3F7A4E"/></g></svg></div>`;
  return bank + boat;
}
