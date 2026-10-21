// Saltwick Harbour (boat towns, round 206): an old fishing town on a cold North Sea coast, after Whitby and Robin
// Hood's Bay. Dark sandstone and whitewashed cottages under steep red pantile roofs, piled up the cliffs either side of
// a river mouth; grey-green sea, white surf, cobbles, iron railings, gulls. Nothing like Honeybrook's golden fields:
// cool greys and blues, brick red, and the green of the clifftops. Calm on purpose.
//   sw_quay:  the flagged quay on the west bank: your boat at the pontoon, the fish market shed, the Copper Kettle,
//             the lobster pots, the pier out to its little green lighthouse (the red one across the water), the swing
//             bridge over the river (east), and the slope up to the West Cliff (north)
//   sw_east:  the old town across the river: the cobbled lane between cottages, the jet workshop, the Fisherman's
//             Arms, the chandlery, and the stone steps up to the abbey
//   sw_west:  the West Cliff: the whalebone arch, the bandstand, the clifftop lawn, the beach huts on the sands below
//   sw_abbey: the headland: the abbey ruins against the sky, the squat clifftop church and its leaning gravestones,
//             the pond, the view down over the red roofs
// Seasons: kittiwakes on the pier ledges in summer; a sea fret (fog) rolls in on some autumn and winter mornings;
// lights strung on the swing bridge in December.
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { seasonOf } from "../data/items.js";

const C = {sea: "#6F95A8", sea2: "#8FB0C0", foam: "#EEF3F4", river: "#7B9DAB", sand: "#E4D3AE", sand2: "#D6C29A", grass: "#A9BC8A", grass2: "#97AE78",
  cobble: "#BDB3A8", cobble2: "#A89D92", flag: "#CBC2B4", flag2: "#B6AB9C", stone: "#8C7462", stone2: "#A58C78", stone3: "#6E5A4E", tile: "#B9563F", tile2: "#CC6B4F",
  white: "#EFE9DE", cream: "#E6D9C0", iron: "#46525C", wood: "#8A6A52", ink: "#2F2B28",
  walls: ["#EFE9DE", "#A58C78", "#E6D9C0", "#8C7462", "#EFE9DE", "#C9B49C"], doors: ["#2F4A5E", "#7A2E2E", "#3E5E44", "#2F2B28", "#5E4A7A"]};
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const dayN = () => [...dayKey()].reduce((a, c) => a*31 + c.charCodeAt(0) >>> 0, 7);
// a sea fret: some autumn and winter mornings the fog rolls in off the sea and the town goes soft and grey till noon
export const fretOn = (hm = 600) => ["autumn", "winter"].includes(ssn()) && dayN() % 3 === 0 && hm < 12*60;

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 10) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#5E6E7C" opacity=".18" pointer-events="none"/>`;
// a fisherman's cottage: whitewash or sandstone, a steep red pantile roof with its ridge, a chimney with pots, white
// sash windows. o.door: a shop door (and o.sign), o.doorCol
function cottage(x, y, w, h, o = {}){
  const seed = Math.round(x*7 + y*13 + w), r = i => rnd(seed + i), wall = o.wall || C.walls[seed % C.walls.length], roofH = Math.min(26, w*.32);
  const floors = Math.max(1, Math.min(2, Math.round(h/30))), fh = h/floors, cols = w < 46 ? 1 : 2;
  let wins = "";
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    if (o.door && f === floors - 1 && (cols === 1 || c === 0)) continue;
    const wx = x + (cols === 1 ? w/2 : w*(c ? .72 : .28)) - 6, wy = y + f*fh + (fh - 16)/2;
    wins += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="12" height="16" style="fill:#FFFDF6"/><rect x="${(wx + 1.5).toFixed(1)}" y="${(wy + 1.5).toFixed(1)}" width="9" height="13" style="fill:#566872"/><path d="M${(wx + 6).toFixed(1)} ${(wy + 1.5).toFixed(1)} v13 M${(wx + 1.5).toFixed(1)} ${(wy + 8).toFixed(1)} h9" style="stroke:#FFFDF6" stroke-width="1"/>`;
    if (!o.back && r(f*3 + c) < .3) wins += `<rect x="${(wx - 1).toFixed(1)}" y="${(wy + 16).toFixed(1)}" width="14" height="3" style="fill:#7A5A46"/>${[2, 6, 10].map((d, k) => `<circle cx="${(wx + d).toFixed(1)}" cy="${(wy + 15).toFixed(1)}" r="1.7" style="fill:${k % 2 ? "#7FA35A" : "#E8566C"}"/>`).join("")}`;
  }
  const dx = o.doorX || (cols === 1 ? w/2 : w*.28), door = o.door ? `<rect x="${x + dx - 9}" y="${y + h - 24}" width="18" height="24" rx="1" style="fill:${o.doorCol || C.doors[seed % C.doors.length]}"/><circle cx="${x + dx + 5}" cy="${y + h - 12}" r="1" style="fill:#E3C26A"/>` : "";
  // pantiles: the roof, with its rows of wavy tiles, and a chimney on the gable
  const roof = `<path d="M${x - 4} ${y + 1} L${x + 6} ${y - roofH} H${x + w - 6} L${x + w + 4} ${y + 1}z" style="fill:${r(9) < .5 ? C.tile : C.tile2}"/>`;
  const rows = Array.from({length: Math.floor(roofH/5)}, (_, k) => { const yy = y - roofH + 5 + k*5, inset = 6 - (k + 1)*10/Math.floor(roofH/5 + 1); return `<path d="M${(x + inset - 2).toFixed(1)} ${yy} H${(x + w - inset + 2).toFixed(1)}" style="stroke:#8E3A2A" stroke-width=".6" stroke-dasharray="3 2" fill="none"/>`; }).join("");
  const chim = r(5) < .8 ? `<rect x="${x + (r(6) < .5 ? 8 : w - 18)}" y="${y - roofH - 10}" width="10" height="14" style="fill:${C.stone2}"/><rect x="${x + (r(6) < .5 ? 9 : w - 17)}" y="${y - roofH - 14}" width="3" height="5" style="fill:#B9563F"/><rect x="${x + (r(6) < .5 ? 13 : w - 13)}" y="${y - roofH - 14}" width="3" height="5" style="fill:#B9563F"/>` : "";
  return (o.back ? "" : shade(x, y, w, h)) + sk(`${chim}<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${wall}"/>${wall === C.stone || wall === C.stone2 ? `<path d="M${x} ${y + h*.33} H${x + w} M${x} ${y + h*.66} H${x + w}" style="stroke:${C.stone3}" stroke-width=".5" opacity=".5"/>` : ""}${wins}${door}${roof}${rows}${o.back ? `<rect x="${x - 4}" y="${y - roofH}" width="${w + 8}" height="${h + roofH}" style="fill:#DCE3E8" opacity=".3"/>` : ""}`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x - 4} ${y + 1} L${x + 6} ${y - roofH} H${x + w - 6} L${x + w + 4} ${y + 1}z"/>${o.door ? `<rect x="${x + dx - 9}" y="${y + h - 24}" width="18" height="24" rx="1"/>` : ""}`)
    + (o.sign ? `<rect x="${x + dx - 30}" y="${y + h - 40}" width="60" height="12" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x + dx}" y="${y + h - 31}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.6" fill="${C.ink}" pointer-events="none">${o.sign}</text>` : "");
}
// a row of cottages stepping up a slope (back rows first, hazier)
const row = (spec, back = false) => spec.map(([x, y, w, h]) => cottage(x, y, w, h, {back})).join("");
const water = (d, col = C.sea) => `<g pointer-events="none">${sk(`<path d="${d}" style="fill:${col}"/>`, `<path d="${d}"/>`)}</g>`;
const waves = pts => `<g pointer-events="none" style="stroke:${C.foam}" stroke-width="1.4" fill="none" opacity=".9">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
const flags = (x, y, w, h) => `<g pointer-events="none" opacity=".55">${Array.from({length: Math.floor(h/26)}, (_, k) => `<path d="M${x} ${y + k*26} H${x + w}" style="stroke:${C.flag2}" stroke-width=".8"/>${Array.from({length: Math.floor(w/40)}, (_, j) => `<path d="M${x + j*40 + (k % 2)*20} ${y + k*26} v26" style="stroke:${C.flag2}" stroke-width=".8"/>`).join("")}`).join("")}</g>`;
const cobbles = (d, w = 40) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.cobble2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.cobble}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#9A9086" stroke-width="${w - 12}" stroke-dasharray="2 6" stroke-linecap="round" opacity=".55"/></g>`;
const gull = (x, y, s = 1, i = 0) => `<g pointer-events="none"><path d="M${x - 8*s} ${y} q${4*s} ${-5*s} ${8*s} 0 q${4*s} ${-5*s} ${8*s} 0" fill="none" style="stroke:#3A3430" stroke-width="1.3"/><animateTransform attributeName="transform" type="translate" values="0 0;${10 + i*3} -4;0 0" dur="${7 + i}s" repeatCount="indefinite"/></g>`;
const bollard = (x, y) => sk(`<rect x="${x - 3}" y="${y - 8}" width="6" height="9" rx="2" style="fill:${C.iron}"/><ellipse cx="${x}" cy="${y - 8}" rx="4" ry="1.6" style="fill:${C.iron}"/>`, "");
const railing = (x1, x2, y) => `<g pointer-events="none"><path d="M${x1} ${y - 10} H${x2}" style="stroke:${C.iron}" stroke-width="1.6"/><path d="${Array.from({length: Math.floor((x2 - x1)/8) + 1}, (_, k) => `M${x1 + k*8} ${y - 10} v10`).join(" ")}" style="stroke:${C.iron}" stroke-width="1"/></g>`;
// a pier lighthouse: a little round tower with its lantern; green on the west pier, red on the east
const pierLight = (x, y, col, s = 1) => `<g pointer-events="none">${sk(`<path d="M${x - 9*s} ${y} L${x - 7*s} ${y - 34*s} H${x + 7*s} L${x + 9*s} ${y}z" style="fill:${C.white}"/><rect x="${x - 7*s}" y="${y - 12*s}" width="${14*s}" height="5" style="fill:${col}"/><rect x="${x - 5*s}" y="${y - 44*s}" width="${10*s}" height="${10*s}" style="fill:#F6E7A8"/><path d="M${x - 7*s} ${y - 44*s} L${x} ${y - 52*s} L${x + 7*s} ${y - 44*s}z" style="fill:${col}"/>`,
  `<path d="M${x - 9*s} ${y} L${x - 7*s} ${y - 34*s} H${x + 7*s} L${x + 9*s} ${y}z"/><rect x="${x - 5*s}" y="${y - 44*s}" width="${10*s}" height="${10*s}"/>`)}</g>`;
// lobster pots: half-barrel cages of netting and rope, stacked, with orange floats
const pots = (x, y) => `<g pointer-events="none">${sk([[0, 0], [24, 0], [12, -16], [48, 0], [36, -16]].map(([dx, dy]) => `<path d="M${x + dx - 11} ${y + dy} v-12 q11 -10 22 0 v12z" style="fill:#5E7A6E"/><path d="M${x + dx - 11} ${y + dy - 6} h22 M${x + dx} ${y + dy - 17} v17" style="stroke:#C9C2B2" stroke-width=".7"/>`).join("") + `<circle cx="${x + 64}" cy="${y - 4}" r="5" style="fill:#E8823A"/><circle cx="${x + 72}" cy="${y - 2}" r="4" style="fill:#E8823A"/>`, "")}</g>`;
// a coble: the flat-bottomed fishing boat of this coast, blue and white with a red stripe
const coble = (x, y, col = "#3E6B8C", dir = 1, i = 0) => `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="${3 + i*.5}s" repeatCount="indefinite"/><ellipse cx="${x}" cy="${y + 3}" rx="28" ry="3" fill="${C.foam}" opacity=".6"/>
  ${sk(`<path d="M${x - 26*dir} ${y - 14} L${x - 20*dir} ${y} H${x + 18*dir} L${x + 28*dir} ${y - 18}z" style="fill:${col}"/><path d="M${x - 24*dir} ${y - 9} H${x + 24*dir}" style="stroke:#C9483A" stroke-width="2.4"/><path d="M${x - 24*dir} ${y - 13} H${x + 26*dir}" style="stroke:#FFFDF6" stroke-width="2"/>`, `<path d="M${x - 26*dir} ${y - 14} L${x - 20*dir} ${y} H${x + 18*dir} L${x + 28*dir} ${y - 18}z"/>`)}</g></g>`;
// your own boat, tied up (the same boat as at home: white hull, blue stripe, red flag)
const yourBoat = (x, y) => `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="3.4s" repeatCount="indefinite"/>${sk(`<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M${x - 36} ${y - 10} h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M${x + 30} ${y - 36} v-22 l14 9z" style="fill:#E8566C"/>`,
  `<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3"/>`)}</g></g>`;
const bench = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x - 18}" y="${y - 10}" width="36" height="4" style="fill:${C.wood}"/><rect x="${x - 18}" y="${y - 18}" width="36" height="4" style="fill:${C.wood}"/><path d="M${x - 15} ${y - 6} v8 M${x + 15} ${y - 6} v8" style="stroke:${C.iron}" stroke-width="2"/>`, "")}</g>`;
const tuft = (x, y, col = C.grass2) => `<path d="M${x - 4} ${y} q2 -7 4 -1 q2 -8 4 0 q1 -5 3 1" fill="none" style="stroke:${col}" stroke-width="1.2" pointer-events="none"/>`;
const thrift = (x, y) => `<g pointer-events="none">${[[0, 0], [5, -2], [-4, -3], [2, -6]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="2.2" style="fill:#E8A0B4"/>`).join("")}${tuft(x, y + 3)}</g>`;
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.iron}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:#3E6B8C" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
// the tap area over your boat (the drawing itself ignores taps): Mel couldn't easily tap the boat to sail home
const boatHit = (x, y) => `<rect x="${x - 50}" y="${y - 66}" width="104" height="76" fill="transparent" pointer-events="all"/>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
function fret(){ return fretOn() ? `<g pointer-events="none"><rect width="520" height="640" fill="#E8ECEE" opacity=".2"/><g filter="url(#wash)" opacity=".32">${[[120, 120], [380, 260], [200, 460], [420, 560]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="200" ry="70" fill="#F4F6F7"><animateTransform attributeName="transform" type="translate" values="0 0;30 0;0 0" dur="24s" repeatCount="indefinite"/></ellipse>`).join("")}</g></g>` : ""; }
// December: a string of lights along the swing bridge's rail
const bridgeLights = (x1, x2, y) => +dayKey().slice(5, 7) === 12 ? `<g pointer-events="none"><path d="M${x1} ${y} Q${(x1 + x2)/2} ${y + 6} ${x2} ${y}" fill="none" style="stroke:#3A3430" stroke-width=".6"/>${Array.from({length: 9}, (_, k) => { const t = k/8, xx = x1 + (x2 - x1)*t, yy = y + 6*4*t*(1 - t); return `<circle class="twinkle" cx="${xx.toFixed(1)}" cy="${(yy + 2).toFixed(1)}" r="2" fill="${["#F3C969", "#E8566C", "#9FD3E8"][k % 3]}" style="animation-delay:${k*.3}s"/>`; }).join("")}</g>` : "";
// the swing bridge: an iron deck across the river with lattice rails and a little control hut
const swingBridge = (x1, x2, y) => `<g pointer-events="none">${sk(`<rect x="${x1}" y="${y}" width="${x2 - x1}" height="50" style="fill:#7A7068"/><rect x="${x1}" y="${y + 4}" width="${x2 - x1}" height="42" style="fill:${C.cobble}"/>`, `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="50"/>`)}
  ${[y + 2, y + 48].map(yy => `<path d="M${x1} ${yy - 12} H${x2} M${x1} ${yy} H${x2}" style="stroke:${C.iron}" stroke-width="1.6"/><path d="${Array.from({length: Math.floor((x2 - x1)/12)}, (_, k) => `M${x1 + k*12} ${yy - 12} l12 12 M${x1 + k*12 + 12} ${yy - 12} l-12 12`).join(" ")}" style="stroke:${C.iron}" stroke-width=".7"/>`).join("")}${bridgeLights(x1, x2, y - 10)}</g>`;

/* ---------- sw_quay: the quay, your boat, the market, the tearoom, the pots, the pier ---------- */
function quayScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.flag}"/>${flags(0, 100, 350, 540)}`;
  // the harbour: the river mouth down the east side, opening out into the sea along the top
  const sea = water("M180 0 H520 V640 H350 V100 H180z", C.sea) + waves([[220, 40], [400, 30], [440, 160], [380, 280], [420, 380], [400, 600], [480, 520]]);
  // the west pier: a stone arm out into the sea with its little green lighthouse; the red one far across on the east pier
  const pier = place("swpiers", 300, 150, 30, 10, "The piers and their lighthouses", sk(`<rect x="286" y="10" width="28" height="100" style="fill:${C.stone2}"/><path d="M286 30 h28 M286 60 h28 M286 90 h28" style="stroke:${C.stone3}" stroke-width=".6"/>`, `<rect x="286" y="10" width="28" height="100"/>`) + pierLight(300, 40, "#3E8A5A", .9) + sk(`<rect x="470" y="16" width="50" height="22" style="fill:${C.stone2}"/>`, "") + pierLight(492, 26, "#C9483A", .7)
    + (ssn() === "summer" ? `<g pointer-events="none">${[[292, 70], [306, 84], [296, 96]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.2" style="fill:#FFFDF6;stroke:#3A3430" stroke-width=".6"/>`).join("")}</g>` : ""), "The pier", 240, 120, "#CFE0EE");
  // the cottages up the bank, and the slope road climbing past them to the West Cliff
  const bank = row([[118, 6, 52, 40], [118, 60, 54, 46]]) + `<g pointer-events="none">${sk(`<path d="M0 0 H110 V130 H0z" style="fill:${C.grass}"/>`, "")}</g>` + cobbles("M70 140 Q70 80 70 20", 38) + row([[0, 150, 46, 50]]);
  const market = place("swmarket", 120, 352, 50, 10, "The fish market", sk(`<rect x="20" y="248" width="190" height="10" style="fill:#4A6A78"/>${[26, 76, 126, 176, 204].map(x => `<rect x="${x}" y="258" width="4" height="72" style="fill:${C.iron}"/>`).join("")}<path d="M14 250 L36 222 H194 L216 250z" style="fill:#5E7E8C"/><path d="M40 230 H190" style="stroke:#7A9AA8" stroke-width="2"/>
    ${[40, 90, 140].map((x, i) => `<rect x="${x}" y="300" width="40" height="20" style="fill:#C9D6DC"/>${[0, 1, 2, 3].map(k => `<ellipse cx="${x + 6 + k*9}" cy="${306 + (k % 2)*6}" rx="4" ry="1.8" style="fill:${["#B7C0C6", "#E0A07A", "#9AA6AE"][(i + k) % 3]}"/>`).join("")}`).join("")}`,
    `<path d="M14 250 L36 222 H194 L216 250z"/><rect x="20" y="248" width="190" height="10"/>`) + `<text x="115" y="244" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="#FFFDF6" pointer-events="none">FISH MARKET</text>`, "Fish market", 120, 370, "#CFE0EE");
  const kettle = place("swkettle", 96, 546, 30, 9, "The Copper Kettle", cottage(14, 456, 160, 74, {door: true, doorX: 82, sign: "Copper Kettle", wall: C.cream, doorCol: "#2F4A5E"}) + sk(`<path d="M94 452 v-6" style="stroke:${C.iron}" stroke-width="1"/><path d="M86 446 q8 -8 16 0 v8 h-16z" style="fill:#C9805A"/><path d="M102 448 q5 0 6 -4" fill="none" style="stroke:#C9805A" stroke-width="2"/>`, "")
    + `<g pointer-events="none">${[[30, 506], [150, 506]].map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="14" style="fill:#F6E7A8" opacity=".5"/>`).join("")}</g>`, "Copper Kettle", 96, 568, "#E8C9A8");
  const potsHere = place("swpots", 262, 312, 34, 9, "Lobster pots", pots(232, 304), "", 0, 0);
  // the quay's edge: bollards along the water, the pontoon out to your boat, the fishing boats
  const edge = `<g pointer-events="none">${[130, 190, 250, 320, 400].map(y => bollard(344, y)).join("")}${railing(0, 110, 140)}</g>`;
  const pontoon = sk(`<rect x="340" y="548" width="130" height="38" style="fill:${C.wood}"/><path d="${[352, 368, 384, 400, 416, 432, 448, 464].map(x => `M${x} 548 v38`).join(" ")}" style="stroke:#6B5444" stroke-width=".7"/>`, `<rect x="340" y="548" width="130" height="38"/>`);
  const boats = coble(440, 220, "#3E6B8C", -1, 0) + coble(420, 330, "#3E8A5A", 1, 1) + coble(500, 120, "#C9483A", -1, 2);
  const boat = place("swboat", 330, 572, 34, 10, "Your boat at the pontoon", yourBoat(420, 620) + boatHit(420, 620) + `<rect x="336" y="520" width="144" height="70" fill="transparent" pointer-events="all"/>`, "Your boat", 410, 534, "#CFE0EE");
  const bridge = swingBridge(350, 520, 426);
  const birds = gull(220, 180, 1, 0) + gull(410, 70, .8, 1) + gull(160, 420, .9, 2);
  // the harbourmaster's tide board by the pier, and the crab line and bucket at the quay's edge (round 208)
  const tide = place("swtide", 240, 200, 24, 8, "The tide board", sk(`<rect x="236" y="150" width="6" height="44" style="fill:${C.iron}"/><rect x="216" y="132" width="46" height="34" rx="2" style="fill:#2F3A34"/><text x="239" y="144" text-anchor="middle" font-family="Klee One,serif" font-size="6.4" fill="#FFFDF6">HIGH WATER</text><path d="M224 152 h30 M224 159 h22" style="stroke:#FFFDF6" stroke-width="1"/>`, `<rect x="216" y="132" width="46" height="34" rx="2"/>`), "Tide board", 200, 120);
  const crab = place("swcrab", 326, 470, 22, 8, "Crabbing off the quay", sk(`<path d="M318 470 h12 l-2 12 h-8z" style="fill:#E8823A"/><path d="M318 470 q6 -8 12 0" fill="none" style="stroke:${C.iron}" stroke-width=".8"/><path d="M340 460 q8 10 14 30" fill="none" style="stroke:#3A3430" stroke-width=".8"/>`, "") + `<g pointer-events="none"><ellipse cx="324" cy="480" rx="3" ry="2" style="fill:#5E7A4A"/></g>`, "Crab line", 290, 498, "#CFE0EE");
  return ground + sea + pier + bank + market + kettle + potsHere + edge + pontoon + boats + boat + bridge + tide + crab + birds + fret()
    + gate("swToEast", 500, 450, "Old town", 450, 400, "East over the swing bridge to the old town", "#CFE0EE")
    + gate("swToWest", 70, 40, "West Cliff", 130, 36, "North up the slope to the West Cliff");
}

/* ---------- sw_east: the old town: the lane, the jet workshop, the pub, the chandlery, the steps ---------- */
function eastScreen(){
  const ground = `<rect width="520" height="640" style="fill:#9C9184"/>${flags(110, 0, 410, 640)}`;
  const river = water("M0 0 H110 V640 H0z", C.river) + waves([[20, 80], [50, 200], [30, 320], [40, 560]]);
  const bridge = swingBridge(0, 130, 426) + sk(`<rect x="112" y="396" width="22" height="26" style="fill:${C.white}"/><path d="M108 398 L123 386 L138 398z" style="fill:${C.tile}"/><rect x="117" y="402" width="12" height="9" style="fill:#566872"/>`, "");
  // the lane: in off the bridge, along, and winding up between the cottages to the foot of the steps
  const lane = cobbles("M110 452 H330 V300 Q336 190 440 150 V40", 40) + cobbles("M300 460 Q300 560 340 610", 30);
  // the steps: stone, worn in the middle, climbing to the top of the screen
  const steps = `<g pointer-events="none">${sk(`<rect x="414" y="0" width="54" height="150" style="fill:${C.stone2}"/>${Array.from({length: 15}, (_, k) => `<path d="M414 ${k*10} H468" style="stroke:${C.stone3}" stroke-width=".8"/>`).join("")}`, `<rect x="414" y="0" width="54" height="150"/>`)}${railing(468, 470, 150)}</g>`;
  const top = row([[200, 26, 52, 54, ], [258, 34, 50, 48], [314, 22, 56, 56]], true) + row([[480, 40, 40, 56], [476, 140, 44, 70]]);
  const jet = place("swjet", 236, 330, 30, 9, "The jet workshop", cottage(140, 198, 70, 110) + cottage(212, 210, 88, 98, {door: true, doorX: 24, sign: "Jet", wall: C.stone}) + sk(`<rect x="250" y="270" width="34" height="22" style="fill:#3A3A40"/>${[256, 266, 276].map((x, k) => `<circle cx="${x}" cy="${280 + (k % 2)*4}" r="2.4" style="fill:#1E1E22;stroke:#C9C2B2" stroke-width=".4"/>`).join("")}`, ""), "Jet workshop", 236, 350);
  const pub = place("swpub", 430, 452, 30, 9, "The Fisherman's Arms", cottage(360, 330, 160, 100, {door: true, doorX: 70, sign: "Fisherman's Arms", wall: C.white, doorCol: "#7A2E2E"}) + sk(`<path d="M484 340 h20" style="stroke:${C.iron}" stroke-width="1.4"/><rect x="490" y="342" width="16" height="20" style="fill:#3E6B8C"/><path d="M494 352 q4 -6 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1"/>`, ""), "Fisherman's Arms", 430, 472, "#E8C9A8");
  const chand = place("swchandlery", 350, 612, 30, 9, "The chandlery", cottage(320, 524, 120, 76, {door: true, doorX: 30, sign: "Chandlery", wall: C.stone2, doorCol: "#2F4A5E"}) + `<g pointer-events="none">${sk(`<circle cx="400" cy="568" r="7" fill="none" style="stroke:#C9A27E" stroke-width="2.4"/><path d="M424 560 v18" style="stroke:#E3C26A" stroke-width="3"/><circle cx="424" cy="558" r="4" style="fill:#E3C26A"/>`, "")}</g>`, "Chandlery", 420, 512);
  const lanePlace = place("swlane", 330, 400, 26, 8, "The cobbled lane", "", "", 0, 0);
  const cotts = row([[150, 500, 46, 50], [196, 506, 44, 44]]) + row([[444, 520, 38, 56], [482, 530, 38, 50]]);
  const birds = gull(200, 120, 1, 0) + gull(360, 260, .8, 1);
  return ground + river + lane + steps + top + jet + pub + cotts + chand + lanePlace + bridge + birds + fret()
    + gate("swToQuay", 20, 450, "The quay", 70, 390, "West over the swing bridge to the quay", "#CFE0EE")
    + gate("swToAbbey", 440, 40, "Abbey steps", 370, 40, "North up the stone steps to the abbey");
}

/* ---------- sw_west: the West Cliff: the arch, the bandstand, the lawn, the beach huts below ---------- */
function westScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".5"><ellipse cx="260" cy="420" rx="200" ry="140" style="fill:#B8C99A"/></g>`;
  // the sea along the top, the sands below the cliff, the row of beach huts, the cliff edge with its railing
  const sea = water("M0 0 H520 V56 Q400 66 260 58 Q120 50 0 62z", C.sea) + waves([[60, 24], [200, 30], [340, 20], [460, 34]]);
  const sands = `<g pointer-events="none">${sk(`<path d="M0 62 Q120 50 260 58 Q400 66 520 56 V150 H0z" style="fill:${C.sand}"/>`, "")}<path d="M0 80 Q260 70 520 76" fill="none" style="stroke:${C.foam}" stroke-width="2" opacity=".8"/></g>`;
  const huts = place("swhuts", 260, 196, 40, 10, "The beach huts", `<g pointer-events="none">${["#E8566C", "#F3C969", "#9FC3D9", "#7FA35A", "#FFFDF6", "#C9A0D6", "#E8823A", "#9FD3E8"].map((col, i) => sk(`<rect x="${40 + i*56}" y="104" width="30" height="30" style="fill:${col}"/><path d="M${37 + i*56} 106 L${55 + i*56} 94 L${73 + i*56} 106z" style="fill:${["#FFFDF6", "#3E6B8C"][i % 2]}"/><rect x="${49 + i*56}" y="118" width="12" height="16" style="fill:#FFFDF6" opacity=".7"/>`, `<rect x="${40 + i*56}" y="104" width="30" height="30"/>`)).join("")}</g>`, "Beach huts", 380, 150);
  const cliff = `<g pointer-events="none">${sk(`<path d="M0 150 H520 V166 Q260 176 0 166z" style="fill:${C.stone}"/>`, `<path d="M0 166 Q260 176 520 166"/>`)}${railing(10, 510, 178)}</g>`;
  const paths = cobbles("M70 640 Q90 520 160 470 Q220 420 240 340 Q250 260 300 220 H500", 30);
  // the whalebone arch: two great curved jawbones meeting at the top
  const arch = place("swarch", 240, 330, 36, 10, "The whalebone arch", sk(`<path d="M214 330 Q204 260 238 222 Q244 218 246 224 Q220 262 228 330z" style="fill:#F3EDE0"/><path d="M266 330 Q276 260 242 222 Q236 218 234 224 Q260 262 252 330z" style="fill:#EDE6D6"/>`, `<path d="M214 330 Q204 260 238 222 M266 330 Q276 260 242 222"/>`), "Whalebone arch", 240, 350);
  // the bandstand: green and white, a little domed roof, deckchairs round it
  const band = place("swbandstand", 400, 470, 40, 10, "The bandstand", sk(`<path d="M352 448 h96 v10 h-96z" style="fill:#FFFDF6"/>${[358, 382, 418, 442].map(x => `<rect x="${x}" y="406" width="3" height="42" style="fill:#3E7A5A"/>`).join("")}<path d="M346 408 Q400 372 454 408z" style="fill:#3E7A5A"/><path d="M350 408 h100" style="stroke:#FFFDF6" stroke-width="3"/><path d="M398 384 v-10" style="stroke:#3E7A5A" stroke-width="2"/>`, `<path d="M346 408 Q400 372 454 408z"/><rect x="352" y="448" width="96" height="10"/>`)
    + `<g pointer-events="none">${[[340, 500], [372, 510], [430, 512], [462, 498]].map(([x, y], k) => sk(`<path d="M${x - 8} ${y} l4 -14 h10 l-4 14z" style="fill:${["#E8566C", "#3E6B8C", "#F3C969", "#3E8A5A"][k]}"/><path d="M${x - 8} ${y} h4 M${x + 2} ${y} h4" style="stroke:${C.wood}" stroke-width="1.4"/>`, "")).join("")}</g>`, "Bandstand", 400, 490, "#CFE0EE");
  const lawn = place("swlawn", 140, 450, 34, 10, "The clifftop lawn", bench(110, 446) + `<g pointer-events="none">${thrift(170, 430)}${thrift(60, 470)}${thrift(200, 520)}</g>`, "Clifftop lawn", 100, 480);
  // the grand old guest houses along the clifftop, cream with bay windows
  const terrace = `<g pointer-events="none">${[0, 1, 2].map(i => cottage(452, 214 + i*58, 64, 50, {wall: C.cream})).join("")}</g>`;
  const tufts = [[40, 240], [120, 300], [320, 300], [60, 560], [300, 600], [460, 600], [180, 600]].map(([x, y]) => tuft(x, y)).join("");
  const birds = gull(120, 100, 1, 0) + gull(330, 200, .9, 1) + gull(460, 120, .8, 2);
  return ground + sea + sands + huts + cliff + paths + terrace + arch + band + lawn + tufts + birds + fret()
    + gate("swToQuayS", 70, 612, "The quay", 130, 616, "South down the slope to the quay", "#CFE0EE");
}

/* ---------- sw_abbey: the headland: the ruins, the church and churchyard, the pond, the view ---------- */
function abbeyScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass2}"/><g filter="url(#wash)" opacity=".5"><ellipse cx="260" cy="420" rx="220" ry="160" style="fill:${C.grass}"/></g>`;
  const sea = water("M0 0 H520 V100 Q400 92 260 104 Q120 112 0 96z", C.sea) + waves([[60, 30], [180, 50], [300, 24], [420, 60]]);
  const cliff = `<g pointer-events="none">${sk(`<path d="M0 96 Q120 112 260 104 Q400 92 520 100 V138 Q260 150 0 138z" style="fill:${C.stone}"/>`, `<path d="M0 138 Q260 150 520 138"/>`)}</g>`;
  // the abbey: a tall broken wall of lancet windows, a great arch open to the sky, a stump of tower
  const lancets = (x, y, n, w, h) => Array.from({length: n}, (_, k) => `<path d="M${x + k*(w + 6)} ${y + h} V${y + w/2} Q${x + k*(w + 6) + w/2} ${y - w/3} ${x + k*(w + 6) + w} ${y + w/2} V${y + h}z" style="fill:#C9D9E4"/>`).join("");
  const abbey = place("swabbey", 250, 300, 60, 12, "The abbey ruins", sk(`<path d="M150 280 V170 L160 150 L172 168 V120 L190 110 L196 140 H250 V96 L262 84 L276 100 V140 H330 L340 124 L352 160 V280z" style="fill:${C.stone}"/>${lancets(176, 172, 3, 14, 60)}${lancets(286, 172, 3, 12, 54)}${lancets(178, 236, 4, 10, 30)}<path d="M236 280 V200 Q262 160 288 200 V280z" style="fill:#C9D9E4"/><path d="M150 230 H352" style="stroke:${C.stone3}" stroke-width=".8"/>`,
    `<path d="M150 280 V170 L160 150 L172 168 V120 L190 110 L196 140 H250 V96 L262 84 L276 100 V140 H330 L340 124 L352 160 V280"/>`), "Abbey ruins", 250, 312, "#E8D3BC");
  // the church: squat and sturdy, a square tower, and the gravestones leaning every which way
  const church = place("swchurch", 120, 520, 40, 10, "The clifftop church", sk(`<rect x="40" y="430" width="110" height="68" style="fill:${C.stone2}"/><path d="M34 432 L95 404 L156 432z" style="fill:#7A7068"/><rect x="40" y="396" width="34" height="46" style="fill:${C.stone2}"/><path d="M40 396 h4 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6" style="fill:${C.stone2}"/>${[86, 112, 130].map(x => `<path d="M${x} 482 V462 Q${x + 5} 454 ${x + 10} 462 V482z" style="fill:#566872"/>`).join("")}`, `<rect x="40" y="430" width="110" height="68"/><rect x="40" y="396" width="34" height="46"/>`)
    + `<g pointer-events="none">${[[60, 560, -8], [96, 580, 6], [140, 560, -4], [176, 590, 10], [210, 560, -12], [40, 600, 4], [120, 610, -6], [236, 600, 8]].map(([x, y, a]) => sk(`<path d="M${x - 7} ${y} V${y - 18} Q${x} ${y - 25} ${x + 7} ${y - 18} V${y}z" style="fill:#9A9A94" transform="rotate(${a} ${x} ${y})"/>`, "")).join("")}</g>`, "Church", 100, 540);
  const pond = place("swpond", 380, 400, 30, 9, "The abbey pond", sk(`<ellipse cx="380" cy="380" rx="52" ry="16" style="fill:${C.sea2}"/>`, `<ellipse cx="380" cy="380" rx="52" ry="16"/>`) + `<path d="M350 378 q6 -3 12 0 M384 384 q6 -3 12 0" fill="none" style="stroke:${C.foam}" stroke-width="1" pointer-events="none"/>`
    + sk(`<ellipse cx="364" cy="376" rx="5" ry="2.8" style="fill:#8A6A52"/><circle cx="368" cy="373" r="2" style="fill:#3E7A5A"/><ellipse cx="396" cy="382" rx="5" ry="2.8" style="fill:#A08A70"/>`, ""), "Pond", 440, 360);
  const view = place("swview", 450, 230, 30, 9, "The view over the town", bench(452, 226) + `<g pointer-events="none">${row([[470, 160, 30, 26]], true)}</g>`, "The view", 470, 196);
  const steps = `<g pointer-events="none">${sk(`<rect x="414" y="500" width="54" height="140" style="fill:${C.stone2}"/>${Array.from({length: 14}, (_, k) => `<path d="M414 ${500 + k*10} H468" style="stroke:${C.stone3}" stroke-width=".8"/>`).join("")}`, `<rect x="414" y="500" width="54" height="140"/>`)}</g>`;
  const paths = `<g filter="url(#wob)" pointer-events="none"><path d="M440 500 Q420 440 360 420 Q300 400 262 320 M262 330 Q200 380 140 470 M360 420 Q420 330 450 240" fill="none" style="stroke:#C9C0A8" stroke-width="18" stroke-linecap="round"/></g>`;
  const tufts = [[40, 200], [100, 330], [400, 300], [480, 420], [300, 520], [360, 600]].map(([x, y]) => tuft(x, y)).join("") + [[60, 160], [200, 150], [330, 150], [490, 150]].map(([x, y]) => thrift(x, y)).join("");
  const birds = gull(180, 60, 1, 0) + gull(400, 40, .8, 1);
  return ground + sea + cliff + paths + steps + abbey + church + pond + view + tufts + birds + fret()
    + gate("swToEastS", 440, 612, "Old town", 380, 616, "South down the steps to the old town");
}

export function saltwickArt(scene){
  return scene === "sw_quay" ? quayScreen() : scene === "sw_east" ? eastScreen() : scene === "sw_west" ? westScreen() : abbeyScreen();
}
// the sight on the far shore as you sail in: red roofs piled up the cliff, the abbey on top, the two pier lights
export const SALTWICK_SIGHT = `<path d="M380 56 Q396 22 450 16 Q520 10 600 22 V56z" fill="${C.stone}"/>${[[400, 40], [416, 34], [432, 30], [448, 38], [464, 26], [480, 34]].map(([x, y]) => `<rect x="${x}" y="${y}" width="12" height="9" fill="${C.white}"/><path d="M${x - 1} ${y} L${x + 6} ${y - 5} L${x + 13} ${y}z" fill="${C.tile}"/>`).join("")}<path d="M520 18 V4 L526 0 L532 4 V18 M540 18 V6 L546 2 L552 6 V18" fill="${C.stone3}"/><rect x="352" y="40" width="6" height="16" fill="#3E8A5A"/><rect x="372" y="40" width="6" height="16" fill="#C9483A"/>`;
