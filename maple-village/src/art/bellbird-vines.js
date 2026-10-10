// Bellbird Valley, the Vines (round 141): six stops of two screens each, inspired by the Yarra Valley. Golden grass,
// white-trunked river gums with blue-green crowns, yellow wattle, vine rows following the hills, corrugated-iron roofs
// and timber verandas, red-brown earth tracks. Nothing like Honeybrook's palette. Calm on purpose: detail round the
// edges, a clear middle. See data/bellbird.js for the places and the stops.
import { dayKey, sgHM } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs } from "./village-extras.js";
import { seasonOf } from "../data/items.js";
import { campervan } from "./hlane.js";

const C = {grass: "#DCCF94", grass2: "#CFC27F", dry: "#E6DBA8", track: "#D9B48A", track2: "#C49A6E", gum: "#E9E3D6", gumLine: "#B7AE9E", leaf: "#8FAE9A", leaf2: "#7A9A86",
  wattle: "#F2CF3A", iron: "#B9BEC4", iron2: "#9EA4AC", weather: "#F3EAD6", red: "#B5503A", water: "#7FAFC0", water2: "#9CC4D0", vine: "#7FA35A", vine2: "#94B56A", ink: "#2F2B28"};
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// the way across to the stop's other screen: a little timber fingerpost
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 32}" width="6" height="40" style="fill:#8A6A52"/><path d="M${x + 3} ${y - 30} h24 l6 6 l-6 6 h-24z" style="fill:#F3EAD6"/>`, `<rect x="${x - 3}" y="${y - 32}" width="6" height="40"/><path d="M${x + 3} ${y - 30} h24 l6 6 l-6 6 h-24z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const ground = (col = C.grass) => `<rect width="520" height="640" style="fill:${col}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="140" cy="420" rx="160" ry="90" style="fill:${C.grass2}"/><ellipse cx="400" cy="560" rx="140" ry="70" style="fill:${C.dry}"/></g>`;
// the hills along the top of a screen: a far blue ridge, a nearer green-gold one striped with vines
const hills = (y = 110) => `<g pointer-events="none">${sk(`<path d="M0 ${y - 40} Q80 ${y - 80} 170 ${y - 54} T340 ${y - 66} T520 ${y - 50} V${y} H0z" style="fill:#AFC2C8"/><path d="M0 ${y - 10} Q120 ${y - 50} 260 ${y - 24} T520 ${y - 30} V${y + 10} H0z" style="fill:#C2C98E"/>`, `<path d="M0 ${y - 10} Q120 ${y - 50} 260 ${y - 24} T520 ${y - 30}"/>`)}
  ${[0, 1, 2, 3].map(i => `<path d="M${10 + i*30} ${y - 4 - i*6} Q${200} ${y - 30 - i*6} ${400 + i*20} ${y - 12 - i*5}" fill="none" style="stroke:${C.vine}" stroke-width="2" stroke-dasharray="3 3" opacity=".7"/>`).join("")}</g>`;
// a river gum: pale patchy trunk, crooked limbs, a loose blue-green crown (about 1.3 trees tall)
const gum = (x, y, s = 1, i = 0) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 2}" rx="${16*s}" ry="${4*s}" fill="#6F7C5C" opacity=".2"/>${sk(`<path d="M${x - 3*s} ${y} q${-2*s} ${-24*s} ${2*s} ${-46*s} l${4*s} 0 q${3*s} ${22*s} ${2*s} ${46*s}z" style="fill:${C.gum}"/><path d="M${x} ${y - 30*s} q${-10*s} ${-6*s} ${-16*s} ${-16*s} M${x + 1*s} ${y - 36*s} q${10*s} ${-4*s} ${14*s} ${-16*s}" fill="none" style="stroke:${C.gum}" stroke-width="${3*s}"/>
  ${[[-16, -54, 15], [2, -64, 17], [16, -52, 13], [-4, -46, 12]].map(([dx, dy, r], k) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*.75*s}" style="fill:${(k + i) % 2 ? C.leaf : C.leaf2}" opacity=".95"/>`).join("")}<path d="M${x - 1*s} ${y - 12*s} q${2*s} -3 ${3*s} 0 M${x + 1*s} ${y - 26*s} q${-2*s} -3 ${-3*s} 0" fill="none" style="stroke:${C.gumLine}" stroke-width="1"/>`,
  `<path d="M${x - 3*s} ${y} q${-2*s} ${-24*s} ${2*s} ${-46*s} M${x + 3*s} ${y - 46*s} q${3*s} ${22*s} ${2*s} ${46*s}"/>`)}</g>`;
const wattle = (x, y, s = 1) => `<g pointer-events="none">${sk(`<path d="M${x} ${y} v${-14*s}" style="stroke:#6B5444" stroke-width="${2.4*s}"/>${[[-8, -20], [0, -26], [8, -20], [-4, -16], [5, -15]].map(([dx, dy], k) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${9*s}" ry="${7*s}" style="fill:${k % 2 ? "#9DB27A" : "#A9BC86"}"/>`).join("")}${ssn() === "spring" || ssn() === "winter" ? Array.from({length: 14}, (_, k) => `<circle cx="${x + (rnd(k + x) - .5)*24*s}" cy="${y + (-12 - rnd(k + y)*18)*s}" r="${1.8*s}" style="fill:${C.wattle}"/>`).join("") : ""}`, ``)}</g>`;
// a corrugated-iron roofed building: weatherboard walls, a veranda, a sign, a door
function shed(x, y, w, h, o = {}){
  const wall = o.wall || C.weather, roof = o.roof || C.iron, dx = o.doorX != null ? o.doorX : w/2, ry = y - (o.roofH || 16);
  const ribs = Array.from({length: Math.floor(w/8)}, (_, i) => `<path d="M${x - 6 + i*8 + 4} ${ry + 2} v${(o.roofH || 16) - 2}" style="stroke:${C.iron2}" stroke-width="1"/>`).join("");
  const boards = Array.from({length: Math.floor(h/7)}, (_, i) => `<path d="M${x} ${y + 6 + i*7} h${w}" style="stroke:#00000014" stroke-width="1"/>`).join("");
  const wins = (o.wins || []).map(wx => `<rect x="${x + wx - 9}" y="${y + 14}" width="18" height="16" rx="1" style="fill:#9CC4D0"/><path d="M${x + wx} ${y + 14} v16 M${x + wx - 9} ${y + 22} h18" style="stroke:#FFFDF6" stroke-width="1.4"/>`).join("");
  const ver = o.veranda ? `<rect x="${x - 4}" y="${y + h - 30}" width="${w + 8}" height="6" style="fill:${C.iron}"/>${Array.from({length: Math.floor(w/26) + 1}, (_, i) => `<rect x="${x - 2 + i*((w + 4)/Math.floor(w/26))}" y="${y + h - 24}" width="3" height="24" style="fill:#8A6A52"/>`).join("")}` : "";
  return `<g pointer-events="none"><path d="M${x + w} ${y + 6} l10 7 V${y + h + 7} H${x + 10} l-10 -7z" style="fill:#6F7C5C" opacity=".16"/></g>` + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${wall}"/>${boards}<path d="M${x - 8} ${y + 2} L${x + 6} ${ry} H${x + w - 6} L${x + w + 8} ${y + 2}z" style="fill:${roof}"/>${ribs}${wins}
    <rect x="${x + dx - 11}" y="${y + h - 26}" width="22" height="26" rx="2" style="fill:${o.door || "#6B5444"}"/>${ver}`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x - 8} ${y + 2} L${x + 6} ${ry} H${x + w - 6} L${x + w + 8} ${y + 2}z"/><rect x="${x + dx - 11}" y="${y + h - 26}" width="22" height="26" rx="2"/>`)
    + (o.sign ? `<rect x="${x + w/2 - o.sign.length*3.1 - 6}" y="${ry - 12}" width="${o.sign.length*6.2 + 12}" height="13" rx="2" style="fill:${o.signCol || "#FFFDF6"};stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x + w/2}" y="${ry - 2.6}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}" pointer-events="none">${o.sign}</text>` : "");
}
const track = (d, w = 26) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.track2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.track}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
// rows of vines across a slope (gold and red in autumn, bare canes in winter)
const vines = (x1, x2, ys, bend = 14) => { const s = ssn(), c1 = s === "autumn" ? "#D9A441" : s === "winter" ? "#8A6A52" : C.vine, c2 = s === "autumn" ? "#C9683A" : s === "winter" ? "#A0866A" : C.vine2;
  return `<g pointer-events="none">${ys.map((y, i) => `<path d="M${x1} ${y} Q${(x1 + x2)/2} ${y - bend} ${x2} ${y}" fill="none" style="stroke:#6B5444" stroke-width="1.2"/>${Array.from({length: Math.floor((x2 - x1)/16)}, (_, k) => { const x = x1 + 8 + k*16, t = (x - x1)/(x2 - x1), yy = y - 4*bend*t*(1 - t) - 4;
    return s === "winter" ? `<path d="M${x} ${yy + 4} v-8 M${x} ${yy} l-4 -4 M${x} ${yy} l4 -4" fill="none" style="stroke:${c1}" stroke-width="1.2"/>` : `<ellipse cx="${x}" cy="${yy}" rx="8" ry="6" style="fill:${(k + i) % 2 ? c1 : c2}"/>${s === "summer" || s === "autumn" ? `<circle cx="${x + 2}" cy="${yy + 4}" r="2" style="fill:${i % 2 ? "#5A3A6E" : "#C9C46A"}"/>` : ""}`; }).join("")}<rect x="${x2 - 6}" y="${y - 12}" width="6" height="10" rx="2" style="fill:#E8566C"/>`).join("")}</g>`; };   // (a rose at the end of each row)
const fence = (x1, x2, y) => `<g pointer-events="none">${Array.from({length: Math.floor((x2 - x1)/22) + 1}, (_, i) => `<rect x="${x1 + i*22}" y="${y - 14}" width="4" height="16" style="fill:#8A6A52"/>`).join("")}<path d="M${x1} ${y - 10} H${x2} M${x1} ${y - 4} H${x2}" style="stroke:#8A6A52" stroke-width="2"/></g>`;
// the van, parked: Mel's campervan (art/hlane.js), wearing this stop's place id
const myVan = (id, x, y) => campervan(x, y).replace('data-place="van"', `data-place="${id}"`).replace('aria-label="The campervan"', 'aria-label="Your campervan: the road map"') + lab(x, y + 22, "Your van", "#C3E8DA", 10);
// little animals and props
const roo = (x, y, dir = 1, sit = false) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${dir*1.4} 1.4)">${sk(sit ? `<ellipse cx="0" cy="-6" rx="14" ry="6" style="fill:#B9825E"/><ellipse cx="12" cy="-10" rx="5" ry="4" style="fill:#B9825E"/><path d="M14 -14 l1 -5 l2 4" style="fill:#B9825E"/><path d="M-14 -6 q-12 2 -16 8" fill="none" style="stroke:#B9825E" stroke-width="3"/>`
  : `<path d="M-6 0 q-4 -16 2 -26 q6 -6 10 -2 q4 10 0 26z" style="fill:#B9825E"/><ellipse cx="4" cy="-32" rx="5" ry="4" style="fill:#B9825E"/><path d="M2 -36 l-1 -6 l3 4 M6 -36 l1 -6 l2 5" style="fill:#B9825E;stroke:#3a2e28" stroke-width=".8"/><path d="M-6 -2 q-14 0 -18 8" fill="none" style="stroke:#B9825E" stroke-width="3.4"/><path d="M-2 0 h8" style="stroke:#8A5A3A" stroke-width="3"/>`, ``)}<circle cx="${sit ? 14 : 6}" cy="${sit ? -11 : -33}" r=".9" fill="#2F2B28"/></g>`;
const koala = (x, y) => `<g pointer-events="none">${sk(`<ellipse cx="${x}" cy="${y}" rx="7" ry="8" style="fill:#9A9AA2"/><circle cx="${x}" cy="${y - 9}" r="6" style="fill:#A8A8B0"/><circle cx="${x - 6}" cy="${y - 13}" r="3.4" style="fill:#C9C9CF"/><circle cx="${x + 6}" cy="${y - 13}" r="3.4" style="fill:#C9C9CF"/><ellipse cx="${x}" cy="${y - 8}" rx="2" ry="2.6" style="fill:#3A3430"/>`, ``)}</g>`;
const wombat = (x, y) => `<g pointer-events="none">${sk(`<ellipse cx="${x}" cy="${y}" rx="14" ry="9" style="fill:#8A7462"/><ellipse cx="${x + 12}" cy="${y - 3}" rx="7" ry="6" style="fill:#8A7462"/><circle cx="${x + 14}" cy="${y - 9}" r="2" style="fill:#8A7462"/>`, ``)}<circle cx="${x + 15}" cy="${y - 4}" r=".9" fill="#2F2B28"/></g>`;
const kookaburra = (x, y) => `<g pointer-events="none">${sk(`<ellipse cx="${x}" cy="${y}" rx="6" ry="8" style="fill:#E9E3D6"/><path d="M${x - 5} ${y - 4} q-4 10 2 14 l6 -2z" style="fill:#7A5A3A"/><circle cx="${x + 2}" cy="${y - 9}" r="5" style="fill:#E9E3D6"/><path d="M${x + 6} ${y - 10} l7 2 l-7 2z" style="fill:#3A3430"/><path d="M${x - 2} ${y - 10} h6" style="stroke:#5A3A2A" stroke-width="1.4"/>`, ``)}</g>`;
// a hot-air balloon: up (floating) or on the ground filling with air
const balloon = (x, y, cols, s = 1, up = true) => `<g pointer-events="none">${up ? "" : `<ellipse cx="${x}" cy="${y + 2}" rx="${30*s}" ry="${6*s}" fill="#6F7C5C" opacity=".2"/>`}${sk(`<path d="M${x} ${y - 96*s} C${x - 44*s} ${y - 96*s} ${x - 44*s} ${y - 40*s} ${x - 10*s} ${y - 22*s} L${x + 10*s} ${y - 22*s} C${x + 44*s} ${y - 40*s} ${x + 44*s} ${y - 96*s} ${x} ${y - 96*s}z" style="fill:${cols[0]}"/>
  <path d="M${x} ${y - 96*s} C${x - 14*s} ${y - 90*s} ${x - 14*s} ${y - 40*s} ${x - 4*s} ${y - 22*s} L${x + 4*s} ${y - 22*s} C${x + 14*s} ${y - 40*s} ${x + 14*s} ${y - 90*s} ${x} ${y - 96*s}z" style="fill:${cols[1]}"/><path d="M${x - 36*s} ${y - 66*s} Q${x} ${y - 58*s} ${x + 36*s} ${y - 66*s}" fill="none" style="stroke:${cols[2] || "#FFFDF6"}" stroke-width="${4*s}"/>
  <path d="M${x - 9*s} ${y - 22*s} L${x - 6*s} ${y - 10*s} M${x + 9*s} ${y - 22*s} L${x + 6*s} ${y - 10*s}" style="stroke:#5A4636" stroke-width="1"/><rect x="${x - 7*s}" y="${y - 10*s}" width="${14*s}" height="${10*s}" rx="1.5" style="fill:#C9A27E"/>`,
  `<path d="M${x} ${y - 96*s} C${x - 44*s} ${y - 96*s} ${x - 44*s} ${y - 40*s} ${x - 10*s} ${y - 22*s} L${x + 10*s} ${y - 22*s} C${x + 44*s} ${y - 40*s} ${x + 44*s} ${y - 96*s} ${x} ${y - 96*s}z"/><rect x="${x - 7*s}" y="${y - 10*s}" width="${14*s}" height="${10*s}" rx="1.5"/>`)}</g>`;
const lyingBalloon = (x, y, cols) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 4}" rx="70" ry="10" fill="#6F7C5C" opacity=".18"/>${sk(`<path d="M${x - 70} ${y} Q${x - 60} ${y - 40} ${x} ${y - 42} Q${x + 50} ${y - 38} ${x + 60} ${y} z" style="fill:${cols[0]}"/><path d="M${x - 70} ${y} Q${x - 40} ${y - 30} ${x} ${y - 30} Q${x + 36} ${y - 28} ${x + 60} ${y}" fill="none" style="stroke:${cols[1]}" stroke-width="7"/><rect x="${x + 62}" y="${y - 12}" width="20" height="14" rx="2" style="fill:#C9A27E" transform="rotate(80 ${x + 72} ${y - 5})"/>`, `<path d="M${x - 70} ${y} Q${x - 60} ${y - 40} ${x} ${y - 42} Q${x + 50} ${y - 38} ${x + 60} ${y} z"/>`)}</g>`;
// another campervan or caravan on the campsite
const kombi = (x, y, a, b) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 3}" rx="40" ry="6" fill="#6F7C5C" opacity=".2"/>${sk(`<path d="M${x - 38} ${y - 6} V${y - 34} q0 -10 12 -10 h52 q12 0 12 10 V${y - 6}z" style="fill:${b}"/><path d="M${x - 38} ${y - 24} h76 V${y - 6} h-76z" style="fill:${a}"/><path d="M${x - 10} ${y - 44} v38" style="stroke:#FFFDF6" stroke-width="2"/>${[-30, -14, 6, 20].map(dx => `<rect x="${x + dx}" y="${y - 40}" width="12" height="10" rx="2" style="fill:#CFE0EE"/>`).join("")}<circle cx="${x - 22}" cy="${y - 4}" r="6" style="fill:#3A2E28"/><circle cx="${x + 22}" cy="${y - 4}" r="6" style="fill:#3A2E28"/>`, `<path d="M${x - 38} ${y - 6} V${y - 34} q0 -10 12 -10 h52 q12 0 12 10 V${y - 6}z"/>`)}</g>`;
const caravan = (x, y, col) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 3}" rx="44" ry="6" fill="#6F7C5C" opacity=".2"/>${sk(`<rect x="${x - 40}" y="${y - 40}" width="80" height="34" rx="14" style="fill:#F3EAD6"/><path d="M${x - 40} ${y - 18} h80" style="stroke:${col}" stroke-width="5"/><rect x="${x - 28}" y="${y - 34}" width="16" height="11" rx="3" style="fill:#CFE0EE"/><rect x="${x + 8}" y="${y - 34}" width="22" height="11" rx="3" style="fill:#CFE0EE"/><rect x="${x - 6}" y="${y - 30}" width="10" height="24" rx="2" style="fill:${col}"/><circle cx="${x}" cy="${y - 4}" r="6" style="fill:#3A2E28"/><path d="M${x + 40} ${y - 10} h12" style="stroke:#3A2E28" stroke-width="2"/>`, `<rect x="${x - 40}" y="${y - 40}" width="80" height="34" rx="14"/>`)}</g>`;
const campChair = (x, y, col) => `<g pointer-events="none">${sk(`<path d="M${x - 7} ${y} l3 -10 h8 l3 10" fill="none" style="stroke:#5A4636" stroke-width="1.4"/><rect x="${x - 7}" y="${y - 20}" width="14" height="11" rx="2" style="fill:${col}"/>`, ``)}</g>`;
const fireRing = (x, y, lit) => `<g pointer-events="none">${sk(`${Array.from({length: 9}, (_, i) => { const a = i/9*Math.PI*2; return `<ellipse cx="${x + Math.cos(a)*14}" cy="${y + Math.sin(a)*6}" rx="4" ry="3" style="fill:#9A8E80"/>`; }).join("")}<path d="M${x - 7} ${y + 1} l14 -3 M${x - 6} ${y - 3} l12 4" style="stroke:#6B4A2E" stroke-width="3"/>`, ``)}${lit ? `<path class="flick" d="M${x - 5} ${y - 2} q2 -12 5 -16 q3 6 5 16z" fill="#F29A2E"/><path d="M${x - 2} ${y - 3} q1 -7 2 -9 q2 4 2 9z" fill="#FFE38A"/>` : ""}</g>`;
const picnicTable = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x - 22}" y="${y - 14}" width="44" height="8" rx="1" style="fill:#B98A5E"/><rect x="${x - 26}" y="${y - 4}" width="52" height="4" style="fill:#A0754E"/><path d="M${x - 16} ${y - 6} v8 M${x + 16} ${y - 6} v8" style="stroke:#7A5A3A" stroke-width="2"/>`, ``)}</g>`;
const waterBand = (d, lines = []) => `<g pointer-events="none">${sk(`<path d="${d}" style="fill:${C.water}"/>`, `<path d="${d}"/>`)}${lines.map(([x, y], i) => `<path d="M${x} ${y} q5 -3 10 0 q5 3 10 0" fill="none" style="stroke:#E3F0F2" stroke-width="1.3"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
const flowers = pts => `<g pointer-events="none">${pts.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${c}"/><circle cx="${x + 4}" cy="${y + 2}" r="1.8" fill="${c}"/>`).join("")}</g>`;

/* ---------- Valley Gate: the turn-off (bg_gate) and the old bridge (bg_bridge) ---------- */
function gateScreen(){
  const road = track("M150 640 Q150 560 200 500 Q260 440 380 420 Q460 410 520 400", 34) + track("M380 420 Q380 320 380 240 M200 500 Q160 380 150 240", 20);
  const sign = place("bvsign", 110, 340, 36, 9, "The Bellbird Valley sign", sk(`<rect x="70" y="270" width="6" height="66" style="fill:#7A5A3A"/><rect x="144" y="270" width="6" height="66" style="fill:#7A5A3A"/><rect x="62" y="262" width="96" height="34" rx="3" style="fill:#B98A5E"/>`, `<rect x="62" y="262" width="96" height="34" rx="3"/>`)
    + `<text x="110" y="276" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="#FFFDF6" pointer-events="none">BELLBIRD</text><text x="110" y="289" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="#FFFDF6" pointer-events="none">VALLEY</text>` + wattle(176, 334, 1.2), "", 0, 0);
  const stand = place("bvstand", 270, 380, 34, 9, "The farm-gate stand", sk(`<rect x="240" y="352" width="60" height="8" style="fill:#B98A5E"/><path d="M246 360 v18 M294 360 v18" style="stroke:#7A5A3A" stroke-width="2.4"/><rect x="246" y="342" width="12" height="10" style="fill:#F3EAD6"/><rect x="262" y="344" width="14" height="8" style="fill:#E3B04B"/><rect x="280" y="340" width="10" height="12" style="fill:#9A9AA0"/><path d="M234 336 l8 -18 h56 l8 18z" style="fill:${C.iron}"/>`, `<rect x="240" y="352" width="60" height="8"/><path d="M234 336 l8 -18 h56 l8 18z"/>`)
    + `<g pointer-events="none">${[[248, 344, "#F3EAD6"], [252, 342, "#F3EAD6"], [266, 342, "#C8432F"], [270, 342, "#C8432F"], [284, 336, "#E8566C"], [286, 334, "#F3C969"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join("")}</g>`, "Farm-gate stand", 270, 404, "#FBE0B8");
  const store = place("bvstore", 380, 230, 46, 10, "Dunn's General Store", shed(320, 130, 140, 96, {veranda: true, wins: [26, 114], sign: "DUNN'S GENERAL STORE", roof: C.red, wall: "#F3E3C3"})
    + sk(`<rect x="462" y="196" width="12" height="18" rx="5" style="fill:#C8432F"/><path d="M468 214 v12" style="stroke:#5A4636" stroke-width="2"/>`, `<rect x="462" y="196" width="12" height="18" rx="5"/>`), "General store", 380, 252, "#F6E3B4");
  const farmshed = place("bvshed", 150, 230, 40, 10, "The farm-gate shed", shed(84, 146, 132, 80, {sign: "FARM GATE", roof: C.iron, wall: "#C9785A", door: "#5A3A2E", wins: [28]})
    + `<g pointer-events="none">${[[96, 222], [112, 224], [190, 222], [204, 224]].map(([x, y], i) => `<rect x="${x - 6}" y="${y - 8}" width="12" height="8" style="fill:#B98A5E" stroke="#3a2e28" stroke-width=".7"/><circle cx="${x - 2}" cy="${y - 9}" r="2.4" fill="${i % 2 ? "#C8432F" : "#9CC27E"}"/><circle cx="${x + 2}" cy="${y - 9}" r="2.4" fill="${i % 2 ? "#E3B04B" : "#C8432F"}"/>`).join("")}</g>`, "Farm-gate shed", 150, 252, "#FBE0B8");
  const trees = gum(36, 300, 1.1, 0) + gum(480, 560, 1.2, 1) + gum(40, 600, 1, 2) + gum(250, 600, .9, 1) + gum(490, 300, 1, 2) + wattle(320, 560, 1);
  return lampDefs + ground() + hills() + road + trees + farmshed + store + sign + stand + flowers([[220, 300, "#F3C969"], [430, 330, "#FFFDF6"], [60, 470, "#C3CDEE"]])
    + myVan("bvvan_gate", 150, 520) + gate("bvToBridge", 504, 400, "Bridge", 470, 368, "East to the old bridge");
}
function bridgeScreen(){
  const creek = waterBand("M200 0 Q230 160 214 300 Q200 420 230 640 H310 Q290 420 300 300 Q316 160 290 0z", [[220, 120], [240, 200], [230, 480], [250, 560]]);
  const reeds = `<g pointer-events="none">${[[196, 200], [304, 160], [204, 440], [300, 500], [214, 560]].map(([x, y]) => `<path d="M${x} ${y} q-2 -12 -6 -16 M${x + 3} ${y} q0 -14 2 -18 M${x + 6} ${y} q3 -10 8 -12" fill="none" style="stroke:#6E8A4A" stroke-width="1.6"/>`).join("")}</g>`;
  const bridge = place("bvbridge", 250, 330, 50, 10, "The old bridge", sk(`<rect x="186" y="286" width="132" height="40" style="fill:#B98A5E"/>${Array.from({length: 11}, (_, i) => `<path d="M${192 + i*12} 286 v40" style="stroke:#8A6A52" stroke-width="1.2"/>`).join("")}<path d="M186 284 h132 M186 328 h132" style="stroke:#7A5A3A" stroke-width="4"/>${[190, 230, 274, 314].map(x => `<rect x="${x - 3}" y="272" width="6" height="16" style="fill:#7A5A3A"/><rect x="${x - 3}" y="318" width="6" height="16" style="fill:#7A5A3A"/>`).join("")}`,
    `<rect x="186" y="286" width="132" height="40"/>`), "The old bridge", 250, 356, "#C3DDF3");
  const road = track("M0 400 Q100 380 186 306 M318 306 Q380 290 390 240", 26);
  const opshop = place("bvopshop", 390, 230, 46, 10, "The op shop", shed(326, 132, 130, 94, {sign: "OP SHOP", roof: C.iron, wall: "#F3EAD6", wins: [24, 106], door: "#3E6B8C"})
    + sk(`<path d="M384 116 l8 -16 l8 16z" style="fill:${C.iron}"/><rect x="386" y="116" width="12" height="16" style="fill:#F3EAD6"/><circle cx="392" cy="124" r="3" style="fill:#C9A24A"/>`, `<path d="M384 116 l8 -16 l8 16z"/><rect x="386" y="116" width="12" height="16"/>`)
    + `<g pointer-events="none"><rect x="462" y="190" width="18" height="34" rx="2" style="fill:#E8566C;stroke:var(--line)" stroke-width=".8"/><circle cx="471" cy="200" r="4" fill="#F3C969"/><rect x="465" y="208" width="12" height="12" fill="#9CC4D0"/></g>`, "Op shop", 390, 252, "#F6D3DC");
  const birds = place("bvbellbirds", 120, 520, 40, 10, "The bellbird gums", gum(80, 500, 1.2, 0) + gum(150, 470, 1.1, 1) + `<g pointer-events="none" class="twinkle">${[[92, 432], [150, 410], [70, 450]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#9CC27E"/><path d="M${x + 3} ${y - 6} q3 -3 6 0" fill="none" stroke="#5A4636" stroke-width=".8"/>`).join("")}</g>`, "Bellbird gums", 120, 548, "#DCEBC8");
  const table = picnicTable(140, 330) + gum(40, 260, 1, 2) + gum(470, 560, 1.1, 0) + gum(360, 420, .9, 1) + wattle(440, 420, 1);
  return lampDefs + ground() + hills() + road + creek + reeds + bridge + opshop + birds + table + flowers([[400, 300, "#F3C969"], [160, 400, "#FFFDF6"], [420, 500, "#C3CDEE"]])
    + gate("bvToGate", 16, 400, "The van", 60, 368, "West, back to the van");
}

/* ---------- Balloon Lookout: the launch paddock (bl_paddock) and the view (bl_valley) ---------- */
function paddockScreen(){
  const sky = `<g pointer-events="none"><rect width="520" height="150" style="fill:#F3E7C9" opacity=".6"/>${balloon(90, 120, ["#E8566C", "#F3C969"], .45)}${balloon(440, 110, ["#3E6B8C", "#9FD3E8"], .4)}${balloon(300, 80, ["#9CC27E", "#F3EAD6"], .32)}</g>`;
  const shedB = place("bvballoonshed", 110, 256, 44, 10, "The balloon shed", shed(44, 176, 144, 74, {sign: "BELLBIRD BALLOONS", roof: C.iron2, wall: C.iron, door: "#C8432F", wins: [30, 114]}), "Balloon shed", 110, 276, "#F6E3B4");
  const balloons = place("bvballoons", 300, 360, 70, 14, "The balloons", balloon(270, 350, ["#E8566C", "#F3C969", "#FFFDF6"], 1.6, false) + lyingBalloon(380, 440, ["#3E6B8C", "#9FD3E8"])
    + `<g pointer-events="none"><rect x="300" y="350" width="10" height="16" rx="2" fill="#9EA4AC" stroke="#3a2e28" stroke-width=".8"/><path class="flick" d="M270 196 q-4 -10 0 -16 q4 6 0 16z" fill="#F29A2E"/></g>`, "Balloons", 220, 400, "#F6D3DC");
  const caf = place("bvcoffee", 420, 470, 40, 10, "The coffee caravan", caravan(424, 452, "#C9785A") + sk(`<rect x="388" y="424" width="18" height="12" rx="2" style="fill:#5A4636"/><path d="M450 412 l10 0 l-2 26 h-6z" style="fill:#2F2B28"/>`, ``) + `<text x="455" y="428" text-anchor="middle" font-size="5" fill="#FFFDF6" pointer-events="none">COFFEE</text>`, "Coffee caravan", 420, 494, "#FBE0B8");
  const road = track("M150 640 Q150 580 160 540 Q200 480 300 470 Q300 560 300 640", 26);
  const trees = gum(36, 320, 1.1, 1) + gum(490, 330, 1, 0) + gum(40, 600, 1.1, 2) + gum(490, 610, 1, 1) + wattle(220, 560, .9);
  return lampDefs + ground("#D9D49A") + sky + hills(170) + road + trees + shedB + balloons + caf + fence(300, 480, 600)
    + myVan("bvvan_lookout", 150, 540) + gate("bvToValley", 300, 612, "The lookout", 370, 600, "Down to the lookout");
}
function valleyScreen(){
  const view = `<g pointer-events="none">${sk(`<rect x="0" y="470" width="520" height="170" style="fill:#B7C58C"/><path d="M0 520 Q130 500 260 520 T520 510 V640 H0z" style="fill:#A9BC80"/>`, ``)}${[490, 506, 522, 540, 558, 578, 598, 620].map((y, i) => `<path d="M${-10 + (i % 3)*20} ${y} Q260 ${y - 16} ${530 - (i % 2)*30} ${y}" fill="none" style="stroke:${i % 2 ? C.vine : C.vine2}" stroke-width="3.4" stroke-dasharray="2 3" opacity=".85"/>`).join("")}
    ${[[60, 560], [180, 600], [330, 590], [460, 560]].map(([x, y]) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="8" fill="#F3EAD6" stroke="#3a2e28" stroke-width=".6"/><path d="M${x - 8} ${y - 6} l8 -5 l8 5z" fill="#B5503A"/>`).join("")}
    <path d="M0 548 Q130 532 260 552 T520 544" fill="none" style="stroke:#FFFDF6" stroke-width="12" opacity=".5"/><path d="M0 610 Q160 596 300 612 T520 606" fill="none" style="stroke:#FFFDF6" stroke-width="9" opacity=".45"/>
    ${balloon(110, 560, ["#E8566C", "#F3C969"], .42)}${balloon(300, 530, ["#3E6B8C", "#9FD3E8"], .36)}${balloon(430, 590, ["#9CC27E", "#FFFDF6"], .4)}</g>`;
  const rail = fence(0, 520, 470);
  const lookout = place("bvview", 262, 440, 50, 10, "The lookout", sk(`<rect x="230" y="418" width="64" height="8" rx="2" style="fill:#B98A5E"/><path d="M236 426 v10 M288 426 v10" style="stroke:#7A5A3A" stroke-width="2.4"/>`, `<rect x="230" y="418" width="64" height="8" rx="2"/>`), "The lookout", 262, 458, "#C3DDF3");
  const rugs = place("bvpicnic", 150, 380, 50, 12, "The picnic rugs", `<g pointer-events="none">${[[120, 370, "#E8566C", "#FFFDF6"], [180, 392, "#3E6B8C", "#F3C969"]].map(([x, y, a, b]) => `<rect x="${x - 26}" y="${y - 12}" width="52" height="24" rx="2" fill="${a}" stroke="#3a2e28" stroke-width=".8"/><path d="M${x - 26} ${y - 4} h52 M${x - 26} ${y + 4} h52 M${x - 12} ${y - 12} v24 M${x + 4} ${y - 12} v24" stroke="${b}" stroke-width="2"/>`).join("")}<rect x="140" y="360" width="16" height="10" rx="2" fill="#C9A27E" stroke="#3a2e28" stroke-width=".8"/></g>`, "Picnic rugs", 150, 416, "#F6D3DC");
  const gallery = place("bvgallery", 410, 300, 46, 10, "The lookout gallery", shed(352, 214, 126, 76, {sign: "GALLERY CAFÉ", roof: "#5A6A72", wall: "#E9E3D6", wins: [20, 46, 80, 106], door: "#3E6B8C"}), "Gallery café", 410, 320, "#F6E3B4");
  const road = track("M300 0 Q300 120 280 200 Q250 300 262 410", 22);
  const trees = gum(60, 240, 1.1, 0) + gum(140, 140, 1, 2) + gum(480, 420, 1, 1) + wattle(50, 450, 1) + gum(470, 150, .9, 2);
  return lampDefs + ground() + road + trees + rugs + gallery + lookout + view + rail
    + gate("bvToPaddock", 300, 26, "The paddock", 380, 40, "Up to the launch paddock");
}

/* ---------- The Cellar Door: the vines (bc_vines) and the lawn (bc_lawn) ---------- */
function vinesScreen(){
  const rows = place("bvrows", 300, 380, 60, 12, "The vines", vines(220, 510, [290, 316, 342, 368, 394, 420], 12), "The vines", 380, 440, "#DCEBC8");
  const cellar = place("bvtasting", 390, 230, 46, 10, "The cellar door", shed(320, 130, 140, 96, {sign: "CELLAR DOOR", roof: C.iron, wall: "#D9CBB0", wins: [26, 114], veranda: true, door: "#5A3A2E"})
    + `<g pointer-events="none">${[0, 1, 2].map(i => `<rect x="${330 + i*10}" y="${148 + (i % 2)*3}" width="8" height="5" fill="#C9BCA8" stroke="#8A7A66" stroke-width=".5"/>`).join("")}</g>`, "Cellar door", 390, 252, "#F6D3DC");
  const cave = place("bvcave", 120, 230, 40, 10, "The barrel cave", sk(`<path d="M40 226 Q50 120 124 116 Q196 120 206 226z" style="fill:#9DB27A"/><path d="M98 226 v-34 q22 -26 44 0 v34z" style="fill:#7A5A3A"/><path d="M100 196 h40" style="stroke:#5A3A2E" stroke-width="1.4"/>`, `<path d="M40 226 Q50 120 124 116 Q196 120 206 226"/><path d="M98 226 v-34 q22 -26 44 0 v34z"/>`)
    + `<g pointer-events="none"><ellipse cx="70" cy="218" rx="10" ry="8" fill="#A8754F" stroke="#3a2e28" stroke-width=".8"/><ellipse cx="174" cy="218" rx="10" ry="8" fill="#A8754F" stroke="#3a2e28" stroke-width=".8"/></g>`, "Barrel cave", 120, 252, "#E8D3BC");
  const dog = place("bvdog", 250, 470, 22, 8, "Pinot the kelpie", sk(`<ellipse cx="250" cy="460" rx="12" ry="6" style="fill:#8A5A3A"/><circle cx="262" cy="454" r="5" style="fill:#8A5A3A"/><path d="M260 449 l1 -5 l3 4 M264 449 l2 -5 l2 5" style="fill:#8A5A3A"/><path d="M238 458 q-6 -4 -8 -10" fill="none" style="stroke:#8A5A3A" stroke-width="2.4"/><path d="M244 466 v6 M256 466 v6" style="stroke:#8A5A3A" stroke-width="2.4"/>`, ``), "Pinot", 250, 490, "#FBE0B8");
  const road = track("M140 640 Q140 580 180 540 Q260 490 380 470 Q460 450 520 420 M180 540 Q140 400 120 240 M380 470 Q390 330 390 240", 24);
  const trees = gum(30, 320, 1.1, 1) + gum(490, 600, 1.1, 0) + gum(30, 600, 1, 2) + vines(10, 200, [300, 326, 352], 10);
  return lampDefs + ground() + hills() + road + trees + rows + cave + cellar + dog
    + myVan("bvvan_cellar", 140, 540) + gate("bvToLawn", 504, 420, "Lawn", 474, 388, "East to the lawn");
}
function lawnScreen(){
  const lawn = `<g pointer-events="none"><g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="440" rx="220" ry="140" style="fill:#B9C98A"/></g></g>`;
  const tree = place("bvtree", 230, 360, 50, 12, "The plane tree", `<g pointer-events="none"><ellipse cx="230" cy="350" rx="110" ry="34" fill="#6F7C5C" opacity=".2"/></g>` + sk(`<path d="M218 340 q-4 -40 4 -80 h18 q8 40 4 80z" style="fill:#C9BCA8"/><path d="M224 300 q4 -4 10 0 M222 320 q6 -4 12 2" fill="none" style="stroke:#9A8E80"/>
    ${[[-70, -110, 44], [-20, -140, 52], [40, -120, 48], [80, -96, 36], [-50, -80, 38], [20, -84, 40]].map(([dx, dy, r], k) => `<ellipse cx="${230 + dx}" cy="${360 + dy}" rx="${r}" ry="${r*.72}" style="fill:${ssn() === "autumn" ? (k % 2 ? "#D9A441" : "#C9883A") : ssn() === "winter" ? "transparent" : (k % 2 ? "#8FAE6A" : "#7FA05A")}"/>`).join("")}`, `<path d="M218 340 q-4 -40 4 -80 M244 340 q4 -40 -4 -80"/>`), "Plane tree", 230, 380, "#DCEBC8");
  const bags = place("bvbeanbags", 260, 470, 60, 12, "The beanbags", `<g pointer-events="none">${[[200, 470, "#E8566C"], [240, 486, "#F3C969"], [290, 476, "#3E6B8C"], [330, 492, "#9CC27E"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="10" fill="${c}" stroke="#3a2e28" stroke-width=".9"/><path d="M${x - 8} ${y - 4} q8 -6 16 0" fill="none" stroke="#FFFDF6" stroke-width="1" opacity=".6"/>`).join("")}
    <rect x="300" y="420" width="40" height="8" rx="2" fill="#B98A5E" stroke="#3a2e28" stroke-width=".8"/><path d="M308 428 v8 M332 428 v8" stroke="#7A5A3A" stroke-width="2"/></g>`, "Beanbags", 260, 512, "#F6D3DC");
  const rest = place("bvrestaurant", 400, 230, 46, 10, "The restaurant", shed(330, 130, 150, 96, {sign: "THE LONG TABLE", roof: C.iron, wall: "#F3EAD6", wins: [24, 60, 96, 126], veranda: true, door: "#5A3A2E"})
    + `<g pointer-events="none">${[350, 390, 430, 462].map(x => `<rect x="${x - 10}" y="236" width="20" height="10" rx="1" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".7"/>`).join("")}</g>`, "Restaurant", 400, 262, "#F6E3B4");
  const arch = sk(`<path d="M420 470 v-46 q24 -30 48 0 v46" fill="none" style="stroke:#FFFDF6" stroke-width="5"/>`, `<path d="M420 470 v-46 q24 -30 48 0 v46" />`) + flowers([[420, 440, "#F4C7CF"], [424, 428, "#FFFDF6"], [444, 414, "#F4C7CF"], [462, 426, "#FFFDF6"], [468, 444, "#F4C7CF"]]);
  const lights = `<g pointer-events="none"><path d="M330 240 Q300 300 260 270 Q220 250 160 290" fill="none" stroke="#5A4636" stroke-width=".8"/>${[0, 1, 2, 3, 4, 5, 6].map(i => { const t = i/6, x = 330 - t*170, y = 240 + Math.sin(t*Math.PI)*30; return `<circle cx="${x}" cy="${y + 4}" r="2.4" fill="#FFE38A" class="twinkle" style="animation-delay:-${i*.3}s"/>`; }).join("")}</g>`;
  const trees = gum(40, 600, 1.1, 0) + gum(490, 610, 1, 1) + vines(10, 160, [560, 586], 8);
  return lampDefs + ground() + hills() + lawn + trees + rest + lights + tree + bags + arch
    + gate("bvToVines", 16, 420, "The vines", 60, 388, "West to the vines");
}

/* ---------- The Berry Farm: the rows (bb_rows) and the chocolaterie (bb_choc) ---------- */
function rowsScreen(){
  const s = ssn(), fruit = s === "summer" || s === "spring";
  const straw = `<g pointer-events="none">${[290, 316, 342, 368, 394, 420].map((y, i) => `<path d="M30 ${y} H260" style="stroke:#E8D9A8" stroke-width="12" stroke-linecap="round"/>${Array.from({length: 14}, (_, k) => `<ellipse cx="${40 + k*16}" cy="${y - 3}" rx="6" ry="4" fill="${(k + i) % 2 ? "#7FA35A" : "#94B56A"}"/>${fruit && (k + i) % 3 === 0 ? `<circle cx="${42 + k*16}" cy="${y + 1}" r="2.4" fill="#E8414E"/>` : ""}`).join("")}`).join("")}</g>`;
  const canes = `<g pointer-events="none">${[300, 340, 380, 420].map((y, i) => `<path d="M290 ${y} H500" style="stroke:#8A6A52" stroke-width="1.2"/>${Array.from({length: 13}, (_, k) => `<path d="M${296 + k*16} ${y} v-18" style="stroke:#7A5A3A" stroke-width="1.4"/><ellipse cx="${296 + k*16}" cy="${y - 18}" rx="7" ry="6" fill="${(k + i) % 2 ? "#8FAE6A" : "#7FA05A"}"/>${fruit && (k + i) % 2 === 0 ? `<circle cx="${299 + k*16}" cy="${y - 14}" r="2.2" fill="#D9426E"/>` : ""}`).join("")}`).join("")}</g>`;
  const rows = place("bvberries", 300, 400, 80, 14, "Pick-your-own", straw + canes, "Pick your own", 270, 446, "#F6D3DC");
  const cafe = place("bvberrycafe", 400, 230, 46, 10, "The berry café", shed(330, 128, 140, 98, {sign: "BERRY BARN", roof: C.iron, wall: "#B5443A", wins: [26, 114], door: "#FFFDF6"})
    + picnicTable(470, 270), "Berry café", 400, 252, "#F6D3DC");
  const jam = place("bvjam", 130, 230, 40, 10, "The jam kitchen", shed(70, 150, 124, 76, {sign: "JAM KITCHEN", roof: C.iron, wall: "#F3EAD6", wins: [28, 96], door: "#C8432F"})
    + `<g pointer-events="none">${[86, 96, 106].map(x => `<rect x="${x}" y="164" width="6" height="8" rx="1" fill="#C8432F" stroke="#3a2e28" stroke-width=".5"/>`).join("")}</g>`, "Jam kitchen", 130, 252, "#FBE0B8");
  const baskets = `<g pointer-events="none">${[0, 1, 2].map(i => `<path d="M${236 + i*14} 488 h12 l-2 8 h-8z" fill="#C9A27E" stroke="#3a2e28" stroke-width=".8"/><path d="M${237 + i*14} 488 q5 -7 10 0" fill="none" stroke="#3a2e28" stroke-width=".8"/>`).join("")}</g>`;
  const road = track("M140 640 Q140 580 180 540 Q240 500 300 500 Q300 580 300 640 M180 540 Q140 400 130 240 M300 500 Q400 470 400 240", 22);
  const trees = gum(36, 560, 1, 1) + gum(490, 600, 1.1, 0) + wattle(470, 470, .9);
  return lampDefs + ground() + hills() + road + trees + rows + cafe + jam + baskets
    + myVan("bvvan_berry", 140, 540) + gate("bvToChoc", 300, 612, "The chocolaterie", 380, 600, "Down to the chocolaterie");
}
function chocScreen(){
  const choc = place("bvchoc", 300, 280, 60, 12, "The chocolaterie", shed(194, 150, 224, 118, {sign: "BELLBIRD CHOCOLATERIE", roof: "#6B4A2E", wall: "#F3E7C9", wins: [30, 70, 154, 194], door: "#6B4A2E", roofH: 22})
    + `<g pointer-events="none"><rect x="270" y="226" width="60" height="42" fill="#F3E7C9" stroke="#3a2e28" stroke-width=".8"/><rect x="286" y="236" width="28" height="32" rx="2" fill="#6B4A2E"/>${[0, 1, 2].map(i => `<circle cx="${240 + i*60}" cy="276" r="7" fill="#9CC27E" stroke="#3a2e28" stroke-width=".8"/>`).join("")}</g>`, "Chocolaterie", 300, 300, "#E8D3BC");
  const play = place("bvplayground", 130, 470, 60, 14, "The playground", sk(`<path d="M60 470 l20 -50 h10 l-20 50z" style="fill:#F3C969"/><rect x="82" y="410" width="8" height="60" style="fill:#3E6B8C"/><path d="M120 470 v-56 h60 v56" fill="none" style="stroke:#C8432F" stroke-width="4"/><path d="M140 414 v28 M160 414 v28" style="stroke:#5A4636" stroke-width="1"/><rect x="134" y="440" width="12" height="4" style="fill:#5A4636"/><rect x="154" y="440" width="12" height="4" style="fill:#5A4636"/>
    <path d="M200 476 q-20 -30 0 -50 q20 -6 34 10 q10 24 -10 40z" style="fill:#E8414E"/><path d="M206 430 q6 -10 16 -2" style="fill:#7FA35A"/>`, `<path d="M60 470 l20 -50 h10 l-20 50z"/><path d="M200 476 q-20 -30 0 -50 q20 -6 34 10 q10 24 -10 40z"/>`)
    + `<g pointer-events="none">${[[208, 446], [218, 458], [212, 466], [222, 440]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#F3E7C9"/>`).join("")}</g>`, "Playground", 130, 500, "#F6D3DC");
  const sign = place("bvbarn", 420, 500, 30, 9, "The berry sign", sk(`<rect x="416" y="456" width="6" height="46" style="fill:#7A5A3A"/><rect x="390" y="446" width="60" height="22" rx="3" style="fill:#B5443A"/>`, `<rect x="390" y="446" width="60" height="22" rx="3"/>`) + `<text x="420" y="461" text-anchor="middle" font-size="7" font-weight="700" fill="#FFFDF6" pointer-events="none">PICK YOUR OWN ↑</text>`, "", 0, 0);
  const road = track("M300 0 Q300 120 300 290 M300 290 Q260 380 150 440 M300 290 Q360 380 420 470", 22);
  const trees = gum(40, 260, 1.1, 0) + gum(480, 270, 1, 2) + gum(40, 600, 1.1, 1) + gum(480, 610, 1, 0) + wattle(300, 580, 1);
  return lampDefs + ground() + road + trees + choc + play + sign + flowers([[340, 520, "#F4C7CF"], [250, 560, "#F3C969"], [380, 580, "#FFFDF6"]])
    + gate("bvToRows", 300, 26, "The berry rows", 380, 40, "Up to the berry rows");
}

/* ---------- Gum Creek Sanctuary: the bush walk (bk_bush) and the koala boardwalk (bk_koala) ---------- */
function bushScreen(){
  const roos = place("bvroos", 300, 400, 70, 14, "The kangaroos", roo(250, 400, 1) + roo(300, 384, -1, true) + roo(340, 420, -1) + roo(380, 392, 1, true) + roo(260, 360, 1, true), "Kangaroos", 300, 446, "#FBE0B8");
  const burrow = place("bvwombat", 120, 330, 34, 10, "The wombat burrow", sk(`<path d="M80 330 q40 -40 80 0z" style="fill:#B7A28A"/><path d="M106 330 q14 -18 28 0z" style="fill:#3A3430"/>`, `<path d="M80 330 q40 -40 80 0"/>`) + wombat(150, 352), "Wombat burrow", 120, 372, "#E8D3BC");
  const visitor = place("bvvisitor", 400, 230, 46, 10, "The visitor centre", shed(330, 128, 140, 98, {sign: "SANCTUARY", roof: "#5E7A5A", wall: "#E3D6BE", wins: [26, 114], veranda: true, door: "#5A3A2E"}), "Visitor centre", 400, 252, "#DCEBC8");
  const road = track("M140 640 Q140 580 180 540 Q260 490 380 470 Q460 450 520 420 M380 470 Q400 330 400 240", 22);
  const trees = gum(40, 280, 1.2, 0) + gum(200, 250, 1.1, 1) + gum(470, 590, 1.2, 2) + gum(40, 600, 1.1, 1) + gum(220, 600, 1, 0) + kookaburra(206, 196) + wattle(480, 340, 1);
  return lampDefs + ground("#D6CD98") + hills() + road + trees + burrow + roos + visitor
    + myVan("bvvan_creek", 140, 540) + gate("bvToKoala", 504, 420, "Koalas", 470, 388, "East to the koala boardwalk");
}
function koalaScreen(){
  const walk = place("bvboardwalk", 180, 320, 60, 12, "The koala boardwalk", sk(`<path d="M20 430 L120 330 L260 250" fill="none" style="stroke:#B98A5E" stroke-width="22" stroke-linejoin="round"/>${Array.from({length: 14}, (_, i) => { const t = i/13, x = 20 + t*240, y = 430 - t*180; return `<path d="M${x - 8} ${y - 8} l12 12" style="stroke:#8A6A52" stroke-width="1"/>`; }).join("")}`, `<path d="M20 430 L120 330 L260 250"/>`)
    + gum(90, 330, 1.2, 0) + gum(200, 250, 1.2, 1) + koala(80, 290) + koala(196, 210) + koala(214, 222), "Koala boardwalk", 180, 350, "#DCEBC8");
  const pool = place("bvpool", 300, 430, 60, 12, "The platypus pool", waterBand("M234 470 Q240 444 300 442 Q372 444 378 476 Q370 514 300 516 Q236 512 234 470z", [[270, 480], [300, 494]]) + `<g pointer-events="none"><ellipse cx="320" cy="482" rx="7" ry="2.4" fill="#5A4636" opacity=".7"/><path d="M314 482 q3 -2 6 0" stroke="#E3F0F2" fill="none" stroke-width="1"/></g>`, "Platypus pool", 300, 534, "#C3DDF3");
  const house = place("bvplatypus", 420, 380, 40, 10, "The platypus house", shed(372, 306, 106, 64, {sign: "PLATYPUS HOUSE", roof: "#5E7A5A", wall: "#9A8E80", door: "#3A3430"}), "Platypus house", 420, 400, "#C3DDF3");
  const hosp = place("bvhospital", 380, 200, 40, 10, "The wildlife hospital", shed(322, 104, 126, 86, {sign: "WILDLIFE HOSPITAL", roof: C.iron, wall: "#FFFDF6", wins: [26, 100], door: "#3E8A6A"})
    + `<g pointer-events="none"><circle cx="385" cy="136" r="9" fill="#3E8A6A"/><circle cx="381" cy="134" r="1.8" fill="#FFFDF6"/><circle cx="389" cy="134" r="1.8" fill="#FFFDF6"/><circle cx="385" cy="139" r="2.6" fill="#FFFDF6"/></g>`, "Wildlife hospital", 380, 222, "#DCEBC8");
  const trees = gum(480, 560, 1.2, 0) + gum(40, 590, 1.1, 2) + gum(470, 260, 1, 1) + wattle(160, 560, 1);
  return lampDefs + ground("#D6CD98") + trees + walk + pool + house + hosp
    + gate("bvToBush", 16, 420, "The bush walk", 70, 388, "West to the bush walk");
}

/* ---------- Riverside Camp: the caravan park (br_park) and the river (br_river) ---------- */
function parkScreen(){
  const kitchen = place("bvcampkitchen", 110, 256, 44, 10, "The camp kitchen", sk(`<rect x="44" y="190" width="144" height="56" style="fill:#E3D6BE" opacity=".5"/><path d="M36 192 L54 172 H178 L196 192z" style="fill:${C.iron}"/>${[48, 112, 184].map(x => `<rect x="${x - 3}" y="192" width="6" height="56" style="fill:#8A6A52"/>`).join("")}<rect x="70" y="214" width="90" height="10" style="fill:#B98A5E"/><rect x="164" y="200" width="18" height="18" rx="2" style="fill:#5A5A60"/>`, `<path d="M36 192 L54 172 H178 L196 192z"/><rect x="70" y="214" width="90" height="10"/>`)
    + `<g pointer-events="none"><rect x="54" y="198" width="14" height="12" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".6"/></g>`, "Camp kitchen", 110, 276, "#F6E3B4");
  const vans = place("bvvans", 330, 330, 80, 14, "The other campervans", kombi(280, 314, "#E07A5F", "#F3EAD6") + caravan(380, 314, "#3E6B8C") + kombi(470, 310, "#9CC27E", "#FFFDF6")
    + `<g pointer-events="none"><path d="M240 262 L330 254" stroke="#5A4636" stroke-width=".8"/>${[0, 1, 2, 3].map(i => `<rect x="${250 + i*20}" y="${258 - i*.8}" width="9" height="${9 + (i % 2)*3}" fill="${["#FFFDF6", "#9FC3D9", "#E89A9A", "#F3D98A"][i]}" stroke="#3a2e28" stroke-width=".6"/>`).join("")}<circle cx="402" cy="300" r="3" fill="#C9A27E"/></g>`, "Other campervans", 380, 346, "#C3E8DA");
  const fire = place("bvfire", 280, 460, 36, 10, "The fire rings", fireRing(280, 450, sgHM() >= 17*60) + campChair(250, 450, "#3E6B8C") + campChair(310, 452, "#E8566C") + campChair(280, 476, "#9CC27E") + fireRing(420, 540, false) + campChair(400, 540, "#F3C969"), "Fire rings", 280, 494, "#FBE0B8");
  const store = place("bvcampstore", 430, 470, 40, 10, "The camp store", shed(392, 404, 86, 54, {sign: "CAMP STORE", roof: C.red, wall: "#F3EAD6", door: "#3E6B8C"}), "Camp store", 430, 486, "#F6E3B4");
  const road = track("M150 640 Q150 580 200 540 Q260 500 300 520 Q300 580 300 640 M200 540 Q140 400 110 270", 22);
  const trees = gum(36, 360, 1.1, 0) + gum(220, 220, 1, 1) + gum(490, 210, 1.1, 2) + gum(40, 610, 1, 1) + gum(490, 610, 1, 0);
  return lampDefs + ground() + road + trees + kitchen + vans + fire + store
    + myVan("bvvan_camp", 150, 540) + gate("bvToRiver", 300, 612, "The river", 380, 600, "Down to the river");
}
function riverScreen(){
  const bank = `<g pointer-events="none"><g filter="url(#wash)" opacity=".8"><path d="M0 330 Q260 300 520 340 V430 H0z" style="fill:#EADBB0"/></g></g>`;
  const river = waterBand("M0 420 Q130 404 260 418 T520 412 V640 H0z", [[60, 470], [180, 500], [330, 480], [440, 520], [100, 580], [380, 600]]);
  const hole = place("bvswim", 250, 400, 60, 12, "The swimming hole", `<g pointer-events="none"><ellipse cx="250" cy="480" rx="90" ry="30" fill="#5E94A8" opacity=".6"/><path d="M200 470 q8 -6 16 0 M270 490 q8 -6 16 0" fill="none" stroke="#E3F0F2" stroke-width="1.4"/></g>`, "Swimming hole", 250, 520, "#C3DDF3");
  const swing = place("bvswing", 410, 380, 40, 10, "The rope swing", gum(440, 380, 1.6, 0) + `<g pointer-events="none"><path d="M430 300 Q420 380 400 460" fill="none" stroke="#8A6A52" stroke-width="2"/><rect x="392" y="458" width="16" height="5" rx="2" fill="#8A6A52"/></g>`, "Rope swing", 410, 400, "#DCEBC8");
  const canoe = place("bvcanoe", 120, 330, 44, 10, "The canoe shed", shed(72, 254, 96, 64, {sign: "CANOE HIRE", roof: C.iron, wall: "#B98A5E", door: "#5A3A2E"})
    + `<g pointer-events="none">${[["#E8414E", 380], ["#F3C969", 392]].map(([c, y]) => `<path d="M30 ${y} q60 -10 120 0 q-60 10 -120 0z" fill="${c}" stroke="#3a2e28" stroke-width=".9"/>`).join("")}</g>`, "Canoe shed", 120, 350, "#F6E3B4");
  const road = track("M300 0 Q300 120 260 220 Q230 300 250 380", 20);
  const trees = gum(40, 200, 1.1, 1) + gum(200, 150, 1, 2) + gum(480, 170, 1.1, 0) + wattle(320, 280, 1) + picnicTable(360, 250);
  return lampDefs + ground() + road + bank + trees + river + hole + canoe + swing
    + gate("bvToPark", 300, 26, "The camp", 380, 40, "Up to the camp");
}

const SCREENS = {bg_gate: gateScreen, bg_bridge: bridgeScreen, bl_paddock: paddockScreen, bl_valley: valleyScreen, bc_vines: vinesScreen, bc_lawn: lawnScreen,
  bb_rows: rowsScreen, bb_choc: chocScreen, bk_bush: bushScreen, bk_koala: koalaScreen, br_park: parkScreen, br_river: riverScreen};
export const bellbirdArt = scene => (SCREENS[scene] || gateScreen)();

// the drive (round 141): rolling gold hills, vine stripes and gum trees going by, and the cream-and-mint van
export function vanRideArt(){
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    <path d="M0 40 Q75 18 150 36 T300 30 T450 38 T600 28 V60 H0z" fill="#AFC2C8"/><path d="M0 60 Q75 38 150 56 T300 52 T450 58 T600 50 V90 H0z" fill="#C2C98E"/>
    ${[40, 130, 220, 310, 400, 490, 570].map((x, i) => i % 2 ? `<path d="M${x - 30} ${62 + (i % 3)} q30 -6 60 0" fill="none" stroke="#7FA35A" stroke-width="2" stroke-dasharray="2 2"/>` : `<rect x="${x - 1}" y="50" width="3" height="16" fill="#E9E3D6"/><ellipse cx="${x}" cy="46" rx="10" ry="8" fill="#8FAE9A"/>`).join("")}</g></svg>`;
  const van = `<div class="taxiboat"><svg viewBox="0 0 120 70" width="170" height="100" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.4" stroke-linejoin="round">
    <path d="M14 14 q0 -6 6 -6 h70 q6 0 6 6z" fill="#F6EBC8"/><rect x="10" y="14" width="96" height="24" rx="10" fill="#FFFDF6"/><rect x="10" y="34" width="96" height="20" rx="6" fill="#9FD3C2"/><path d="M10 34 h96" stroke="#FFFDF6" stroke-width="2"/>
    ${[22, 44, 66].map(x => `<rect x="${x}" y="18" width="18" height="12" rx="3" fill="#CFE0EE"/>`).join("")}<rect x="88" y="18" width="14" height="13" rx="4" fill="#CFE0EE"/><circle cx="104" cy="44" r="3.4" fill="#F3C969"/>
    <circle cx="30" cy="56" r="8" fill="#3A2E28"/><circle cx="86" cy="56" r="8" fill="#3A2E28"/><circle cx="30" cy="56" r="3.4" fill="#FFFDF6"/><circle cx="86" cy="56" r="3.4" fill="#FFFDF6"/></g></svg></div>`;
  return bank + van;
}
