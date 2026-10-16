// Bali (round 218): four corners of Bali, one to a screen. Nothing like Jeju's black basalt and tangerines, Kyoto's timber
// lanes or Cinque Terre's painted towers: tropical, green, warm and gentle. Deep greens, black volcanic stone and white
// coral stone, red brick and gold, palm thatch, terracotta, frangipani white and pink, and a little canang sari (a
// palm-leaf tray of coloured petals) on every step. Tall bamboo penjor poles curve over the paths; split gates (candi
// bentar: a carved stone tower cut in two, the doorway between) mark every way in.
//   ba_seminyak:    the golden beach, the sea along the bottom, the wooden jetty and the ferry, the warung, the beanbags
//                   and umbrellas, the sunset spot and its coconut cart, a jukung pulled up on the sand
//   ba_ubud:        the market with its tiered roofs, the silversmith, the palace's split gate and brick wall, the monkey
//                   forest under the banyans
//   ba_tegallalang: the rice terraces stepping down the valley, the water channels and the ducks, the jungle swing, the
//                   bamboo coffee and cacao house on stilts
//   ba_uluwatu:     the limestone cliffs and the surf far below, the cliff temple with its black-thatched meru, the
//                   amphitheatre and its fire pit (lit for the kecak at sunset), the cliff path and its monkeys
// No seasons to speak of: from November to March (the rains) everything is a shade greener.
import { dayKey, localHM } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { kecakOn } from "../data/bali.js";

const C = {sand: "#EED6A0", sand2: "#E2C487", sand3: "#F6E7C0", wetsand: "#D8BD86",
  sea: "#2BB0B6", sea2: "#5ACAC6", sea3: "#1C8E9E", foam: "#F2FBF8",
  vstone: ["#4C4945", "#3C3A37", "#625E58"], vline: "#2A2826", moss: "#6E8E44",
  coral: ["#E9E2CF", "#D8CFB8", "#F4EFE2"], cline: "#A39A84",
  brick: "#B8573A", brick2: "#9C452E", bline: "#6E2E20", gold: "#D9A83A", gold2: "#F1D06A",
  thatch: "#BC9658", thatch2: "#94723F", ijuk: "#2E2925", ijuk2: "#4A4038",
  tile: "#C2623F", tile2: "#A24E32", wood: "#7A5238", wood2: "#583B29", bamboo: "#D8C27A", bamboo2: "#AE9450",
  ink: "#2F2B28", white: "#FBF8EE", glass: "#3A4448", jungle: ["#3E7A3A", "#2F6630", "#4E8C42"],
  rice: ["#9ED062", "#78B446", "#AEDA72"], red: "#D2483A", blue: "#3E7FB8", turq: "#2BA6A8", navy: "#24395E"};
const mon = () => +dayKey().slice(5, 7);
const wet = () => mon() >= 11 || mon() <= 3;   // the rains: a shade greener
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);
// (every path filter gets a full-screen box, so a flat path isn't clipped to a sliver by the filter region)
const BB = `<rect width="520" height="640" fill="none" style="stroke:none"/>`;

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 10) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#3E4A2E" opacity=".18" pointer-events="none"/>`;
// a sign board with lettering
const board = (x, y, w, t, bg = C.white, fg = C.ink, size = 8) => `<rect x="${f1(x - w/2)}" y="${y}" width="${w}" height="${size + 5}" rx="2" style="fill:${bg};stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x}" y="${f1(y + size + 1)}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="${size}" fill="${fg}" pointer-events="none">${t}</text>`;
// a chalkboard on legs
const chalk = (x, y, w, lines) => { const h = lines.length*8 + 6;
  return `<g pointer-events="none"><path d="M${x + 4} ${y + h} l-3 10 M${x + w - 4} ${y + h} l3 10" style="stroke:${C.wood2}" stroke-width="2"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" style="fill:#33403B;stroke:${C.wood}" stroke-width="2"/>
  ${lines.map((t, i) => `<text x="${x + w/2}" y="${y + 10 + i*8}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6.2" fill="#F2F0E6">${t}</text>`).join("")}</g>`; };
// rough stone courses on a wall face
const blocks = (x, y, w, h, seed = 0, op = .45, col = C.vline) => { let d = "";
  for (let ry = y, k = 0; ry < y + h - 1; ry += 7, k++) { d += `M${x} ${ry} H${x + w} `; for (let bx = x + 3 + rnd(seed + k)*10; bx < x + w - 3; bx += 10 + rnd(seed + k*7 + bx)*9) d += `M${f1(bx)} ${ry} v${Math.min(7, y + h - ry)} `; }
  return `<path d="${d}" style="stroke:${col}" stroke-width=".6" opacity="${op}" fill="none"/>`; };
// thin red brick courses
const bricks = (x, y, w, h) => { let d = "";
  for (let ry = y, k = 0; ry < y + h - 1; ry += 4, k++) { d += `M${x} ${f1(ry)} H${x + w} `; for (let bx = x + (k % 2 ? 5 : 0) + 3; bx < x + w; bx += 10) d += `M${f1(bx)} ${f1(ry)} v4 `; }
  return `<path d="${d}" style="stroke:${C.bline}" stroke-width=".5" opacity=".45" fill="none"/>`; };
// a thick hipped roof of alang-alang thatch (ijuk: the black palm-fibre thatch of the shrines)
function thatch(x, y, w, rh, col = C.thatch, k = C.thatch2){
  const shape = `M${x - 8} ${y + rh} L${x + 12} ${y} H${x + w - 12} L${x + w + 8} ${y + rh}z`, n = Math.max(3, Math.floor(w/5));
  const straws = Array.from({length: n}, (_, i) => { const t = i/(n - 1); return `M${f1(x + 12 + t*(w - 24))} ${y + 2} L${f1(x - 6 + t*(w + 12))} ${y + rh - 2}`; }).join(" ");
  return {art: `<path d="${shape}" style="fill:${col}"/><path d="${straws}" style="stroke:${k}" stroke-width=".7" opacity=".65"/><path d="M${x - 8} ${y + rh - 1} H${x + w + 8}" style="stroke:${k}" stroke-width="3.4"/><path d="M${x + 12} ${y + 1} H${x + w - 12}" style="stroke:${k}" stroke-width="3"/>`, line: `<path d="${shape}"/>`};
}
// a terracotta tiled roof with a dark ridge and little upturned ends
function tiles(x, y, w, rh, col = C.tile){
  const shape = `M${x - 6} ${y + rh} L${x + 9} ${y} H${x + w - 9} L${x + w + 6} ${y + rh}z`;
  const rows = Array.from({length: Math.floor(rh/5)}, (_, k) => { const ry = y + 5 + k*5, t = (ry - y)/rh; return `M${f1(x + 9 - 15*t)} ${ry} H${f1(x + w - 9 + 15*t)}`; }).join(" ");
  return {art: `<path d="${shape}" style="fill:${col}"/><path d="${rows}" style="stroke:${C.tile2}" stroke-width=".7"/><path d="M${x + 9} ${y + 1} H${x + w - 9}" style="stroke:#7A3A26" stroke-width="2.8"/><path d="M${x + 9} ${y + 1} l-4 -5 M${x + w - 9} ${y + 1} l4 -5" style="stroke:#7A3A26" stroke-width="2"/>`, line: `<path d="${shape}"/>`};
}
// grass (greener in the rains), earth lanes, stone-paved paths, trodden sand
const GR = () => wet() ? ["#74B353", "#62A245", "#8AC469"] : ["#8CBD5D", "#7AAD4E", "#A1CA73"];
const lawn = patches => { const [g, g2, g3] = GR(); return `<rect width="520" height="640" style="fill:${g}"/><g filter="url(#wash)" opacity=".55" pointer-events="none">${patches.map(([x, y, rx, ry, k]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${k ? g2 : g3}"/>`).join("")}</g>`; };
const lane = (d, w = 20) => `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:#B59A6C" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#D6BF92" stroke-width="${w - 6}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const paved = (d, w = 26, light = false) => `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:${light ? "#B9B19C" : "#9E9786"}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${light ? "#E8E2D0" : "#CBC4B0"}" stroke-width="${w - 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${light ? "#D9D2BE" : "#BAB3A0"}" stroke-width="${w - 12}" stroke-dasharray="5 6" opacity=".9"/></g>`;
const sandway = (d, w = 24) => `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:${C.sand2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/><path d="${d}" fill="none" style="stroke:#E8CF98" stroke-width="${w - 10}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/></g>`;
const tufts = pts => `<g pointer-events="none" fill="none" style="stroke:#4E8436" stroke-width="1.1" opacity=".7">${pts.map(([x, y]) => `<path d="M${x - 3} ${y} l-1 -4 M${x} ${y} v-5 M${x + 3} ${y} l1 -4"/>`).join("")}</g>`;
const waves = (pts, col = C.foam) => `<g pointer-events="none" style="stroke:${col}" stroke-width="1.5" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${3.5 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// a coconut palm: a curving ringed trunk, feathery fronds, a cluster of coconuts
function palm(x, y, s = 1, lean = 1, i = 0){
  const tx = x + lean*16*s, ty = y - 66*s, g = ["#4E8C3A", "#5FA046", "#3F7A32"];
  const trunk = `M${x} ${y} Q${f1(x + lean*s)} ${f1(y - 38*s)} ${f1(tx)} ${f1(ty)}`;
  const fronds = [[-16, 18], [18, 19], [-34, 9], [34, 11], [-26, -8], [27, -7], [-10, -18], [10, -17]].map(([dx, dy], k) => {
    const d = `M${f1(tx)} ${f1(ty)} Q${f1(tx + dx*.5*s)} ${f1(ty + dy*.5*s - 11*s)} ${f1(tx + dx*s)} ${f1(ty + dy*s)}`;
    return `<path d="${d}" fill="none" style="stroke:${g[(k + i) % 3]}" stroke-width="${f1(7.5*s)}" stroke-dasharray="1.7 .9"/><path d="${d}" fill="none" style="stroke:#356A28" stroke-width="${f1(1.1*s)}"/>`; }).join("");
  return `<g pointer-events="none"><ellipse cx="${f1(x + 6*s)}" cy="${y + 1}" rx="${f1(13*s)}" ry="${f1(3.4*s)}" fill="#3E4A2E" opacity=".2"/>${sk(`<path d="${trunk}" fill="none" style="stroke:#8A7458" stroke-width="${f1(4.8*s)}" stroke-linecap="round"/><path d="${trunk}" fill="none" style="stroke:#6A5640" stroke-width="${f1(4.8*s)}" stroke-dasharray="1 3.6" opacity=".7"/>${fronds}
    ${[[-2.6, 3], [2.4, 3.4], [0, 6]].map(([dx, dy], k) => `<circle cx="${f1(tx + dx*s)}" cy="${f1(ty + dy*s)}" r="${f1(2.6*s)}" style="fill:${k === 1 ? "#A6A040" : "#7E8A36"}"/>`).join("")}`, "")}</g>`;
}
// a frangipani tree: a grey forked trunk, leaves in rosettes at the tips, white (or pink) flowers with gold hearts
function frangipani(x, y, s = 1, pink = false){
  const tips = [[-13, -30], [2, -35], [14, -28]];
  const br = `M${x} ${y} V${f1(y - 14*s)} ${tips.map(([dx, dy]) => `M${x} ${f1(y - 14*s)} Q${f1(x + dx*.4*s)} ${f1(y - 22*s)} ${f1(x + dx*s)} ${f1(y + dy*s)}`).join(" ")}`;
  const crown = tips.map(([dx, dy], t) => { const cx = x + dx*s, cy = y + dy*s;
    return [-160, -125, -90, -55, -20].map((a, k) => `<ellipse cx="${f1(cx + Math.cos(a*Math.PI/180)*6*s)}" cy="${f1(cy + Math.sin(a*Math.PI/180)*5*s)}" rx="${f1(6.5*s)}" ry="${f1(2.6*s)}" transform="rotate(${a} ${f1(cx + Math.cos(a*Math.PI/180)*6*s)} ${f1(cy + Math.sin(a*Math.PI/180)*5*s)})" style="fill:${k % 2 ? "#3F7A36" : "#4E8C40"}"/>`).join("")
      + [[-3, -4], [2, -6], [4, -1], [-1, 0]].map(([fx, fy], k) => `<circle cx="${f1(cx + fx*s)}" cy="${f1(cy + fy*s)}" r="${f1(2.3*s)}" style="fill:${pink && (k + t) % 2 ? "#F2A3BA" : "#FFFDF2"}"/><circle cx="${f1(cx + fx*s)}" cy="${f1(cy + fy*s)}" r="${f1(.9*s)}" fill="#F2C53A"/>`).join(""); }).join("");
  return `<g pointer-events="none"><ellipse cx="${f1(x + 4*s)}" cy="${y + 1}" rx="${f1(14*s)}" ry="${f1(3.4*s)}" fill="#3E4A2E" opacity=".2"/>${sk(`<path d="${br}" fill="none" style="stroke:#8C8478" stroke-width="${f1(2.8*s)}" stroke-linecap="round"/>${crown}`, "")}</g>`;
}
// a great banyan: a dark spreading crown, a fluted trunk, aerial roots hanging to the ground
function banyan(x, y, s = 1){
  const blobs = [[-42, -58, 28], [42, -58, 28], [0, -76, 32], [-22, -46, 24], [24, -44, 24], [0, -56, 28], [-50, -40, 18], [50, -40, 18]];
  const roots = Array.from({length: 11}, (_, k) => { const rx = x + (-40 + k*8 + rnd(k + x)*4)*s; return `M${f1(rx)} ${f1(y - 34*s)} V${f1(y - rnd(k*3 + y)*6*s)}`; }).join(" ");
  return `<g pointer-events="none"><ellipse cx="${f1(x + 6*s)}" cy="${y + 2}" rx="${f1(56*s)}" ry="${f1(10*s)}" fill="#1E3A1E" opacity=".25"/>${sk(`<path d="${roots}" style="stroke:#7A6A56" stroke-width="${f1(1.4*s)}" fill="none"/><path d="M${f1(x - 9*s)} ${y} Q${f1(x - 6*s)} ${f1(y - 20*s)} ${f1(x - 8*s)} ${f1(y - 40*s)} H${f1(x + 8*s)} Q${f1(x + 6*s)} ${f1(y - 20*s)} ${f1(x + 10*s)} ${y}z" style="fill:#7E705C"/><path d="M${f1(x - 3*s)} ${y} V${f1(y - 38*s)} M${f1(x + 3*s)} ${y} V${f1(y - 38*s)}" style="stroke:#5E5244" stroke-width="1.2"/>
    ${blobs.map(([dx, dy, r], k) => `<circle cx="${f1(x + dx*s)}" cy="${f1(y + dy*s)}" r="${f1(r*s)}" style="fill:${["#2F6A30", "#25582A", "#3A7636"][k % 3]}"/>`).join("")}`, "")}</g>`;
}
const bush = (x, y, r = 12, k = 0) => `<g pointer-events="none">${sk([[-r*.6, 0, r*.7], [r*.6, 0, r*.7], [0, -r*.4, r*.8]].map(([dx, dy, rr], j) => `<circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="${f1(rr)}" style="fill:${C.jungle[(j + k) % 3]}"/>`).join(""), "")}</g>`;
// a canang sari: a little palm-leaf tray of petals (red, white, gold, violet), a stick of incense smoking
const canang = (x, y, s = 1) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-3.5" width="10" height="7" rx="1.2" style="fill:#9DBB4E;stroke:#5E7A2E" stroke-width=".6"/><circle cx="0" cy="-1.8" r="1.6" fill="#E8463A"/><circle cx="2.8" cy="0" r="1.6" fill="#FFFFFF"/><circle cx="0" cy="1.8" r="1.6" fill="#F2C53A"/><circle cx="-2.8" cy="0" r="1.6" fill="#7A5AC8"/><circle cx="0" cy="0" r="1" fill="#F49AB4"/>
  <path d="M1 -1 l2 -7" style="stroke:#8A4A2A" stroke-width=".6"/><circle cx="3" cy="-9" r="1.4" fill="#FFFFFF" opacity="0"><animate attributeName="cy" values="-9;-22" dur="${3 + (x % 5)*.3}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".75;0" dur="${3 + (x % 5)*.3}s" repeatCount="indefinite"/></circle></g>`;
// a penjor: a tall bamboo pole hung with palm-leaf fringes, a little shrine part way up, curving over at the top with a
// swaying ornament (dir 1 curves to the right)
function penjor(x, y, dir = 1, h = 100){
  const ex = x + dir*42, ey = y - h + 16;
  const pole = `M${x} ${y} V${f1(y - h*.55)} Q${x} ${y - h} ${x + dir*24} ${y - h} Q${x + dir*38} ${y - h} ${ex} ${ey}`;
  return `<g pointer-events="none">${sk(`<path d="${pole}" fill="none" style="stroke:#C2A862" stroke-width="3.2" stroke-linecap="round"/><path d="${pole}" fill="none" style="stroke:#EEDC94" stroke-width="7" stroke-dasharray="1 2.6" opacity=".9"/>
    <rect x="${x - 6}" y="${f1(y - h*.36)}" width="12" height="9" style="fill:#E6D08A"/><path d="M${x - 8} ${f1(y - h*.36)} l8 -6 l8 6z" style="fill:${C.thatch}"/>`, `<rect x="${x - 6}" y="${f1(y - h*.36)}" width="12" height="9"/>`)}
    <g><animateTransform attributeName="transform" type="rotate" values="-5 ${ex} ${ey};5 ${ex} ${ey};-5 ${ex} ${ey}" dur="4.4s" repeatCount="indefinite"/><path d="M${ex} ${ey} l-5 8 l5 8 l5 -8z" fill="#F2D86A" style="stroke:#B49A3A" stroke-width=".6"/><path d="M${ex - 3} ${ey + 14} v12 M${ex} ${ey + 16} v14 M${ex + 3} ${ey + 14} v12" style="stroke:#E8C84A" stroke-width="1.2"/></g></g>`;
}
// a candi bentar: a stepped, carved tower cut clean in two, the halves standing apart with the way between
function candi(cx, by, w, h, gap, col, trim, o = {}){
  const P = f => f1(-f*h);
  const prof = `M0 0 H${w} V${P(.26)} H${f1(w*.9)} V${P(.31)} H${f1(w*.84)} V${P(.56)} H${f1(w*.72)} V${P(.62)} H${f1(w*.64)} V${P(.78)} H${f1(w*.5)} V${P(.84)} H${f1(w*.4)} V${P(.94)} H${f1(w*.2)} V${-h} H0z`;
  const tex = o.brick ? bricks(0, -.26*h, w, .26*h) + bricks(0, -.56*h, w*.84, .25*h) + bricks(0, -.78*h, w*.64, .16*h) : blocks(0, -.26*h + 2, w, .26*h - 2, cx, .3, o.line || C.cline) + blocks(0, -.56*h + 2, w*.84, .25*h - 2, cx + 3, .3, o.line || C.cline);
  const bands = [[.26, w], [.56, w*.84], [.78, w*.64], [.94, w*.4]].map(([f, bw]) => `<rect x="0" y="${f1(-f*h - 2)}" width="${f1(bw + 1.5)}" height="3.4" style="fill:${trim}"/>`).join("");
  const orn = [[w, .26], [w*.84, .56], [w*.64, .78], [w*.4, .94]].map(([ox, f]) => `<path d="M${f1(ox - 2)} ${f1(-f*h - 1)} q3 -3 2 -8 q3 4 0 8z" style="fill:${o.gold || C.gold}"/>`).join("");
  const carve = `<path d="M${f1(w*.2)} ${P(.44)} h${f1(w*.5)} M${f1(w*.16)} ${P(.7)} h${f1(w*.36)} M${f1(w*.2)} ${P(.13)} h${f1(w*.56)}" style="stroke:${o.carve || "#3A2A20"}" stroke-width="2" stroke-dasharray="2 2" opacity=".35"/>`;
  const half = sk(`<path d="${prof}" style="fill:${col}"/>${tex}${bands}${carve}${orn}<rect x="0" y="${-h}" width="3" height="${h}" style="fill:#000" opacity=".12"/>`, `<path d="${prof}"/>`);
  return `<g pointer-events="none"><g transform="translate(${f1(cx + gap/2)} ${by})">${half}</g><g transform="translate(${f1(cx - gap/2)} ${by}) scale(-1 1)">${half}</g></g>`;
}
// a meru: a shrine on a stone plinth under a stack of black palm-fibre roofs, a little gold finial at the top
function meru(cx, by, n, w, base = C.coral[1]){
  const body = `<rect x="${f1(cx - w*.45)}" y="${by - 12}" width="${f1(w*.9)}" height="12" style="fill:${base}"/><rect x="${f1(cx - w*.5)}" y="${by - 14}" width="${w}" height="3" style="fill:${C.coral[2]}"/>
    <rect x="${f1(cx - w*.26)}" y="${by - 30}" width="${f1(w*.52)}" height="16" style="fill:#8E3A2A"/><rect x="${f1(cx - 4)}" y="${by - 27}" width="8" height="13" style="fill:${C.gold}"/><path d="M${cx} ${by - 27} v13" style="stroke:#8A6A2A" stroke-width=".8"/>`;
  let roofs = "";
  for (let k = 0; k < n; k++) { const rw = w*(1.2 - k*.17), yb = by - 30 - k*12, yt = yb - 10;
    roofs += `<rect x="${f1(cx - rw*.14)}" y="${yb - 1}" width="${f1(rw*.28)}" height="3" style="fill:#6E3A2A"/><path d="M${f1(cx - rw/2)} ${yb} L${f1(cx - rw*.3)} ${yt} H${f1(cx + rw*.3)} L${f1(cx + rw/2)} ${yb}z" style="fill:${k % 2 ? C.ijuk2 : C.ijuk}"/><path d="M${f1(cx - rw/2)} ${yb} H${f1(cx + rw/2)}" style="stroke:#1E1A16" stroke-width="2"/>`; }
  const top = by - 30 - n*12 + 2;
  return `<g pointer-events="none">${sk(`${body}${roofs}<path d="M${cx - 3} ${top} h6 l-3 -8z" style="fill:${C.gold}"/>`, `<rect x="${f1(cx - w*.45)}" y="${by - 12}" width="${f1(w*.9)}" height="12"/><path d="M${f1(cx - w*.6)} ${by - 30} L${cx} ${top - 6} L${f1(cx + w*.6)} ${by - 30}"/>`)}</g>`;
}
// a jukung: a narrow white fishing canoe with an eye on the bow, bamboo outriggers either side like long legs
const jukung = (x, y, col = C.blue, s = 1, sail = "#E8463A") => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="2" cy="5" rx="46" ry="6" fill="#6E5A3A" opacity=".16"/>${sk(`
  <path d="M-38 -16 H38" style="stroke:${C.bamboo2}" stroke-width="3.4" stroke-linecap="round"/><path d="M-16 -16 Q-12 -2 -16 14 M18 -16 Q14 -2 18 14" fill="none" style="stroke:${C.bamboo2}" stroke-width="2.2"/>
  <path d="M-42 -3 Q-48 -11 -40 -10 L-32 -5 H34 Q42 -6 46 -13 Q48 -4 40 2 Q0 8 -36 4z" style="fill:${C.white}"/><path d="M-34 0 H38" style="stroke:${col}" stroke-width="2.4"/><path d="M-22 -6 L28 -7" style="stroke:${sail}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="35" cy="-2" r="2.4" style="fill:#FFFFFF"/><circle cx="35.6" cy="-2" r="1.2" style="fill:#1E1A16"/><path d="M-38 14 H38" style="stroke:${C.bamboo2}" stroke-width="3.4" stroke-linecap="round"/>`,
  `<path d="M-42 -3 Q-48 -11 -40 -10 L-32 -5 H34 Q42 -6 46 -13 Q48 -4 40 2 Q0 8 -36 4z"/>`)}</g>`;
// a beach umbrella in two colours, a beanbag
const umbrella = (x, y, a, b) => { const cy = y - 30, seg = Array.from({length: 8}, (_, k) => { const t0 = k*Math.PI/4, t1 = (k + 1)*Math.PI/4; return `<path d="M${x} ${cy} L${f1(x + 21*Math.cos(t0))} ${f1(cy + 8.5*Math.sin(t0))} L${f1(x + 21*Math.cos(t1))} ${f1(cy + 8.5*Math.sin(t1))}z" style="fill:${k % 2 ? a : b}"/>`; }).join("");
  return `<ellipse cx="${x + 8}" cy="${y + 1}" rx="22" ry="7" fill="#7A5A2A" opacity=".16"/>` + sk(`<path d="M${x} ${y} V${cy}" style="stroke:#8A6A4A" stroke-width="1.8"/>${seg}<circle cx="${x}" cy="${cy}" r="1.6" style="fill:#8A6A4A"/>`, `<ellipse cx="${x}" cy="${cy}" rx="21" ry="8.5"/>`); };
const beanbag = (x, y, col) => sk(`<path d="M${x - 10} ${y + 4} Q${x - 12} ${y - 6} ${x - 4} ${y - 8} Q${x + 6} ${y - 10} ${x + 11} ${y - 2} Q${x + 12} ${y + 5} ${x} ${y + 5}z" style="fill:${col}"/><path d="M${x - 5} ${y - 5} q4 -2 8 0" fill="none" style="stroke:#FFFFFF" stroke-width="1.2" opacity=".5"/>`, `<path d="M${x - 10} ${y + 4} Q${x - 12} ${y - 6} ${x - 4} ${y - 8} Q${x + 6} ${y - 10} ${x + 11} ${y - 2} Q${x + 12} ${y + 5} ${x} ${y + 5}z"/>`);
// a long-tailed macaque sitting (dir 1 faces right)
const macaque = (x, y, dir = 1, s = 1) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${dir*s} ${s})"><ellipse cx="0" cy="1" rx="8" ry="2" fill="#2E3A20" opacity=".22"/><path d="M-5 -2 Q-15 -1 -14 -10 Q-13 -16 -9 -15" fill="none" style="stroke:#7E7464" stroke-width="1.8" stroke-linecap="round"/>${sk(`<ellipse cx="0" cy="-6" rx="5.5" ry="6.5" style="fill:#8E8472"/><circle cx="1.5" cy="-14" r="4.2" style="fill:#8E8472"/><ellipse cx="2.8" cy="-13.4" rx="2.6" ry="2.4" style="fill:#D9B49A"/><path d="M2 -4 q3 2 4 -1" fill="none" style="stroke:#7E7464" stroke-width="1.6"/>`, `<ellipse cx="0" cy="-6" rx="5.5" ry="6.5"/><circle cx="1.5" cy="-14" r="4.2"/>`)}<circle cx="2" cy="-14.2" r=".6" fill="#2A2420"/><circle cx="3.9" cy="-14.2" r=".6" fill="#2A2420"/><path d="M-1.4 -17.4 q2.8 -1.8 5.6 0" fill="none" style="stroke:#6E6454" stroke-width="1.3"/></g>`;
// a runner duck, walking very upright
const duck = (x, y, dir = 1, col = "#F2EEE2") => `<g transform="translate(${x} ${y}) scale(${dir} 1)"><ellipse cx="0" cy="0" rx="4" ry="1.2" fill="#2E4A2A" opacity=".2"/><ellipse cx="0" cy="-5" rx="2.8" ry="5" transform="rotate(18 0 -5)" fill="${col}" style="stroke:#6E6A5E" stroke-width=".5"/><circle cx="2.4" cy="-10.6" r="2" fill="${col}" style="stroke:#6E6A5E" stroke-width=".5"/><path d="M4.2 -10.8 l2.6 .6 l-2.6 .8z" fill="#E8A03A"/><circle cx="2.9" cy="-11" r=".5" fill="#222"/><path d="M-1 0 h-1.6 M1 0 h1.6" style="stroke:#E8A03A" stroke-width="1"/></g>`;
// a statue in a poleng sarong (the black and white chequered cloth), a frangipani tucked behind its ear
const statue = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x - 7}" y="${y - 6}" width="14" height="6" style="fill:${C.vstone[2]}"/><path d="M${x - 5} ${y - 6} V${y - 16} H${x + 5} V${y - 6}z" style="fill:#F2EFE6"/><path d="M${x - 5} ${y - 13} h10 M${x - 5} ${y - 9} h10 M${x - 2.5} ${y - 16} v10 M${x + 2.5} ${y - 16} v10" style="stroke:#2A2826" stroke-width="2.4" stroke-dasharray="2.5 2.5"/>
  <rect x="${x - 4}" y="${y - 23}" width="8" height="7" style="fill:${C.vstone[0]}"/><circle cx="${x}" cy="${y - 27}" r="4.4" style="fill:${C.vstone[0]}"/><circle cx="${x - 1.4}" cy="${y - 28}" r=".9" fill="#F2EFE6"/><circle cx="${x + 1.6}" cy="${y - 28}" r=".9" fill="#F2EFE6"/>`, `<path d="M${x - 5} ${y - 6} V${y - 16} H${x + 5} V${y - 6}"/><circle cx="${x}" cy="${y - 27}" r="4.4"/>`)}<circle cx="${x + 4}" cy="${y - 30}" r="1.8" fill="#FFFDF2"/><circle cx="${x + 4}" cy="${y - 30}" r=".7" fill="#F2C53A"/></g>`;
// the way on: a little carved stone post (black volcanic stone, a stepped cap) with a bamboo arm, an offering at its foot
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 4}" y="${y - 22}" width="8" height="30" style="fill:${C.vstone[0]}"/><path d="M${x - 6} ${y - 22} h12 l-2 -4 h-8z M${x - 3.5} ${y - 26} h7 l-1.5 -4 h-4z" style="fill:${C.vstone[2]}"/><rect x="${x - 6}" y="${y + 5}" width="12" height="4" style="fill:${C.vstone[1]}"/><path d="M${x - 2} ${y - 6} h4 M${x - 2} ${y - 1} h4" style="stroke:${C.gold}" stroke-width="1.2"/>
    <path d="M${x + 4} ${y - 18} h22 l6 4 l-6 4 h-22z" style="fill:${C.bamboo}"/><path d="M${x + 11} ${y - 18} v8 M${x + 19} ${y - 18} v8" style="stroke:${C.bamboo2}" stroke-width=".9"/><path d="M${x + 26} ${y - 18} l6 4 l-6 4z" style="fill:${C.red}"/>`,
    `<rect x="${x - 4}" y="${y - 22}" width="8" height="30"/><path d="M${x + 4} ${y - 18} h22 l6 4 l-6 4 h-22z"/>`)}${canang(x - 11, y + 8, .8)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// a surfer bobbing on a board
const surfer = (x, y, i = 0) => `<g pointer-events="none"><animateTransform attributeName="transform" type="translate" values="0 0;${i % 2 ? 3 : -3} -1.5;0 0" dur="${3 + i*.6}s" repeatCount="indefinite"/><ellipse cx="${x}" cy="${y}" rx="7" ry="2" fill="${["#F3C969", "#FFFFFF", "#E8566C"][i % 3]}" style="stroke:#3b3530" stroke-width=".6"/><circle cx="${x + 1}" cy="${y - 3}" r="2.2" fill="#3A2A20"/></g>`;

/* ---------- ba_seminyak: the beach, the jetty and the ferry, the warung, the sunset spot, the jukung ---------- */
function seminyakScreen(){
  const [g, g2] = GR();
  const ground = `<rect width="520" height="640" style="fill:${C.sand}"/><g filter="url(#wash)" opacity=".6" pointer-events="none">${[[260, 330, 200, 90, 0], [100, 360, 90, 60, 1], [420, 220, 80, 60, 0], [300, 470, 140, 30, 1], [140, 180, 90, 40, 0]].map(([x, y, rx, ry, k]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${k ? C.sand2 : C.sand3}"/>`).join("")}</g>
    <g pointer-events="none">${sk(`<path d="M0 0 H520 V84 Q440 100 360 90 Q300 82 262 94 Q200 106 120 92 Q60 84 0 96z" style="fill:${g}"/>`, `<path d="M520 84 Q440 100 360 90 Q300 82 262 94 Q200 106 120 92 Q60 84 0 96"/>`)}<path d="M0 98 Q60 86 120 94 Q200 108 262 96 Q300 84 360 92 Q440 102 520 86" fill="none" style="stroke:${g2}" stroke-width="4" opacity=".5"/></g>`;
  // the sea along the bottom: a shallow turquoise edge, deeper further out, foam, surfers waiting for a wave
  const sea = `<g pointer-events="none"><path d="M0 528 Q100 520 200 528 L260 528 Q380 522 520 526 V560 H0z" style="fill:${C.wetsand}" opacity=".8"/>
    ${sk(`<path d="M0 548 Q60 540 120 546 Q170 552 200 544 L260 544 Q320 540 380 548 Q450 554 520 542 V640 H0z" style="fill:${C.sea2}"/><path d="M0 576 Q120 568 240 578 Q380 586 520 572 V640 H0z" style="fill:${C.sea}"/><path d="M0 612 Q160 604 300 614 Q420 620 520 608 V640 H0z" style="fill:${C.sea3}" opacity=".6"/>`, `<path d="M0 548 Q60 540 120 546 Q170 552 200 544 M260 544 Q320 540 380 548 Q450 554 520 542"/>`)}
    <path d="M0 550 Q60 542 120 548 Q170 554 200 546 M260 546 Q320 542 380 550 Q450 556 520 544" fill="none" style="stroke:${C.foam}" stroke-width="3" opacity=".85"><animate attributeName="opacity" values=".85;.4;.85" dur="5s" repeatCount="indefinite"/></path>
    ${waves([[20, 566], [130, 580], [300, 566], [450, 572], [60, 620], [470, 616], [180, 630]])}${surfer(470, 596, 0)}${surfer(36, 600, 1)}</g>`;
  // the wooden jetty out into the sea, an offering at its foot
  const jetty = `<g pointer-events="none">${sk(`<rect x="212" y="500" width="36" height="144" style="fill:#A27A54"/><path d="${Array.from({length: 23}, (_, k) => `M212 ${506 + k*6} H248`).join(" ")}" style="stroke:#7E5A3C" stroke-width=".8"/>`, `<path d="M212 500 V640 M248 500 V640"/>`)}
    ${[548, 576, 604, 632].map(y => `<rect x="207" y="${y - 6}" width="6" height="10" rx="1.5" style="fill:${C.wood2};stroke:var(--line)" stroke-width=".7"/><rect x="247" y="${y - 6}" width="6" height="10" rx="1.5" style="fill:${C.wood2};stroke:var(--line)" stroke-width=".7"/>`).join("")}${canang(256, 512)}</g>`;
  // the ferry home, white with a turquoise band, tied up at the jetty's foot
  const ferry = `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="4s" repeatCount="indefinite"/><ellipse cx="342" cy="626" rx="92" ry="5" fill="${C.foam}" opacity=".6"/>
    ${sk(`<path d="M256 598 H430 L420 624 H270 Q260 616 256 598z" style="fill:${C.white}"/><path d="M258 604 H428 L425 611 H261z" style="fill:${C.turq}"/><path d="M266 618 H422" style="stroke:${C.gold}" stroke-width="1.2"/>
      <rect x="280" y="584" width="118" height="14" rx="2" style="fill:${C.white}"/>${Array.from({length: 13}, (_, k) => `<rect x="${285 + k*8.6}" y="588" width="5.2" height="5" rx="1" style="fill:#7FC2C6"/>`).join("")}<rect x="370" y="574" width="30" height="10" rx="2" style="fill:${C.white}"/><rect x="373" y="576" width="24" height="4" rx="1" style="fill:#3E8A90"/>
      <path d="M318 584 L320 568 H336 L338 584z" style="fill:${C.turq}"/><path d="M319.4 573 H336.6" style="stroke:${C.white}" stroke-width="3"/>`,
      `<path d="M256 598 H430 L420 624 H270 Q260 616 256 598z"/><rect x="280" y="584" width="118" height="14" rx="2"/><path d="M318 584 L320 568 H336 L338 584z"/>`)}</g><path d="M258 600 Q254 600 250 596 M258 614 Q254 618 250 620" fill="none" style="stroke:#B49A6A" stroke-width="1.2"/></g>`;
  const pier = place("bajetty", 230, 530, 24, 9, "The jetty: the ferry home to Honeybrook", "", "Ferry home", 330, 562, "#CFE2EE");
  // the jukung: one pulled up on the sand, one riding at anchor
  const boats = place("baboats", 100, 520, 30, 8, "The jukung: fishing boats with outriggers", jukung(100, 490, C.blue, 1) + jukung(110, 590, "#E3B53C", .8, "#3E7FB8") + `<path d="M150 590 Q170 580 200 572" fill="none" style="stroke:#B49A6A" stroke-width="1" pointer-events="none"/>`, "Jukung", 100, 456, "#CFE2EE");
  // the warung: open-sided under a palm-thatch roof, a counter of dishes, low tables and plastic stools, a chalkboard
  const stool = (x, y, c) => `<rect x="${x - 4}" y="${y - 6}" width="8" height="6" rx="1" style="fill:${c}"/><ellipse cx="${x}" cy="${y - 6}" rx="4.4" ry="1.6" style="fill:${c}"/>`;
  const warung = (() => { const rf = thatch(40, 148, 180, 52);
    return `<g data-place="bawarung" aria-label="The warung"><ellipse class="hov" cx="130" cy="276" rx="34" ry="11" style="fill:var(--butter)"/>${shade(40, 200, 180, 60)}
    ${sk(`<rect x="38" y="236" width="184" height="24" style="fill:${C.vstone[1]}"/><rect x="38" y="234" width="184" height="4" style="fill:#A27A54"/><rect x="116" y="248" width="28" height="12" style="fill:${C.vstone[2]}"/><rect x="112" y="258" width="36" height="6" style="fill:${C.vstone[2]}"/>
      <rect x="44" y="198" width="172" height="38" style="fill:#6E5440"/><rect x="44" y="198" width="172" height="10" style="fill:#4E3A2C" opacity=".6"/>
      <rect x="52" y="214" width="46" height="20" style="fill:#A27A54"/><rect x="54" y="208" width="42" height="9" style="fill:#CFE2E6"/>${[[60, "#E8A03A"], [70, "#F2E6C8"], [80, "#C8432F"], [90, "#7FA35A"]].map(([x, c]) => `<ellipse cx="${x}" cy="${213}" rx="3.6" ry="2" style="fill:${c}"/>`).join("")}
      <rect x="116" y="220" width="34" height="5" style="fill:#A27A54"/><rect x="170" y="220" width="34" height="5" style="fill:#A27A54"/>${stool(112, 234, "#E8566C")}${stool(154, 234, "#3E9FD8")}${stool(166, 234, "#7FC79A")}${stool(208, 234, "#F3C969")}${stool(133, 236, "#3E9FD8")}${stool(187, 236, "#E8566C")}
      <path d="M46 200 V236 M100 200 V236 M160 200 V236 M214 200 V236" style="stroke:${C.wood2}" stroke-width="3.4"/>${rf.art}`,
      `<rect x="38" y="236" width="184" height="24"/>${rf.line}<path d="M46 200 V236 M214 200 V236"/>`)}
    <g pointer-events="none">${lampGlow(80, 206, 20)}${lampGlow(186, 206, 20)}${board(130, 172, 58, "WARUNG", "#2E6A5E", "#FFF6E8", 9)}${chalk(170, 244, 48, ["NASI GORENG", "MIE GORENG", "ES KELAPA"])}${canang(102, 266)}</g>${lab(130, 298, "Warung", "#F6E3B4", 10)}</g>`; })();
  // the beanbags and umbrellas in rows on the sand
  const beach = place("babeach", 380, 486, 36, 10, "The beach: beanbags, umbrellas and the waves",
    `<g pointer-events="none">${[[322, 444, "#E8566C", "#F6F2E6"], [380, 440, "#3E9FD8", "#F6F2E6"], [438, 444, "#F3C969", "#F6F2E6"]].map(([x, y, a, b]) => umbrella(x, y, a, b)).join("")}
      ${[[312, 452, "#E8566C"], [334, 454, "#3E9FD8"], [370, 450, "#F3C969"], [392, 452, "#7FC79A"], [428, 454, "#F28A3A"], [450, 452, "#9A7AD0"], [322, 466, "#7FC79A"], [358, 466, "#E8566C"], [404, 466, "#3E9FD8"], [440, 466, "#F3C969"]].map(([x, y, c]) => beanbag(x, y, c)).join("")}</g>`,
    "Beach", 380, 508, "#F6D6CF");
  // the sunset spot: two deckchairs looking out to sea, a little table of coconuts, the coconut cart
  const chair = (x, y, c) => sk(`<path d="M${x - 9} ${y} l3 -16 h12 l3 16" fill="none" style="stroke:${C.wood}" stroke-width="2"/><path d="M${x - 7} ${y - 2} l2.4 -13 h9.2 l2.4 13z" style="fill:${c}"/><path d="M${x - 6} ${y - 8} h12" style="stroke:#FFFFFF" stroke-width="2" opacity=".7"/>`, `<path d="M${x - 7} ${y - 2} l2.4 -13 h9.2 l2.4 13z"/>`);
  const coco = (x, y) => `<circle cx="${x}" cy="${y}" r="3.4" style="fill:#7FA83A"/><path d="M${x + 1} ${y - 3} l2 -5" style="stroke:#E8566C" stroke-width="1"/>`;
  const sunset = place("basunset", 440, 330, 28, 10, "The sunset spot",
    `<g pointer-events="none">${chair(424, 318, "#F28A3A")}${chair(458, 318, "#3E9FD8")}${sk(`<rect x="436" y="306" width="10" height="10" style="fill:${C.wood}"/>${coco(441, 304)}`, "")}
      ${sk(`<rect x="374" y="282" width="34" height="16" style="fill:#A27A54"/><path d="M374 290 h34" style="stroke:${C.wood2}" stroke-width="1"/>${[[380, 280], [388, 278], [396, 280], [384, 273], [392, 273], [402, 280]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" style="fill:#7FA83A"/>`).join("")}<circle cx="380" cy="300" r="4" style="fill:#3A2A20"/><circle cx="402" cy="300" r="4" style="fill:#3A2A20"/><path d="M408 284 l10 -4" style="stroke:${C.wood2}" stroke-width="2"/>
        <path d="M391 272 V250" style="stroke:#8A6A4A" stroke-width="1.4"/><path d="M375 252 Q391 240 407 252z" style="fill:#E8566C"/><path d="M383 252 Q391 242 399 252" fill="none" style="stroke:#F6F2E6" stroke-width="3"/>`, `<rect x="374" y="282" width="34" height="16"/>`)}${board(391, 304, 40, "KELAPA", "#F6F2E6", "#2E6A5E", 6.5)}</g>`,
    "Sunset spot", 424, 352, "#FBE0B8");
  const ways = paved("M262 -10 V96", 26) + sandway("M262 96 Q262 200 250 300 Q236 420 230 524", 26) + sandway("M254 300 Q360 330 520 330", 22) + sandway("M248 250 Q190 272 130 276", 18);
  const trees = palm(26, 150, 1, 1, 0) + palm(488, 160, 1, -1, 1) + palm(300, 238, .9, 1, 2) + palm(26, 420, 1, 1, 1) + palm(184, 440, .9, -1, 0) + palm(498, 470, .9, -1, 2) + palm(340, 112, .8, 1, 1)
    + frangipani(60, 60, 1, true) + frangipani(420, 54, 1) + bush(150, 40, 14, 0) + bush(360, 36, 12, 1) + bush(490, 40, 14, 2) + bush(20, 40, 12, 1);
  const shells = `<g pointer-events="none">${[[150, 340], [330, 380], [70, 300], [410, 400], [200, 400]].map(([x, y], i) => i % 2 ? `<path d="M${x} ${y - 4} l1.2 3 l3.2 .3 l-2.5 2 l.8 3.1 l-2.7 -1.7 l-2.7 1.7 l.8 -3.1 l-2.5 -2 l3.2 -.3z" fill="#F28A5A"/>` : `<path d="M${x - 3} ${y + 1} Q${x} ${y - 5} ${x + 3} ${y + 1}z" fill="#F6EEE0" style="stroke:#C9B48A" stroke-width=".6"/>`).join("")}</g>`;
  return lampDefs + ground + sea + ways + shells + jetty + ferry + boats + warung + beach + sunset + trees + penjor(234, 214, 1, 116) + penjor(290, 214, -1, 116) + canang(280, 108) + pier
    + gate("baToTegallalang", 262, 26, "Tegallalang", 190, 30, "North up into the hills to Tegallalang", "#DCEBC8")
    + gate("baToUluwatu", 504, 330, "Uluwatu", 470, 282, "East along the coast to Uluwatu", "#E2E6EA");
}

/* ---------- ba_ubud: the market, the silversmith, the palace, the monkey forest ---------- */
function ubudScreen(){
  const ground = lawn([[260, 470, 200, 110, 0], [90, 300, 90, 60, 1], [430, 290, 80, 60, 0], [130, 580, 110, 50, 1], [260, 30, 220, 30, 1]]);
  const ways = paved("M-10 206 H530", 30) + paved("M-10 300 H120 Q150 300 150 330 V396 Q150 420 190 420 H340 Q366 420 366 396 V300 Q366 236 360 206", 22) + paved("M262 412 V650", 28) + paved("M150 206 V300", 22)
    + `<g pointer-events="none">${sk(`<rect x="168" y="384" width="184" height="40" style="fill:#CBC4B0"/>`, "")}${blocks(168, 386, 184, 38, 5, .3, "#9E9786")}</g>`;
  // the market: open-fronted under two tiers of terracotta, sarongs hanging out front and baskets stacked
  const market = (() => { const r1 = tiles(44, 98, 172, 26), r2 = tiles(70, 60, 120, 26);
    const sarongs = [["#3E6BAE", "#F3D34A"], ["#C8432F", "#F6E3B4"], ["#2E6A5E", "#F2A3BA"], ["#7A4A9A", "#F3D34A"], ["#E3B53C", "#8A3A2A"], ["#3E6BAE", "#FFFFFF"], ["#C8432F", "#3E6BAE"], ["#2E6A5E", "#F3D34A"]];
    return `<g data-place="bamarket" aria-label="Ubud market: sarongs, baskets and fruit"><ellipse class="hov" cx="130" cy="186" rx="36" ry="11" style="fill:var(--butter)"/>${shade(44, 120, 172, 50)}
    ${sk(`<rect x="88" y="84" width="84" height="16" style="fill:${C.coral[0]}"/><rect x="44" y="122" width="172" height="48" style="fill:${C.coral[0]}"/><rect x="58" y="128" width="144" height="42" style="fill:#5E4636"/>
      ${[44, 96, 160, 208].map(x => `<rect x="${x}" y="122" width="8" height="48" style="fill:${C.brick}"/>`).join("")}${r1.art}${r2.art}
      ${sarongs.map(([a, b], k) => { const x = 62 + k*17.4; return `<rect x="${x}" y="128" width="13" height="24" style="fill:${a}"/><path d="M${x + 2} ${133} h9 M${x + 2} ${139} h9 M${x + 2} ${145} h9" style="stroke:${b}" stroke-width="1.4" stroke-dasharray="2 2"/>`; }).join("")}<path d="M58 128 H202" style="stroke:${C.wood2}" stroke-width="2"/>
      ${[[64, 162, "#C9A27E"], [76, 164, "#B48A5E"], [70, 154, "#D9B88A"], [186, 162, "#C9A27E"], [198, 164, "#B48A5E"], [192, 154, "#D9B88A"]].map(([x, y, c]) => `<path d="M${x - 6} ${y - 6} h12 l-2 8 h-8z" style="fill:${c}"/><path d="M${x - 5} ${y - 3} h10" style="stroke:#8A6A42" stroke-width=".7"/>`).join("")}
      ${[[110, 166, "#E8A03A"], [118, 166, "#7FA35A"], [126, 167, "#E8463A"], [134, 166, "#F3D34A"], [142, 167, "#6B3A2A"], [150, 166, "#7FA35A"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.6" style="fill:${c}"/>`).join("")}`,
      `<rect x="44" y="122" width="172" height="48"/>${r1.line}${r2.line}`)}
    <g pointer-events="none">${board(130, 86, 64, "PASAR UBUD", "#F6EFE3", "#8A3A2A", 8)}${canang(100, 178)}</g>${lab(130, 228, "Market", "#F6E3B4", 10)}</g>`; })();
  // the silversmith: brick and coral stone, a carved wooden door, rings glinting in the windows
  const silver = (() => { const rf = tiles(304, 66, 172, 38);
    const sparkle = (x, y, i) => `<path d="M${x} ${y - 3} v6 M${x - 3} ${y} h6" style="stroke:#FFFFFF" stroke-width="1"><animate attributeName="opacity" values="0;1;0" dur="${2 + i*.5}s" begin="${i*.7}s" repeatCount="indefinite"/></path>`;
    const window = x => `<rect x="${x}" y="118" width="40" height="30" style="fill:${C.coral[2]}"/><rect x="${x + 3}" y="121" width="34" height="24" style="fill:${C.glass}"/><path d="M${x + 3} 138 h34" style="stroke:#A27A54" stroke-width="2"/>
      ${[[8, 133, "#E6E2DA"], [15, 133, "#F1D06A"], [22, 133, "#E6E2DA"], [29, 133, "#E6E2DA"], [12, 127, "#F1D06A"], [25, 127, "#E6E2DA"]].map(([dx, y, c]) => `<circle cx="${x + dx}" cy="${y}" r="2.4" style="fill:none;stroke:${c}" stroke-width="1.3"/>`).join("")}`;
    return `<g data-place="basilver" aria-label="The silversmith: rings glinting in the window"><ellipse class="hov" cx="390" cy="186" rx="34" ry="11" style="fill:var(--butter)"/>${shade(304, 104, 172, 66)}
    ${sk(`<rect x="304" y="104" width="172" height="66" style="fill:${C.brick}"/>${bricks(304, 104, 172, 66)}<rect x="304" y="104" width="172" height="6" style="fill:${C.coral[1]}"/><rect x="304" y="162" width="172" height="8" style="fill:${C.coral[1]}"/>
      ${window(318)}${window(422)}<rect x="370" y="122" width="40" height="48" style="fill:${C.coral[1]}"/><rect x="374" y="128" width="32" height="42" style="fill:#8A5A32"/><path d="M390 128 V170" style="stroke:#5A3A20" stroke-width="1.2"/>
      <path d="M378 134 h8 v12 h-8z M394 134 h8 v12 h-8z M378 152 h8 v12 h-8z M394 152 h8 v12 h-8z" style="fill:none;stroke:${C.gold}" stroke-width="1"/><circle cx="386" cy="150" r="1.2" style="fill:${C.gold2}"/><circle cx="394" cy="150" r="1.2" style="fill:${C.gold2}"/><path d="M372 128 Q390 116 408 128" fill="none" style="stroke:${C.gold}" stroke-width="2"/>${rf.art}`,
      `<rect x="304" y="104" width="172" height="66"/>${rf.line}<rect x="374" y="128" width="32" height="42"/>`)}
    <g pointer-events="none">${[[326, 133, 0], [341, 127, 1], [432, 133, 2], [450, 127, 3]].map(([x, y, i]) => sparkle(x, y, i)).join("")}${board(390, 88, 70, "PERAK SILVER", "#F6EFE3", "#3A4448", 7.5)}${canang(414, 178)}</g>${lab(390, 228, "Silversmith", "#E2E6EA", 10)}</g>`; })();
  // the palace: a red brick wall with gold-carved coping, pavilion roofs behind, the split gate and its steps
  const palace = (() => { const bale = (x, w) => { const r = thatch(x, 300, w, 22); return `<path d="M${x + 4} 322 V340 M${x + w - 4} 322 V340" style="stroke:#8E3A2A" stroke-width="3"/>${r.art}`; };
    return `<g data-place="bapalace" aria-label="The palace: through the split gate to the dance pavilion"><ellipse class="hov" cx="260" cy="396" rx="30" ry="10" style="fill:var(--butter)"/>
    <g pointer-events="none">${sk(`${bale(186, 52)}${bale(286, 50)}<rect x="180" y="338" width="160" height="42" style="fill:${C.brick}"/>${bricks(180, 344, 160, 36)}<rect x="178" y="334" width="164" height="7" style="fill:${C.coral[1]}"/><path d="M180 337 H340" style="stroke:${C.gold}" stroke-width="1.6" stroke-dasharray="3 3"/>
      <rect x="180" y="358" width="160" height="4" style="fill:${C.coral[1]}"/><rect x="246" y="300" width="28" height="80" style="fill:#D9CDB0"/><rect x="250" y="322" width="20" height="58" style="fill:#C2B596"/><rect x="252" y="340" width="16" height="24" style="fill:${C.gold}"/>`,
      `<rect x="180" y="338" width="160" height="42"/>`)}
      ${candi(260, 384, 34, 122, 20, C.brick, C.coral[1], {brick: true})}${sk(`<rect x="236" y="380" width="48" height="5" style="fill:${C.vstone[2]}"/><rect x="232" y="385" width="56" height="5" style="fill:${C.vstone[0]}"/>`, `<rect x="232" y="380" width="56" height="10"/>`)}
      ${statue(214, 392)}${statue(306, 392)}${canang(246, 384)}${canang(274, 384)}</g>${lab(260, 432, "Palace", "#F6D6CF", 10)}</g>`; })();
  // the monkey forest: great banyans, a mossy stone wall and steps, macaques everywhere
  const forest = (() => {
    const wall = `<g pointer-events="none">${sk(`<path d="M360 452 H400 M432 452 H506" style="stroke:${C.vstone[0]}" stroke-width="10"/><path d="M360 448 H400 M432 448 H506" style="stroke:${C.moss}" stroke-width="3"/><rect x="396" y="436" width="8" height="20" style="fill:${C.vstone[0]}"/><rect x="428" y="436" width="8" height="20" style="fill:${C.vstone[0]}"/><path d="M394 436 h12 l-2 -6 h-8z M426 436 h12 l-2 -6 h-8z" style="fill:${C.moss}"/>`, `<path d="M360 447 H400 M432 447 H506 M360 457 H400 M432 457 H506"/>`)}</g>`;
    return place("bamonkeys", 400, 424, 26, 10, "The monkey forest: banyans, mossy temples and macaques",
      `<g pointer-events="none"><path d="M356 456 H510 V604 H356z" style="fill:#3E6A34" opacity=".55" filter="url(#wash)"/>${banyan(470, 520, 1)}${banyan(400, 596, .95)}${banyan(500, 606, .7)}
        ${sk(`<path d="M380 520 h22 v-14 h-22z" style="fill:${C.vstone[2]}"/><path d="M378 506 h26 l-4 -6 h-18z" style="fill:${C.moss}"/>`, `<path d="M380 520 V506 H402 V520"/>`)}${wall}
        ${macaque(384, 476, 1)}${macaque(414, 482, -1, .9)}${macaque(452, 548, 1)}${macaque(392, 520, -1, .8)}${macaque(486, 446, -1, .9)}${macaque(440, 470, 1, .7)}</g>`,
      "Monkey forest", 448, 400, "#DCEBC8"); })();
  const trees = frangipani(64, 420, 1, true) + frangipani(206, 520, 1) + frangipani(326, 540, .9, true) + palm(30, 190, .9, 1, 0) + palm(492, 196, .9, -1, 1) + palm(110, 620, .9, 1, 2)
    + bush(20, 560, 14, 0) + bush(60, 500, 10, 1) + bush(160, 478, 12, 2) + bush(330, 470, 10, 0) + tufts([[90, 360], [200, 460], [300, 470], [60, 260], [440, 260], [120, 540], [230, 580]]);
  const shrine = `<g pointer-events="none">${statue(96, 476)}${canang(108, 478)}${sk(`<rect x="34" y="566" width="22" height="12" style="fill:${C.vstone[0]}"/><rect x="38" y="548" width="14" height="18" style="fill:${C.coral[1]}"/>${thatch(34, 534, 22, 14, C.ijuk, "#1E1A16").art}`, `<rect x="34" y="566" width="22" height="12"/>`)}${canang(45, 584)}</g>`;
  return lampDefs + ground + ways + market + silver + palace + forest + shrine + trees + penjor(248, 190, 1, 96) + penjor(20, 192, 1, 90) + penjor(500, 192, -1, 90) + penjor(178, 420, 1, 80) + penjor(342, 420, -1, 80)
    + gate("baToTegallalangW", 16, 300, "Tegallalang", 64, 268, "West to the rice terraces at Tegallalang", "#DCEBC8")
    + gate("baToUluwatuS", 262, 612, "Uluwatu", 330, 604, "South to Uluwatu", "#E2E6EA");
}

/* ---------- ba_tegallalang: the terraces, the water channels, the jungle swing, the coffee and cacao house ---------- */
function tegallalangScreen(){
  const ground = lawn([[260, 420, 220, 120, 0], [100, 300, 90, 50, 1], [400, 560, 110, 60, 1], [80, 560, 80, 50, 0]]);
  // the terraces: curving green steps, a darker riser under each, water glinting, the rice in rows
  const curve = (e, x0, x1) => `M${x0} ${e} C${x0 + 130} ${e + 20} ${x1 - 150} ${e - 16} ${x1} ${e + 2}`;
  const back = (e, x0, x1) => `L${x1} ${e + 2} C${x1 - 150} ${e - 16} ${x0 + 130} ${e + 20} ${x0} ${e}z`;
  const band = (e0, e1, x0, x1, k) => { const mid = (e0 + e1)/2;
    return `<path d="${curve(e0, x0, x1)} ${back(e1, x0, x1)}" style="fill:${C.rice[k % 3]}"/><path d="${curve(mid - 3, x0 + 6, x1 - 6)}" fill="none" style="stroke:#5E9A3A" stroke-width="1.6" stroke-dasharray="1 4"/><path d="${curve(mid + 3, x0 + 6, x1 - 6)}" fill="none" style="stroke:#6AA444" stroke-width="1.6" stroke-dasharray="1 4" stroke-dashoffset="2"/>
      ${k % 2 ? `<path d="${curve(mid, x0 + 30, x1 - 30)}" fill="none" style="stroke:#D9F2F2" stroke-width="2" stroke-dasharray="26 46" stroke-dashoffset="${k*17}"><animate attributeName="opacity" values=".25;.8;.25" dur="${4 + k}s" repeatCount="indefinite"/></path>` : ""}<path d="${curve(e0 + 1.5, x0, x1)}" fill="none" style="stroke:#C6E68A" stroke-width="1.6" opacity=".9"/><path d="${curve(e1 - 2, x0, x1)}" fill="none" style="stroke:#3F6A26" stroke-width="6.5"/><path d="${curve(e1 + 1.5, x0, x1)}" fill="none" style="stroke:#6E5A34" stroke-width="1.4" opacity=".6"/>`; };
  const groupA = [44, 62, 80, 99, 118].slice(0, -1).map((e, k, a) => band(e, [62, 80, 99, 118][k], 36, 484, k)).join("");
  const groupB = [150, 171, 191].map((e, k) => band(e, [171, 191, 211][k], 56, 464, k + 1)).join("");
  const terr = `<g pointer-events="none">${sk(`<path d="M0 0 H520 V50 H0z" style="fill:${C.jungle[1]}"/>`, "")}${sk(groupA + groupB, `${`<path d="${curve(44, 36, 484)}"/>`}<path d="${curve(150, 56, 464)}"/>`)}
    ${lane("M30 134 C160 152 334 118 492 136", 18)}</g>`;
  const farmer = (x, y) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 1}" rx="5" ry="1.4" fill="#2E4A2A" opacity=".25"/><path d="M${x - 3} ${y} V${y - 7} H${x + 3} V${y}z" fill="#3E6BAE"/><rect x="${x - 3}" y="${y - 12}" width="6" height="5" fill="#F2EEE2"/><path d="M${x - 8} ${y - 12} L${x} ${y - 18} L${x + 8} ${y - 12}z" fill="#E6CF8A" style="stroke:#9A7A42" stroke-width=".6"/></g>`;
  const jungleTop = [[20, 30, 26], [80, 20, 24], [150, 34, 22], [220, 18, 26], [300, 30, 24], [370, 18, 26], [440, 32, 22], [500, 22, 26]].map(([x, y, r], k) => bush(x, y, r, k)).join("");
  const edgeL = bush(22, 96, 18, 1) + bush(30, 190, 20, 2) + bush(14, 140, 14, 0), edgeR = bush(498, 90, 18, 2) + bush(488, 186, 20, 0) + bush(506, 140, 14, 1);
  const terraces = place("baterraces", 260, 236, 36, 11, "The rice terraces: green steps down the valley",
    terr + jungleTop + edgeL + edgeR + palm(130, 98, .75, -1, 0) + palm(362, 92, .8, 1, 1) + palm(224, 192, .7, 1, 2) + palm(420, 200, .75, -1, 0) + palm(90, 196, .7, 1, 1) + farmer(170, 112) + farmer(330, 186),
    "Rice terraces", 260, 258, "#DCEBC8");
  // the paths: along the foot of the terraces, east to Ubud, down to Seminyak, to the cacao house
  const ways = lane("M24 238 C150 246 330 228 496 240", 20) + lane("M262 240 Q290 286 360 290 Q440 294 530 300", 20) + lane("M262 240 Q238 330 250 430 Q262 520 262 650", 22) + lane("M246 400 Q190 440 120 440", 18);
  // the water channels: flat paddies split by little stone-edged channels, water running, a bamboo sluice, the ducks
  const paddy = (x, y, w, h, k) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${C.rice[k % 3]}"/><path d="${Array.from({length: Math.floor(h/7)}, (_, r) => `M${x + 4} ${y + 5 + r*7} H${x + w - 4}`).join(" ")}" style="stroke:#5E9A3A" stroke-width="1.6" stroke-dasharray="1 4"/>${k % 2 ? `<rect x="${x + 6}" y="${y + h/2 - 1}" width="${w*.5}" height="2" fill="#D9F2F2" opacity=".5"/>` : ""}`;
  const chan = d => `<path d="${d}" fill="none" style="stroke:${C.vstone[2]}" stroke-width="7"/><path d="${d}" fill="none" style="stroke:#7FC6D2" stroke-width="4"/><path d="${d}" fill="none" style="stroke:#D9F4F6" stroke-width="1.4" stroke-dasharray="6 10"><animate attributeName="stroke-dashoffset" values="16;0" dur="1.6s" repeatCount="indefinite"/></path>`;
  const ducks = `<g><animateTransform attributeName="transform" type="translate" values="0 0;110 0" dur="36s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;1;0" dur="36s" repeatCount="indefinite"/>${[0, 1, 2, 3, 4, 5].map(k => duck(360 - k*12, 520, 1, k % 3 === 1 ? "#B49A7A" : "#F2EEE2")).join("")}</g>`;
  const subak = place("basubak", 300, 470, 30, 10, "The water channels: the subak, shared by the whole village",
    `<g pointer-events="none">${sk(paddy(284, 452, 100, 58, 0) + paddy(392, 452, 108, 58, 1) + paddy(284, 528, 100, 70, 2) + paddy(392, 528, 108, 70, 0) + paddy(20, 500, 96, 50, 1) + paddy(124, 500, 106, 50, 2) + paddy(20, 560, 210, 50, 0), "")}
      ${chan("M280 448 H504")}${chan("M388 448 V604")}${chan("M280 518 H504")}${chan("M18 556 H234")}${chan("M120 496 V556")}
      ${sk(`<rect x="294" y="440" width="14" height="10" style="fill:${C.vstone[0]}"/><path d="M308 444 h10" style="stroke:${C.bamboo}" stroke-width="3"/>`, `<rect x="294" y="440" width="14" height="10"/>`)}${canang(286, 438)}${ducks}${farmer(450, 580)}</g>`,
    "Water channels", 330, 494, "#CFE2EE");
  // the jungle swing: a bamboo platform, a tall palm, a long rope swing flying out over the valley
  const swing = place("baswing", 420, 376, 30, 10, "The jungle swing: right out over the valley",
    `<g pointer-events="none">${palm(450, 344, 1.9, -1, 1)}${shade(384, 330, 72, 30, 6)}${sk(`<path d="M388 360 V372 M452 360 V372 M420 360 V372" style="stroke:${C.wood2}" stroke-width="3"/><rect x="384" y="330" width="72" height="30" style="fill:${C.bamboo}"/><path d="${Array.from({length: 8}, (_, k) => `M${388 + k*9} 330 V360`).join(" ")}" style="stroke:${C.bamboo2}" stroke-width="1"/>
        <path d="M384 330 V316 H456 V330 M384 322 H456" fill="none" style="stroke:${C.wood}" stroke-width="2"/>`, `<rect x="384" y="330" width="72" height="30"/>`)}
      <g><animateTransform attributeName="transform" type="rotate" values="18 420 226;-34 420 226;18 420 226" dur="5s" repeatCount="indefinite"/><path d="M416 226 L404 306 M424 226 L414 306" fill="none" style="stroke:#8A6A42" stroke-width="1.2"/><rect x="400" y="304" width="18" height="5" rx="1.5" style="fill:${C.wood};stroke:var(--line)" stroke-width=".7"/></g>${board(420, 336, 40, "SWING", "#F6EFE3", "#2E6A5E", 7)}</g>`,
    "Jungle swing", 420, 398, "#F6D6CF");
  // the coffee and cacao house: a bamboo hut on stilts under a big thatch, a ladder down, sacks and a drying tray
  const cacao = (() => { const rf = thatch(40, 310, 160, 46);
    return `<g data-place="bacacao" aria-label="The coffee and cacao house"><ellipse class="hov" cx="120" cy="436" rx="34" ry="10" style="fill:var(--butter)"/>${shade(48, 356, 144, 64)}
    ${sk(`${[54, 90, 150, 186].map(x => `<rect x="${x - 2.5}" y="396" width="5" height="24" style="fill:${C.wood2}"/>`).join("")}<rect x="44" y="392" width="152" height="6" style="fill:${C.wood}"/>
      <rect x="50" y="352" width="140" height="40" style="fill:#D9C084"/><path d="${Array.from({length: 18}, (_, k) => `M${54 + k*8} 352 V392`).join(" ")}" style="stroke:#B49A5A" stroke-width=".8"/><path d="M50 366 H190 M50 380 H190" style="stroke:#B49A5A" stroke-width=".8"/>
      <rect x="64" y="362" width="30" height="16" style="fill:#5E4636"/><rect x="146" y="362" width="30" height="16" style="fill:#5E4636"/><rect x="108" y="358" width="24" height="34" style="fill:#5E4636"/>
      <path d="M110 398 L106 432 M130 398 L134 432 M108 406 H132 M107 414 H133 M107 422 H133 M106 430 H134" fill="none" style="stroke:${C.wood}" stroke-width="2"/>
      ${[[70, 388, "#C9A27E"], [82, 388, "#B48A5E"], [158, 388, "#C9A27E"], [170, 388, "#B48A5E"]].map(([x, y, c]) => `<path d="M${x - 5} ${y} q-1 -9 5 -10 q6 1 5 10z" style="fill:${c}"/>`).join("")}${rf.art}`,
      `${rf.line}<rect x="50" y="352" width="140" height="40"/><path d="M44 392 H196"/>`)}
    <g pointer-events="none">${sk(`<ellipse cx="176" cy="432" rx="16" ry="5" style="fill:#C9A27E"/><ellipse cx="176" cy="431" rx="12" ry="3.4" style="fill:#5A3A2A"/>`, `<ellipse cx="176" cy="432" rx="16" ry="5"/>`)}${board(120, 336, 66, "KOPI CACAO", "#5A3A2A", "#F6E3B4", 7.5)}${canang(144, 432)}</g>${lab(120, 458, "Coffee and cacao", "#FBE0B8", 10)}</g>`; })();
  const trees = palm(30, 300, 1, 1, 2) + palm(240, 330, .8, -1, 0) + palm(500, 420, .95, -1, 2) + frangipani(330, 360, .9, true) + frangipani(200, 280, .8) + bush(20, 460, 14, 0) + bush(500, 610, 14, 1) + bush(16, 620, 12, 2)
    + tufts([[180, 300], [320, 260], [300, 400], [200, 460], [60, 470], [470, 260], [350, 620]]);
  return lampDefs + ground + ways + terraces + subak + trees + cacao + swing + penjor(240, 600, 1, 86) + penjor(286, 600, -1, 86) + canang(250, 240)
    + gate("baToUbud", 504, 300, "Ubud", 470, 268, "East to Ubud", "#F6E3B4")
    + gate("baToSeminyak", 262, 612, "Seminyak", 330, 604, "South down to the coast at Seminyak", "#CFE2EE");
}

/* ---------- ba_uluwatu: the cliffs, the temple, the amphitheatre, the cliff path, the surf ---------- */
function uluwatuScreen(){
  const [g, g2, g3] = wet() ? ["#8FBE5E", "#7CAE4E", "#A5CC74"] : ["#A9BE6E", "#97AE5E", "#BCCB84"];
  // the land on its limestone headland, the white cliff face dropping to the sea, surf breaking at its foot
  const land = `M0 0 H438 Q432 120 440 240 Q432 360 438 470 Q440 536 420 554 Q300 560 200 552 Q100 560 0 554z`;
  const sea = `<g pointer-events="none"><rect width="520" height="640" style="fill:${C.sea}"/><path d="M470 0 Q462 200 474 400 Q470 560 420 600 Q300 610 0 600 V640 H520 V0z" style="fill:${C.sea3}" opacity=".5"/>
    <path d="M0 640 V598 Q120 606 240 596 Q360 590 432 584 Q462 560 466 470 Q460 360 468 240 Q460 120 466 0 H520 V640z" fill="none"/>${waves([[480, 60], [490, 180], [478, 300], [494, 420], [470, 520], [380, 610], [250, 620], [100, 616], [40, 630], [500, 600]])}
    ${surfer(492, 520, 0)}${surfer(480, 610, 1)}${surfer(330, 618, 2)}</g>`;
  const cliff = `<g pointer-events="none"><g transform="translate(24 28)">${sk(`<path d="${land}" style="fill:#C2B79C"/>`, `<path d="${land}"/>`)}</g><g transform="translate(12 13)"><path d="${land}" style="fill:${C.coral[1]}"/></g>
    <path d="M446 40 l10 4 M444 120 l12 6 M448 210 l10 4 M444 300 l12 6 M446 390 l10 4 M444 470 l12 4 M420 560 l6 12 M340 560 l2 14 M260 556 l2 14 M180 560 l2 14 M90 558 l2 14" style="stroke:${C.cline}" stroke-width="1.4" opacity=".7"/>
    <path d="M468 30 Q458 150 468 270 Q458 390 466 500 Q466 568 446 586 Q326 592 226 584 Q126 592 26 586" fill="none" style="stroke:${C.foam}" stroke-width="4" opacity=".9"><animate attributeName="opacity" values=".9;.35;.9" dur="4s" repeatCount="indefinite"/></path></g>`;
  const ground = `${sea}${cliff}<g pointer-events="none">${sk(`<path d="${land}" style="fill:${g}"/>`, `<path d="${land}"/>`)}<g filter="url(#wash)" opacity=".55">${[[200, 250, 140, 90, 0], [80, 500, 70, 40, 1], [330, 420, 70, 60, 0], [120, 120, 80, 50, 1]].map(([x, y, rx, ry, k]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${k ? g2 : g3}"/>`).join("")}</g>
    ${[[60, 220, 9], [300, 300, 7], [40, 450, 8], [290, 520, 9], [160, 520, 6], [220, 90, 7]].map(([x, y, r]) => `<path d="M${x - r} ${y} Q${x - r} ${y - r*.7} ${x} ${y - r*.7} Q${x + r} ${y - r*.7} ${x + r} ${y}z" style="fill:${C.coral[0]};stroke:var(--line)" stroke-width=".7"/>`).join("")}</g>`;
  const ways = paved("M262 -10 V100 Q262 190 300 214 H372", 22, true) + paved("M262 100 Q300 230 300 300 Q300 460 200 462", 20, true) + paved("M-10 330 Q60 330 96 360 Q106 452 200 462", 20, true) + paved("M200 462 Q300 500 384 520", 18, true) + paved("M372 216 Q410 240 410 330 Q412 440 392 520", 20, true);
  // the low wall along the cliff edge, monkeys sitting on it
  const wall = `<g pointer-events="none">${sk(`<path d="M430 220 Q424 330 428 470 Q428 526 410 546" fill="none" style="stroke:${C.coral[1]}" stroke-width="8" stroke-linecap="round"/><path d="M430 220 Q424 330 428 470 Q428 526 410 546" fill="none" style="stroke:${C.coral[2]}" stroke-width="3" stroke-dasharray="6 4"/>`, `<path d="M434 220 Q428 330 432 470 Q432 528 413 549 M426 220 Q420 330 424 470 Q424 524 407 543"/>`)}
    ${macaque(426, 286, -1, .9)}${macaque(424, 420, 1, .85)}${macaque(428, 470, -1, .8)}</g>`;
  // the temple on its headland: a white coral wall, the split gate, a black-thatched meru and a little pavilion behind
  const temple = place("batemple", 365, 216, 30, 10, "Uluwatu temple: on the very edge of the cliff",
    `<g pointer-events="none">${meru(404, 132, 5, 40, C.vstone[1])}${sk(`${thatch(314, 96, 40, 18, C.ijuk, "#1E1A16").art}<rect x="318" y="114" width="32" height="18" style="fill:${C.coral[1]}"/><path d="M322 114 V132 M346 114 V132" style="stroke:#8E3A2A" stroke-width="2.4"/>`, `<rect x="318" y="114" width="32" height="18"/>`)}
      ${shade(300, 160, 130, 40, 6)}${sk(`<rect x="300" y="160" width="130" height="40" style="fill:${C.coral[0]}"/><rect x="298" y="156" width="134" height="6" style="fill:${C.coral[2]}"/>`, `<rect x="300" y="160" width="130" height="40"/>`)}${blocks(300, 164, 130, 36, 3, .35, C.cline)}
      ${candi(365, 200, 22, 76, 14, C.coral[0], C.coral[2], {line: C.cline, gold: C.gold})}${sk(`<rect x="348" y="198" width="34" height="5" style="fill:${C.coral[1]}"/><rect x="344" y="203" width="42" height="5" style="fill:${C.coral[1]}"/>`, `<rect x="344" y="198" width="42" height="10"/>`)}
      ${macaque(314, 158, 1, .8)}${macaque(420, 158, -1, .8)}${canang(352, 208)}${canang(378, 208)}${lampGlow(338, 190, 16)}${lampGlow(392, 190, 16)}</g>`,
    "Cliff temple", 330, 236, "#F6E3B4");
  // the amphitheatre: rings of stone steps round a fire pit, open to the south; at sunset the kecak dancers sit in a ring
  const kecak = kecakOn(localHM());
  const amph = (() => { const cx = 200, cy = 380;
    const rings = [[80, 58, C.coral[1]], [68, 48, C.coral[0]], [56, 39, C.coral[1]], [44, 30, C.coral[0]]].map(([rx, ry, c]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" style="fill:${c};stroke:${C.cline}" stroke-width="1"/>`).join("");
    const dancers = kecak ? Array.from({length: 18}, (_, k) => { const a = k/18*Math.PI*2; return `<g transform="translate(${f1(cx + Math.cos(a)*26)} ${f1(cy + 4 + Math.sin(a)*15)})"><path d="M-3 0 h6 v-4 h-6z" fill="#2A2826"/><path d="M-3 -2 h6" style="stroke:#F2EFE6" stroke-width="1.4" stroke-dasharray="1.5 1.5"/><circle cx="0" cy="-6" r="2.2" fill="#6E4A32"><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur=".5s" begin="${f1(k*.07)}s" repeatCount="indefinite"/></circle></g>`; }).join("") : "";
    const fire = `${lampGlow(cx, cy, kecak ? 34 : 14)}<ellipse cx="${cx}" cy="${cy + 4}" rx="10" ry="4" style="fill:${C.vstone[0]}"/><path d="M${cx - 6} ${cy + 3} l12 -2 M${cx - 6} ${cy} l12 3" style="stroke:#6E4A32" stroke-width="2"/>
      <path d="M${cx - 5} ${cy + 2} Q${cx - 4} ${cy - 8} ${cx} ${cy - (kecak ? 18 : 9)} Q${cx + 4} ${cy - 8} ${cx + 5} ${cy + 2}z" fill="#F28A3A"><animate attributeName="opacity" values="1;.7;1" dur=".7s" repeatCount="indefinite"/></path><path d="M${cx - 2.4} ${cy + 2} Q${cx} ${cy - 6} ${cx + 2.4} ${cy + 2}z" fill="#FFE08A"/>`;
    return place("bakecak", 200, 456, 32, 10, "The amphitheatre: the kecak fire dance at sunset",
      `<g pointer-events="none">${sk(rings + `<ellipse cx="${cx}" cy="${cy}" rx="32" ry="20" style="fill:#D9CDB0"/><path d="M${cx - 16} ${cy + 18} L${cx - 24} ${cy + 58} H${cx + 24} L${cx + 16} ${cy + 18}z" style="fill:#D9CDB0"/>`, `<ellipse cx="${cx}" cy="${cy}" rx="80" ry="58"/>`)}${dancers}${fire}${canang(cx - 22, cy + 52)}</g>`,
      kecak ? "Fire dance" : "Amphitheatre", 200, 478, "#FBE0B8"); })();
  const cliffPath = place("bacliff", 400, 330, 26, 10, "The cliff path: frangipani and a long, long drop", "", "Cliff path", 368, 352, "#DCEBC8");
  // the surf lookout: a railed platform at the cliff corner, a bench
  const surf = place("basurf", 380, 520, 30, 10, "The surf: tiny waves far below, and they're not tiny",
    `<g pointer-events="none">${sk(`<path d="M394 512 L418 500 L428 534 L404 540z" style="fill:${C.coral[2]}"/><path d="M394 512 L418 500 L428 534" fill="none" style="stroke:${C.wood}" stroke-width="2"/><rect x="398" y="514" width="16" height="4" style="fill:${C.wood}"/>`, `<path d="M394 512 L418 500 L428 534 L404 540z"/>`)}</g>`,
    "Surf", 354, 542, "#CFE2EE");
  const trees = frangipani(386, 268, 1.1, true) + frangipani(382, 410, 1) + frangipani(360, 480, .9, true) + frangipani(40, 400, 1) + frangipani(300, 380, .8, true) + frangipani(110, 220, .9)
    + bush(20, 130, 14, 0) + bush(90, 40, 12, 1) + bush(170, 160, 10, 2) + bush(30, 520, 12, 1) + bush(250, 540, 10, 0) + bush(400, 40, 12, 2) + bush(330, 40, 10, 0)
    + tufts([[140, 280], [60, 160], [330, 260], [250, 380], [100, 300], [300, 470], [160, 530]]);
  return lampDefs + ground + ways + wall + temple + amph + surf + cliffPath + trees + penjor(300, 228, -1, 84)
    + gate("baToSeminyakW", 16, 330, "Seminyak", 66, 296, "West along the coast to Seminyak", "#CFE2EE")
    + gate("baToUbudN", 262, 26, "Ubud", 200, 30, "North to Ubud", "#DCEBC8");
}

export function baliArt(scene){
  return scene === "ba_ubud" ? ubudScreen() : scene === "ba_tegallalang" ? tegallalangScreen() : scene === "ba_uluwatu" ? uluwatuScreen() : seminyakScreen();
}

// The crossing to Bali (both ways): a white ferry with a turquoise band on a warm turquoise sea; going out, a green island
// with a smoking volcano and palm trees on the horizon, flying fish skipping alongside; coming home, Honeybrook's hills.
export function blFerryRideArt(home){
  const fish = home ? "" : [[120, 70, 0], [200, 78, 1], [260, 66, 2]].map(([x, y, i]) => `<g stroke="none"><animateTransform attributeName="transform" type="translate" values="0 0;24 -12;48 -14;72 -4;96 4" dur="${1.8 + i*.3}s" begin="${f1(-i*.6)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;1;0" dur="${1.8 + i*.3}s" begin="${f1(-i*.6)}s" repeatCount="indefinite"/>
    <g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="7" ry="2.2" fill="#8FB4CC"/><path d="M-1 -1 l-4 -7 l8 6z M-1 1 l-4 7 l8 -6z" fill="#5E8EB0"/><path d="M-7 0 l-4 -3 v6z" fill="#5E8EB0"/><circle cx="4.6" cy="-.4" r=".7" fill="#1E1A16"/></g></g>`).join("");
  const smoke = home ? "" : [0, 1, 2].map(i => `<circle cx="480" cy="10" r="3" fill="#CFC8BC" opacity="0" stroke="none"><animate attributeName="cy" values="10;-14" dur="${4 + i}s" begin="${-i*1.6}s" repeatCount="indefinite"/><animate attributeName="cx" values="480;${490 + i*4}" dur="${4 + i}s" begin="${-i*1.6}s" repeatCount="indefinite"/><animate attributeName="r" values="4;11" dur="${4 + i}s" begin="${-i*1.6}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="${4 + i}s" begin="${-i*1.6}s" repeatCount="indefinite"/></circle>`).join("");
  const tinyPalm = (x, y) => `<path d="M${x} ${y} q1 -8 3 -14" fill="none" stroke="#6A5640" stroke-width="1.4"/><path d="M${x + 3} ${y - 14} q-6 -1 -9 3 M${x + 3} ${y - 14} q6 -1 9 3 M${x + 3} ${y - 14} q-3 -5 -8 -5 M${x + 3} ${y - 14} q3 -5 8 -5" fill="none" stroke="#3F7A32" stroke-width="2"/>`;
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    ${home ? `<path d="M0 56 Q75 34 150 50 T300 50 V60 H0z" fill="#9CC27E"/><path d="M180 56 Q240 40 300 50 T420 52 V60 H180z" fill="#B2CF92"/>`
      : `<path d="M420 56 L472 12 H488 L540 56z" fill="#6E8A5E"/><path d="M462 21 L472 12 H488 L498 21 l-6 3 l-6 -3 l-6 3 l-6 -3 l-6 3z" fill="#8A7A66"/><path d="M472 12 H488" stroke="#5A4A3A" stroke-width="2"/>${smoke}
        <path d="M360 56 Q380 44 420 42 Q470 36 520 44 Q570 44 600 56z" fill="#4E8C42"/><path d="M380 50 Q420 46 470 48" fill="none" stroke="#3E7A3A" stroke-width="1"/>${tinyPalm(384, 50)}${tinyPalm(400, 46)}${tinyPalm(556, 48)}${tinyPalm(574, 52)}`}
    <path d="M0 56 H600 V90 H0z" fill="${C.sea}"/><path d="M0 56 H600" stroke="${C.foam}" stroke-width="1.4"/>${[20, 90, 150, 220, 290, 350, 420, 480, 550].map((x, i) => `<path d="M${x} ${66 + (i % 3)*8} q5 -6 10 0 q5 6 10 0" fill="none" stroke="${C.foam}" stroke-width="1.4"><animateTransform attributeName="transform" type="translate" values="0 0;5 -1;0 0" dur="${1.4 + (i % 3)*.4}s" repeatCount="indefinite"/></path>`).join("")}
    ${fish}</g></svg>`;
  const boat = `<div class="taxiboat"><svg viewBox="0 0 160 60" width="230" height="86" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.3" stroke-linejoin="round">
    <path d="M4 32 H156 L144 56 H16 Q8 46 4 32z" fill="${C.white}"/><path d="M6 38 H154 L151 45 H9z" fill="${C.turq}"/><path d="M12 51 H148" stroke="${C.gold}" stroke-width="1.2"/>
    <rect x="26" y="18" width="104" height="14" rx="2" fill="${C.white}"/>${Array.from({length: 11}, (_, k) => `<rect x="${31 + k*8.8}" y="22" width="5.4" height="5" rx="1" fill="#7FC2C6" stroke-width=".6"/>`).join("")}<rect x="96" y="8" width="30" height="10" rx="2" fill="${C.white}"/><rect x="99" y="10" width="24" height="4" rx="1" fill="#3E8A90" stroke-width=".6"/>
    <path d="M58 18 L61 0 H77 L80 18z" fill="${C.turq}"/><path d="M60.4 5 H77.6" stroke="${C.white}" stroke-width="4"/><path d="M118 8 V0"/><path d="M118 1 h8 l-2 2 l2 2 h-8" fill="#E8463A"/>
    <circle cx="40" cy="14" r="3.6" fill="#F2D3BC"/><circle cx="50" cy="14" r="3.6" fill="#C99A78"/></g></svg></div>`;
  return bank + boat;
}
