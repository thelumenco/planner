// Ronda's interiors (round 116): five rooms behind the doors on the town's screens, each laid out and lit its own way.
//   rd_tapas:   the tapas bar: tiled walls, hams on the beam, a zinc-topped bar, wine-barrel tables
//   rd_cafe:    Doña Carmen's café and sweet shop: an arched window on the plaza, a glass counter of yemas, marble tables
//   rd_banos:   the Arab baths: horseshoe arches in brick, star-shaped skylights with the sun coming down in shafts
//   rd_jardin:  the Moorish garden: a water channel and fountain down the middle, myrtle hedges, orange trees
//   rd_cuero:   Antonio's leather workshop: hides on the walls, bags on the shelves, the stitching bench
//   rd_mercado: the covered market: green iron and a glass roof, Rafael's oil stall, fruit, ham and flowers
// Spots (data-rdspot, core.js roomSpot) are the things to tap: the bar, the counter, the skylights, the fountain, the stall.
// Kept calm on purpose: a few strong pieces of furniture in each room and plenty of floor.
import { ink } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { RC as C, orangeTree, cypress, bougain, pot } from "./town-ronda.js";

const W = ink;
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
// a thing to tap: walk to (tx, ty), then core.js opens it
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
// the way out, at the bottom, like every room
const exit = (col = "#C9A27E") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
// floor tiles in a grid from y0 down
const tiles = (y0, w, h, a, b, line) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${a}"/>${Array.from({length: Math.ceil((640 - y0)/h)}, (_, r) => Array.from({length: Math.ceil(520/w)}, (_, c) => (r + c) % 2 ? `<rect x="${c*w}" y="${y0 + r*h}" width="${w}" height="${h}" style="fill:${b}"/>` : "").join("")).join("")}
  <g style="stroke:${line}" stroke-width="1" opacity=".6">${Array.from({length: Math.ceil(520/w) + 1}, (_, c) => `<path d="M${c*w} ${y0} V640"/>`).join("")}${Array.from({length: Math.ceil((640 - y0)/h) + 1}, (_, r) => `<path d="M0 ${y0 + r*h} H520"/>`).join("")}</g>`;
// a band of painted tiles (azulejos) along the bottom of a wall
const azulejos = (y, h, cols = ["#3E6BAE", "#F3C969"]) => `<g pointer-events="none"><rect y="${y}" width="520" height="${h}" style="fill:#FFFDF6"/>${Array.from({length: 26}, (_, i) => `<rect x="${i*20 + 3}" y="${y + 3}" width="14" height="${h - 6}" rx="1" style="fill:none;stroke:${cols[i % 2]}" stroke-width="2"/><circle cx="${i*20 + 10}" cy="${y + h/2}" r="3" style="fill:${cols[(i + 1) % 2]}"/>`).join("")}<path d="M0 ${y} H520 M0 ${y + h} H520" style="stroke:var(--line)" stroke-width="1.2"/></g>`;
// a stool or a chair seen from the front (a person sits "on" it at x, y)
const stool = (x, y) => sk(`<rect x="${x - 8}" y="${y - 14}" width="16" height="5" rx="2" style="fill:#8A5A3A"/><path d="M${x - 6} ${y - 9} l-2 9 M${x + 6} ${y - 9} l2 9" style="stroke:#6B4430" stroke-width="2"/>`, `<rect x="${x - 8}" y="${y - 14}" width="16" height="5" rx="2"/>`);
const chair = (x, y, d = 1) => sk(`<path d="M${x - 8*d} ${y - 30} v22" style="stroke:#6B4430" stroke-width="2.4"/><rect x="${x - 9}" y="${y - 12}" width="18" height="4" rx="2" style="fill:#8A5A3A"/><path d="M${x - 7} ${y - 8} v8 M${x + 7} ${y - 8} v8" style="stroke:#6B4430" stroke-width="2"/>`, `<rect x="${x - 9}" y="${y - 12}" width="18" height="4" rx="2"/>`);
// a small round marble table, and a cup on it
const table = (x, y) => `<g pointer-events="none">${sk(`<path d="M${x} ${y - 20} v18 M${x - 8} ${y} h16" style="stroke:#3A3430" stroke-width="2.4"/><ellipse cx="${x}" cy="${y - 22}" rx="20" ry="7" style="fill:#F3EFE8"/><path d="M${x - 5} ${y - 28} h8 v5 h-8z" style="fill:#FFFDF6"/>`, `<ellipse cx="${x}" cy="${y - 22}" rx="20" ry="7"/><path d="M${x - 5} ${y - 28} h8 v5 h-8z M${x + 3} ${y - 26} q3 0 3 2 q0 2 -3 2"/>`)}</g>`;
// a wine barrel standing on end, a table to lean on, with little plates
const barrel = (x, y) => `<g pointer-events="none">${sk(`<path d="M${x - 18} ${y - 34} q-4 17 0 34 h36 q4 -17 0 -34z" style="fill:#8A5A3A"/><ellipse cx="${x}" cy="${y - 34}" rx="18" ry="5" style="fill:#A8754F"/><path d="M${x - 20} ${y - 24} h40 M${x - 20} ${y - 10} h40" style="stroke:#3A3430" stroke-width="2"/><circle cx="${x - 6}" cy="${y - 35}" r="4" style="fill:#FFFDF6"/><circle cx="${x - 6}" cy="${y - 35}" r="2" style="fill:#C8643B"/><circle cx="${x + 7}" cy="${y - 34}" r="3.6" style="fill:#FFFDF6"/><circle cx="${x + 7}" cy="${y - 34}" r="1.8" style="fill:#E8C48E"/>`,
  `<path d="M${x - 18} ${y - 34} q-4 17 0 34 h36 q4 -17 0 -34z"/><ellipse cx="${x}" cy="${y - 34}" rx="18" ry="5"/>`)}</g>`;
// a hanging lamp from the top edge
const lamp = (x, len, col = "#F6D98A") => `<g pointer-events="none"><path d="M${x} 0 v${len}" style="stroke:#3A3430" stroke-width="1"/><path d="M${x - 9} ${len + 8} q9 -14 18 0z" style="fill:#3A3430"/><circle cx="${x}" cy="${len + 10}" r="4" style="fill:${col}"/><circle cx="${x}" cy="${len + 14}" r="22" style="fill:${col}" opacity=".18"/></g>`;

// edge pieces (round 117, Mel: "more details around the edges"): the middle of each room stays clear, the walls fill up
const g = s => `<g pointer-events="none">${s}</g>`;
// a big potted plant (a palm or a fig) for a corner
const palm = (x, y) => g(sk(`<path d="M${x - 11} ${y - 18} h22 l-3 18 h-16z" style="fill:#C8643B"/>${[-50, -20, 10, 40, 70].map(a => `<path d="M${x} ${y - 20} q${Math.sin(a*Math.PI/180)*20} -26 ${Math.sin(a*Math.PI/180)*34} -${30 + Math.abs(a)/6}" style="fill:none;stroke:#4F7A3E" stroke-width="6" stroke-linecap="round"/>`).join("")}`, `<path d="M${x - 11} ${y - 18} h22 l-3 18 h-16z"/>`));
// a pair of wooden crates, one on top of the other, with something in the top one
const crates = (x, y, fill = "#F28C28") => g(sk(`<rect x="${x - 20}" y="${y - 22}" width="40" height="22" style="fill:#B98A5A"/><rect x="${x - 16}" y="${y - 42}" width="32" height="20" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<circle cx="${x - 9 + i*9}" cy="${y - 42}" r="4.6" style="fill:${fill}"/>`).join("")}`, `<rect x="${x - 20}" y="${y - 22}" width="40" height="22"/><rect x="${x - 16}" y="${y - 42}" width="32" height="20"/><path d="M${x - 20} ${y - 11} h40"/>`));
// a tall clay jar (tinaja)
const tinaja = (x, y, s = 1) => g(sk(`<path d="M${x - 12*s} ${y - 34*s} q-8 ${20*s} ${2*s} ${34*s} h${20*s} q${10*s} ${-14*s} ${2*s} ${-34*s}z" style="fill:#C8643B"/><ellipse cx="${x}" cy="${y - 34*s}" rx="${12*s}" ry="${3.5*s}" style="fill:#A84E2E"/>`, `<path d="M${x - 12*s} ${y - 34*s} q-8 ${20*s} ${2*s} ${34*s} h${20*s} q${10*s} ${-14*s} ${2*s} ${-34*s}z"/>`));
// a wooden bench against a wall
const bench = (x, y, w = 70, col = "#8A5A3A") => g(sk(`<rect x="${x - w/2}" y="${y - 14}" width="${w}" height="7" rx="2" style="fill:${col}"/><path d="M${x - w/2 + 6} ${y - 7} v7 M${x + w/2 - 6} ${y - 7} v7" style="stroke:#6B4430" stroke-width="3"/>`, `<rect x="${x - w/2}" y="${y - 14}" width="${w}" height="7" rx="2"/>`));
// a niche in the wall with a little oil lamp flickering in it
const niche = (x, y) => g(`<path d="M${x - 10} ${y} v-18 a10 10 0 0 1 20 0 v18z" style="fill:#4E3E31;stroke:var(--line)" stroke-width="1"/><path d="M${x - 5} ${y - 3} h10 l-2 -4 h-6z" style="fill:#C8643B"/><path d="M${x} ${y - 7} q-3 -5 0 -9 q3 4 0 9z" fill="#F3C969"><animate attributeName="opacity" values="1;.6;1" dur="1.3s" repeatCount="indefinite"/></path><circle cx="${x}" cy="${y - 10}" r="14" fill="#F3C969" opacity=".14"/>`);

/* ---------- the tapas bar ---------- */
function tapasRoom(){
  const floor = tiles(170, 40, 40, "#C8643B", "#B85A34", "#8E4428");
  const wall = `<g pointer-events="none"><rect width="520" height="170" style="fill:${C.white}"/>${azulejos(116, 40)}<rect y="156" width="520" height="14" style="fill:#8A5A3A"/>
    <rect y="22" width="520" height="12" style="fill:#5A3E2C"/>${[60, 104, 148].map(x => `<path d="M${x} 34 v8" style="stroke:#3A3430"/>`).join("")}</g>
    ${sk([60, 104, 148].map(x => `<path d="M${x - 9} 44 q-3 26 9 34 q12 -8 9 -34z" style="fill:#B5443A"/><path d="M${x - 3} 76 q3 4 6 0" style="fill:#F3E1D0"/>`).join("") + `<path d="M196 34 v26" style="stroke:#3A3430"/>${[0, 1, 2, 3].map(i => `<circle cx="${192 + (i % 2)*8}" cy="${44 + i*6}" r="4" style="fill:#F3EFE8"/>`).join("")}`,
      [60, 104, 148].map(x => `<path d="M${x - 9} 44 q-3 26 9 34 q12 -8 9 -34z"/>`).join(""))}
    ${sk(`<rect x="340" y="40" width="120" height="66" rx="3" style="fill:#2F3A33"/><rect x="336" y="36" width="128" height="74" rx="4" style="fill:none;stroke:#8A5A3A" stroke-width="5"/>`, `<rect x="336" y="36" width="128" height="74" rx="4"/>`)}
    <g pointer-events="none" style="font-family:Klee One,serif" fill="#FFFDF6"><text x="400" y="56" text-anchor="middle" font-size="11" font-weight="700">TAPAS</text>${["salmorejo · 3", "croquetas · 3", "payoyo · 3", "naranjas · 2"].map((t, i) => `<text x="352" y="${70 + i*9.5}" font-size="7">${t}</text>`).join("")}</g>
    ${sk(`<path d="M262 44 q14 -6 14 14 q0 18 -14 22 q-14 -4 -14 -22 q0 -20 14 -14z" style="fill:#C98A4A"/><rect x="259" y="20" width="6" height="30" style="fill:#6B4430"/><circle cx="262" cy="62" r="5" style="fill:#3A3430"/>`, `<path d="M262 44 q14 -6 14 14 q0 18 -14 22 q-14 -4 -14 -22 q0 -20 14 -14z"/><rect x="259" y="20" width="6" height="30"/>`)}`;
  // the bar along the back, with a beer tap and little plates under glass
  const bar = spot("tapas", 186, 262, "The bar: order a tapa", hovE(186, 244, 120, 18),
    sk(`<rect x="40" y="188" width="300" height="48" rx="3" style="fill:#8A5A3A"/><rect x="34" y="180" width="312" height="10" rx="2" style="fill:#B9B0A4"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${54 + i*58} 196 v32" style="stroke:#6B4430" stroke-width="2"/>`).join("")}
      <rect x="90" y="164" width="120" height="16" rx="3" style="fill:#EAF6FA" opacity=".85"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${104 + i*23}" cy="176" rx="8" ry="3" style="fill:${["#E8566C", "#E8C48E", "#C8643B", "#F3E7C8", "#F28C28"][i]}"/>`).join("")}<rect x="276" y="150" width="8" height="30" style="fill:#B9B0A4"/><path d="M274 152 h12" style="stroke:#3A3430" stroke-width="3"/>`,
      `<rect x="40" y="188" width="300" height="48" rx="3"/><rect x="34" y="180" width="312" height="10" rx="2"/><rect x="90" y="164" width="120" height="16" rx="3"/>`)
    + lab(186, 282, "The bar: order a tapa", "#F6D3DC", 10));
  const tables = [[120, 380], [300, 420], [420, 300]].map(([x, y]) => stool(x - 28, y + 14) + stool(x + 28, y + 14) + barrel(x, y)).join("");
  const plant = pot(470, 250) + pot(486, 254, "#E85A8A");
  const bottles = g(sk(`<rect x="290" y="96" width="44" height="5" style="fill:#5A3E2C"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${294 + i*8} 96 v-14 l2 -6 l2 6 v14z" style="fill:${i % 2 ? "#5B2338" : "#3E5E3C"}"/>`).join("")}`, `<rect x="290" y="96" width="44" height="5"/>`));
  const rack = g(sk(`<rect x="470" y="380" width="44" height="96" style="fill:#6B4430"/>${[0, 1, 2].map(i => `<circle cx="492" cy="${400 + i*30}" r="13" style="fill:#8A5A3A"/><circle cx="492" cy="${400 + i*30}" r="5" style="fill:#5A3E2C"/>`).join("")}`, `<rect x="470" y="380" width="44" height="96"/>${[0, 1, 2].map(i => `<circle cx="492" cy="${400 + i*30}" r="13"/>`).join("")}`));
  const coat = g(sk(`<path d="M50 600 v-80 M40 600 h20" style="stroke:#5A3E2C" stroke-width="3"/><path d="M50 524 q-12 4 -10 22 h20 q2 -18 -10 -22z" style="fill:#3E6BAE"/><path d="M56 528 l10 6" style="stroke:#5A3E2C" stroke-width="2"/>`, `<path d="M50 524 q-12 4 -10 22 h20 q2 -18 -10 -22z"/>`));
  const aboard = g(sk(`<path d="M336 604 l12 -40 l12 40 z" style="fill:#2F3A33"/>`, `<path d="M336 604 l12 -40 l12 40 M342 590 h12"/>`) + `<path d="M342 580 h12 M343 586 h10" style="stroke:#FFFDF6" stroke-width="1.2"/>`);
  const more = chair(42, 500, 1) + chair(102, 500, -1) + table(72, 500) + crates(150, 600, "#5B2338");
  // round 118: the flamenco corner: a low wooden stage, a rush chair for the guitarist, a fringed shawl over a stool, a spotlight
  const stage = spot("flamenco", 360, 560, "The flamenco stage", hovE(440, 540, 70, 20),
    sk(`<path d="M372 498 h146 v54 h-146z" style="fill:#8A5A3A"/><path d="M372 498 h146 v8 h-146z" style="fill:#A8754F"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${384 + i*28} 506 v46" style="stroke:#6B4430" stroke-width="1.2"/>`).join("")}
      <rect x="388" y="476" width="18" height="5" rx="2" style="fill:#C9A27E"/><path d="M390 481 v16 M404 481 v16 M390 476 v-14 h14 v14" style="stroke:#6B4430;fill:none" stroke-width="2"/>
      <path d="M486 492 l-8 -14 h18z" style="fill:#C8343A"/><path d="M478 478 q8 18 18 0" style="fill:none;stroke:#F3C969" stroke-width="1.4" stroke-dasharray="2 2"/>`,
      `<path d="M372 498 h146 v54 h-146z"/>`)
    + `<g pointer-events="none"><path d="M500 0 L420 498 h80z" fill="#FFF6D8" opacity=".12"/></g>` + lab(440, 574, "Flamenco · 1pm & 8pm", "#F6D3DC", 9));
  return floor + wall + bottles + lamp(140, 90) + lamp(380, 120) + bar + tables + more + rack + coat + aboard + plant + stage + exit("#8A5A3A");
}

/* ---------- Doña Carmen's café ---------- */
function cafeRoom(){
  const floor = tiles(170, 32, 32, "#F3ECDD", "#D9CFC0", "#BFB3A2");
  const wall = `<g pointer-events="none"><rect width="520" height="170" style="fill:#F6E7C1"/>${azulejos(130, 30, ["#4F7A5A", "#E8C48E"])}<rect y="160" width="520" height="10" style="fill:#8A5A3A"/></g>
    ${sk(`<path d="M40 128 V64 q0 -44 64 -44 q64 0 64 44 V128z" style="fill:#BFE0F2"/><rect x="40" y="100" width="128" height="28" style="fill:#FBF7EE"/><circle cx="104" cy="104" r="10" style="fill:#E6DCCB"/><path d="M100 94 q4 -12 8 0" style="fill:none;stroke:#7FB8E8" stroke-width="2"/>`,
      `<path d="M40 128 V64 q0 -44 64 -44 q64 0 64 44 V128z M104 20 V128 M40 72 h128"/>`)}
    ${sk(`<rect x="300" y="48" width="180" height="6" style="fill:#8A5A3A"/><rect x="300" y="96" width="180" height="6" style="fill:#8A5A3A"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${308 + i*29}" y="${28}" width="18" height="20" rx="4" style="fill:#EAF6FA"/><circle cx="${317 + i*29}" cy="42" r="5" style="fill:${["#F3C24A", "#E8566C", "#C8643B", "#F3C969", "#E890A8", "#9CC27E"][i]}"/>`).join("")}<rect x="400" y="66" width="34" height="30" rx="3" style="fill:#B9B0A4"/><rect x="408" y="72" width="18" height="10" rx="2" style="fill:#3A3430"/><path d="M412 86 h10 v6 h-10z" style="fill:#FFFDF6"/>`,
      `<rect x="300" y="48" width="180" height="6"/><rect x="300" y="96" width="180" height="6"/><rect x="400" y="66" width="34" height="30" rx="3"/>`)}
    ${sk(`<rect x="220" y="44" width="40" height="50" rx="2" style="fill:#FFFDF6"/><rect x="226" y="50" width="28" height="30" style="fill:#C9A27E"/><circle cx="240" cy="62" r="7" style="fill:#3A3430"/>`, `<rect x="220" y="44" width="40" height="50" rx="2"/>`)}
    <g transform="translate(260 18)" pointer-events="none"><g>${[0, 1, 2, 3].map(i => `<ellipse cx="0" cy="0" rx="34" ry="5" transform="rotate(${i*45})" style="fill:#8A5A3A" opacity=".85"/>`).join("")}<circle r="5" style="fill:#3A3430"/><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/></g></g>`;
  const counter = spot("dulces", 395, 268, "The counter: sweets and coffee", hovE(395, 252, 100, 16),
    sk(`<rect x="300" y="196" width="190" height="44" rx="3" style="fill:#8A5A3A"/><rect x="300" y="170" width="190" height="28" rx="3" style="fill:#EAF6FA" opacity=".9"/>${[0, 1, 2].map(i => `<ellipse cx="${336 + i*60}" cy="190" rx="22" ry="5" style="fill:#FFFDF6"/>`).join("")}${[0, 1, 2, 3, 4].map(i => `<circle cx="${322 + i*7}" cy="186" r="3.4" style="fill:#F3C24A"/>`).join("")}<path d="M380 188 q16 -12 32 0z" style="fill:#E8C48E"/>${[0, 1, 2].map(i => `<path d="M${440 + i*10} 190 q2 -10 6 0" style="fill:none;stroke:#C98A4A" stroke-width="3"/>`).join("")}`,
      `<rect x="300" y="196" width="190" height="44" rx="3"/><rect x="300" y="170" width="190" height="28" rx="3"/>`)
    + lab(395, 288, "Sweets and coffee", "#F6E3B4", 10));
  const tables = [[110, 340], [200, 480], [370, 430]].map(([x, y]) => chair(x - 30, y, 1) + chair(x + 30, y, -1) + table(x, y)).join("");
  const more = [[76, 470], [452, 540], [456, 350]].map(([x, y]) => chair(x - 30, y, 1) + chair(x + 30, y, -1) + table(x, y)).join("");
  const rack = spot("postales", 60, 296, "The postcard stand", hovE(48, 280, 30, 10), sk(`<path d="M48 280 v-60 M36 280 h24" style="stroke:#3A3430" stroke-width="2.4"/>${[0, 1, 2].map(r => [0, 1].map(c => `<rect x="${32 + c*17}" y="${214 + r*18}" width="14" height="16" rx="1" style="fill:${["#7FB8E8", "#F3C969", "#E8566C", "#9CC27E", "#FBF7EE", "#C9A3E0"][r*2 + c]}"/>`).join("")).join("")}`,
    `<path d="M48 280 v-60"/>${[0, 1, 2].map(r => [0, 1].map(c => `<rect x="${32 + c*17}" y="${214 + r*18}" width="14" height="16" rx="1"/>`).join("")).join("")}`) + lab(48, 296, "Postcards", "#E7D9F2", 8.5));
  const cake = g(sk(`<path d="M480 168 v-10 M470 158 h20" style="stroke:#B9B0A4" stroke-width="2"/><path d="M470 156 q10 -16 20 0z" style="fill:#E8C48E"/>`, `<path d="M470 156 q10 -16 20 0z"/>`));
  return floor + wall + cake + counter + tables + more + rack + palm(40, 612) + palm(486, 612) + crates(156, 612, "#F3C24A") + exit("#4F7A5A");
}

/* ---------- the Arab baths ---------- */
const star = (x, y, r) => { const p = Array.from({length: 16}, (_, i) => { const a = i*Math.PI/8, d = i % 2 ? r*.5 : r; return `${(x + Math.cos(a)*d).toFixed(1)} ${(y + Math.sin(a)*d).toFixed(1)}`; }); return `M${p.join(" L")}z`; };
function banosRoom(){
  const floor = `<rect y="200" width="520" height="440" style="fill:#D8C8A8"/>${Array.from({length: 11}, (_, r) => Array.from({length: 7}, (_, c) => `<rect x="${c*80 - (r % 2)*40 + 2}" y="${202 + r*40}" width="76" height="36" rx="5" style="fill:none;stroke:#BFAE8C" stroke-width="1.4"/>`).join("")).join("")}`;
  // the vault: warm brick, three horseshoe arches into the next rooms, and the star skylights in the dome above
  const arch = (x) => `<path d="M${x - 40} 200 V112 a40 44 0 1 1 80 0 V200z" style="fill:#4E3E31"/>${Array.from({length: 9}, (_, i) => { const a = Math.PI*(1.1 - i*.15); return `<path d="M${(x + Math.cos(a)*40).toFixed(1)} ${(112 - Math.sin(a)*44).toFixed(1)} L${(x + Math.cos(a)*52).toFixed(1)} ${(112 - Math.sin(a)*56).toFixed(1)}" style="stroke:${i % 2 ? "#E8D3A8" : "#B9734E"}" stroke-width="9"/>`; }).join("")}`;
  const wall = `<g pointer-events="none"><rect width="520" height="200" style="fill:#C98A62"/>${Array.from({length: 10}, (_, r) => `<path d="M0 ${r*20 + 10} H520" style="stroke:#B9734E" stroke-width="1"/>`).join("")}
    <path d="M0 0 H520 V40 Q260 70 0 40z" style="fill:#B9734E"/>${[110, 260, 410].map(arch).join("")}<rect x="0" y="196" width="520" height="6" style="fill:#A8754F"/></g>`;
  const stars = [70, 170, 260, 350, 450].map((x, i) => `<path d="${star(x, 22 + (i % 2)*8, 9)}" style="fill:#FFF6D8;stroke:var(--line)" stroke-width="1"/>`).join("");
  // the sun coming down through the stars, in slow-breathing shafts
  const shafts = `<g pointer-events="none">${[[70, 150], [170, 250], [260, 330], [350, 410], [450, 470]].map(([x, fx], i) => `<path d="M${x - 6} ${26 + (i % 2)*8} L${x + 6} ${26 + (i % 2)*8} L${fx + 22} ${300 + (i % 3)*60} L${fx - 22} ${300 + (i % 3)*60}z" fill="#FFF6D8" opacity=".16"><animate attributeName="opacity" values=".1;.22;.1" dur="${7 + i}s" repeatCount="indefinite"/></path><ellipse cx="${fx}" cy="${300 + (i % 3)*60}" rx="24" ry="7" fill="#FFF6D8" opacity=".3"/>`).join("")}</g>`;
  const look = spot("banos", 260, 360, "The star skylights", hovE(260, 340, 60, 14), lab(260, 360, "Look up: the stars", "#F6E3B4", 10));
  // a little basin in the warm room, still holding a skin of water
  const basin = `<g pointer-events="none">${sk(`<path d="M220 470 l12 -26 h56 l12 26 l-12 26 h-56z" style="fill:#B9B0A4"/><path d="M234 470 l8 -16 h36 l8 16 l-8 16 h-36z" style="fill:#9FC0C8"/>`, `<path d="M220 470 l12 -26 h56 l12 26 l-12 26 h-56z M234 470 l8 -16 h36 l8 16 l-8 16 h-36z"/>`)}<path class="ripple" d="M252 470 q8 -4 16 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2"/></g>`;
  const pillars = [[46, 600], [474, 600]].map(([x, y]) => sk(`<rect x="${x - 10}" y="${y - 380}" width="20" height="380" style="fill:#E8D3A8"/><rect x="${x - 14}" y="${y - 386}" width="28" height="10" style="fill:#C9A27E"/>`, `<rect x="${x - 10}" y="${y - 380}" width="20" height="380"/><rect x="${x - 14}" y="${y - 386}" width="28" height="10"/>`)).join("");
  const niches = niche(185, 176) + niche(335, 176) + niche(30, 176) + niche(490, 176);
  const benches = [[100, 300], [100, 520], [420, 300], [420, 520]].map(([x, y]) => bench(x, y, 64, "#C9B48E")).join("");
  const plaque = g(sk(`<rect x="430" y="232" width="40" height="28" rx="2" style="fill:#F3ECDD"/><path d="M450 260 v20" style="stroke:#6B4430" stroke-width="3"/>`, `<rect x="430" y="232" width="40" height="28" rx="2"/><path d="M436 240 h28 M436 246 h24 M436 252 h26" stroke-width=".8"/>`));
  const tea = spot("tea", 396, 586, "Mint tea with Amina", hovE(420, 572, 50, 14),
    sk(`<ellipse cx="420" cy="566" rx="30" ry="9" style="fill:#D9A441"/><path d="M412 568 v14 M428 568 v14" style="stroke:#8A6A3A" stroke-width="2"/><ellipse cx="380" cy="582" rx="14" ry="6" style="fill:#3E8A8A"/><ellipse cx="460" cy="582" rx="14" ry="6" style="fill:#B5443A"/>
      <path d="M414 558 q-2 -10 6 -10 q8 0 6 10z" style="fill:#D9D9D9"/><path d="M426 552 l8 -4" style="stroke:#B9B0A4" stroke-width="2"/>${[0, 1, 2].map(i => `<rect x="${400 + i*14}" y="558" width="5" height="7" rx="1" style="fill:${["#5E8A48", "#C8343A", "#3E6BAE"][i]}"/>`).join("")}`,
      `<ellipse cx="420" cy="566" rx="30" ry="9"/><path d="M414 558 q-2 -10 6 -10 q8 0 6 10z"/>`) + lab(420, 600, "Mint tea", "#DCEBF2", 9));
  return floor + wall + stars + niches + pillars + benches + basin + tinaja(90, 600) + tinaja(116, 604, .8) + tinaja(150, 602, .7) + plaque + tea + shafts + look + exit("#A8754F");
}

/* ---------- the Moorish garden ---------- */
function jardinRoom(){
  const ground = `<rect width="520" height="640" style="fill:${C.gravel}"/>`;
  const wall = `<g pointer-events="none">${sk(`<rect x="0" y="0" width="520" height="150" style="fill:${C.white}"/>${[150, 260, 370].map(x => `<path d="M${x - 34} 150 V92 a34 38 0 1 1 68 0 V150z" style="fill:#E8DFCC"/>`).join("")}<rect y="150" width="520" height="10" style="fill:#C9A27E"/>`,
    `<path d="M0 150 H520"/>${[150, 260, 370].map(x => `<path d="M${x - 34} 150 V92 a34 38 0 1 1 68 0 V150"/>`).join("")}`)}</g>` + bougain(60, 70, 22) + bougain(470, 60, 20) + cypress(30, 178, 1.1) + cypress(490, 178, 1.1);
  // the four beds, hedged in myrtle, an orange tree in each
  const beds = [[60, 196, 154, 148], [306, 196, 154, 148], [60, 420, 154, 140], [306, 420, 154, 140]].map(([x, y, w, h]) => `<g pointer-events="none">${sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" style="fill:#6E9A58"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="8" style="fill:#B9C98E"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/>`)}${orangeTree(x + w/2, y + h/2 + 26, 1.25)}</g>`).join("");
  // the channel down the middle, little jets along it, the pool and fountain at the crossing
  const jets = [190, 230, 270, 310, 450, 490, 530, 570].filter(y => y < 344 || y > 414).map((y, i) => `<path d="M254 ${y} q6 -14 12 0" fill="none" style="stroke:#BFE0F2" stroke-width="1.6"><animate attributeName="opacity" values="1;.4;1" dur="${1.4 + (i % 3)*.3}s" repeatCount="indefinite"/></path>`).join("");
  const water = `<g pointer-events="none">${sk(`<rect x="248" y="164" width="24" height="440" style="fill:#7FB8E8"/>`, `<path d="M248 164 V604 M272 164 V604"/>`)}${jets}</g>`;
  const fountain = spot("jardin", 260, 430, "The fountain: sit a while", hovE(260, 380, 56, 20),
    sk(`<path d="M220 378 l12 -30 h56 l12 30 l-12 30 h-56z" style="fill:#F3ECDD"/><path d="M230 378 l9 -22 h42 l9 22 l-9 22 h-42z" style="fill:#7FB8E8"/><rect x="254" y="350" width="12" height="24" style="fill:#F3ECDD"/><circle cx="260" cy="348" r="8" style="fill:#F3ECDD"/>`, `<path d="M220 378 l12 -30 h56 l12 30 l-12 30 h-56z"/><circle cx="260" cy="348" r="8"/>`)
    + `<g pointer-events="none">${[-1, 1].map(d => `<path d="M260 340 q${d*12} -16 ${d*20} 8" fill="none" style="stroke:#BFE0F2" stroke-width="1.8"><animate attributeName="stroke-dasharray" values="0 40;40 0" dur="1.2s" repeatCount="indefinite"/></path>`).join("")}</g>` + lab(260, 426, "The fountain", "#DCEBF6", 10));
  // two tiled benches at the bottom, either side of the gate
  const benches = [130, 390].map(x => sk(`<rect x="${x - 34}" y="${590}" width="68" height="14" rx="3" style="fill:#FFFDF6"/>${Array.from({length: 8}, (_, i) => `<rect x="${x - 32 + i*8}" y="592" width="7" height="10" style="fill:${i % 2 ? "#F3C969" : "#3E6BAE"}"/>`).join("")}`, `<rect x="${x - 34}" y="590" width="68" height="14" rx="3"/>`)).join("");
  const pots = [210, 270, 330, 450, 510, 570].map((y, i) => pot(30, y, i % 2 ? "#E85A8A" : C.geranium) + pot(490, y, i % 2 ? C.geranium : "#E85A8A")).join("");
  const lantern = x => g(sk(`<rect x="${x - 2}" y="560" width="4" height="46" style="fill:#2F2B28"/><path d="M${x - 8} 562 h16 l-3 -16 h-10z" style="fill:#F6D98A"/>`, `<path d="M${x - 8} 562 h16 l-3 -16 h-10z"/>`) + `<circle cx="${x}" cy="554" r="14" fill="#F6D98A" opacity=".18"/>`);
  const jasmine = g([180, 340].map(x => `${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${x + (i % 3)*6 - 6}" cy="${600 - Math.floor(i/3)*8}" r="5" style="fill:#5E8A48;stroke:var(--line)" stroke-width=".6"/><circle cx="${x + (i % 3)*6 - 5}" cy="${598 - Math.floor(i/3)*8}" r="1.6" fill="#FFFDF6"/>`).join("")}`).join(""));
  const sideBenches = bench(40, 400, 40, "#FFFDF6") + bench(480, 400, 40, "#FFFDF6");
  return ground + wall + beds + water + fountain + benches + sideBenches + pots + jasmine + lantern(214) + lantern(306) + exit("#C9A27E");
}

/* ---------- the leather workshop ---------- */
function cueroRoom(){
  const floor = `<rect y="170" width="520" height="470" style="fill:#B98F5E"/>${Array.from({length: 12}, (_, r) => `<path d="M0 ${190 + r*40} H520" style="stroke:#A07A4C" stroke-width="1.4"/>${Array.from({length: 4}, (_, c) => `<path d="M${(c*140 + (r % 2)*70) % 520} ${170 + r*40} v40" style="stroke:#A07A4C" stroke-width="1.2"/>`).join("")}`).join("")}`;
  const hide = (x, y, col, s = 1) => `<path d="M${x} ${y} q${14*s} -8 ${28*s} 0 q${10*s} 14 ${4*s} ${34*s} q${-4*s} ${12*s} ${-18*s} ${10*s} q${-16*s} 2 ${-20*s} ${-12*s} q${-6*s} ${-20*s} ${6*s} ${-32*s}z" style="fill:${col}"/>`;
  const wall = `<g pointer-events="none"><rect width="520" height="170" style="fill:${C.white}"/><rect y="160" width="520" height="10" style="fill:#7A5638"/><rect y="24" width="520" height="8" style="fill:#7A5638"/></g>
    ${sk(hide(40, 50, "#A8754F", 1.3) + hide(120, 46, "#7A3A2A", 1.2) + hide(424, 52, "#C98A4A", 1.3),
      hide(40, 50, "none", 1.3) + hide(120, 46, "none", 1.2) + hide(424, 52, "none", 1.3))}
    ${sk(`<rect x="210" y="70" width="190" height="6" style="fill:#7A5638"/><rect x="210" y="128" width="190" height="6" style="fill:#7A5638"/>${[0, 1, 2, 3].map(i => `<path d="M${222 + i*46} 70 q-4 -26 16 -26 q20 0 16 26z" style="fill:${["#7A3A2A", "#A8754F", "#3A2A22", "#C98A4A"][i]}"/><path d="M${230 + i*46} 44 q8 -10 16 0" style="fill:none;stroke:#3A2A22" stroke-width="1.6"/>`).join("")}${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${218 + i*30}" y="${112}" width="22" height="16" rx="2" style="fill:${["#8A5A3A", "#C98A4A", "#5A3A2A"][i % 3]}"/>`).join("")}`,
      `<rect x="210" y="70" width="190" height="6"/><rect x="210" y="128" width="190" height="6"/>${[0, 1, 2, 3].map(i => `<path d="M${222 + i*46} 70 q-4 -26 16 -26 q20 0 16 26z"/>`).join("")}`)}
    ${sk(`<path d="M480 34 v120" style="stroke:#7A5638" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<path d="M${470 - i*4} ${44 + i*4} v${90 - i*8}" style="stroke:${["#3A2A22", "#7A3A2A", "#A8754F", "#C98A4A"][i]}" stroke-width="5"/>`).join("")}`, `<path d="M480 34 v120"/>`)}`;
  // the workbench, where Antonio stitches: a leather piece in a clam, the mallet, the awl, a spool of waxed thread
  const bench = `<g pointer-events="none">${sk(`<rect x="170" y="300" width="180" height="16" rx="2" style="fill:#8A5A3A"/><path d="M178 316 v34 M342 316 v34" style="stroke:#6B4430" stroke-width="5"/><rect x="196" y="288" width="60" height="12" rx="2" style="fill:#C98A4A"/><rect x="300" y="290" width="22" height="8" rx="2" style="fill:#5A3A2A"/><circle cx="276" cy="294" r="5" style="fill:#F3E7C8"/>`,
    `<rect x="170" y="300" width="180" height="16" rx="2"/><rect x="196" y="288" width="60" height="12" rx="2"/>`)}</g>`;
  // the counter by the window: tap it to shop
  const counter = spot("cuero", 400, 268, "Antonio's counter: bags, wallets, belts", hovE(400, 252, 80, 16),
    sk(`<rect x="330" y="200" width="150" height="40" rx="3" style="fill:#7A5638"/><rect x="326" y="194" width="158" height="8" rx="2" style="fill:#A8754F"/>${[0, 1, 2].map(i => `<rect x="${346 + i*40}" y="${182}" width="26" height="12" rx="2" style="fill:${["#7A3A2A", "#C98A4A", "#3A2A22"][i]}"/>`).join("")}`,
      `<rect x="330" y="200" width="150" height="40" rx="3"/><rect x="326" y="194" width="158" height="8" rx="2"/>`)
    + lab(400, 288, "Shop: leather from Ubrique", "#E8D3BC", 10));
  const display = (x, y, items) => g(sk(`<rect x="${x - 46}" y="${y - 22}" width="92" height="22" rx="2" style="fill:#7A5638"/><path d="M${x - 40} ${y} v14 M${x + 40} ${y} v14" style="stroke:#5A3E2C" stroke-width="3"/>${items}`, `<rect x="${x - 46}" y="${y - 22}" width="92" height="22" rx="2"/>`));
  const wallets = display(124, 452, [0, 1, 2, 3, 4, 5].map(i => `<rect x="${86 + i*13}" y="${436 - (i % 2)*3}" width="11" height="9" rx="1.5" style="fill:${["#7A3A2A", "#C98A4A", "#3A2A22", "#A8754F", "#5A3A2A", "#B5443A"][i]}"/>`).join("") + `<circle cx="104" cy="424" r="7" style="fill:none;stroke:#3A2A22" stroke-width="3.4"/><circle cx="146" cy="424" r="7" style="fill:none;stroke:#C98A4A" stroke-width="3.4"/>`);
  const bags = display(400, 470, [0, 1, 2].map(i => `<path d="M${368 + i*30} 448 q-2 -16 12 -16 q14 0 12 16z" style="fill:${["#A8754F", "#7A3A2A", "#C98A4A"][i]}"/><path d="M${374 + i*30} 432 q6 -8 12 0" style="fill:none;stroke:#3A2A22" stroke-width="1.6"/>`).join(""));
  const saddle = g(sk(`<path d="M60 600 v-30 M120 600 v-30 M56 572 h68" style="stroke:#5A3E2C" stroke-width="4"/><path d="M62 570 q28 -30 56 0 q-28 -8 -56 0z" style="fill:#8A5A3A"/><path d="M88 556 q4 -10 10 -4" style="fill:none;stroke:#5A3E2C" stroke-width="3"/>`, `<path d="M62 570 q28 -30 56 0 q-28 -8 -56 0z"/>`));
  const rolls = g(sk([0, 1, 2].map(i => `<rect x="${36 + i*4}" y="${230 + i*16}" width="14" height="48" rx="7" style="fill:${["#C98A4A", "#7A3A2A", "#A8754F"][i]}" transform="rotate(${-12 + i*8} ${43 + i*4} ${254 + i*16})"/>`).join(""), `<rect x="36" y="230" width="14" height="48" rx="7" transform="rotate(-12 43 254)"/>`));
  const hatstand = g(sk(`<path d="M450 604 v-80 M438 604 h24 M440 534 l10 -8 l10 8" style="stroke:#5A3E2C" stroke-width="3"/><path d="M436 540 q-4 16 4 24 h12 q4 -14 -2 -24z" style="fill:#A8754F"/><path d="M458 540 q-2 18 6 22 h10 q2 -16 -4 -22z" style="fill:#7A3A2A"/>`, `<path d="M436 540 q-4 16 4 24 h12 q4 -14 -2 -24z M458 540 q-2 18 6 22 h10 q2 -16 -4 -22z"/>`));
  // tall shelf units down both side walls, full of bags, satchels, folded wallets and coiled belts
  const COLS = ["#7A3A2A", "#C98A4A", "#3A2A22", "#A8754F", "#5A3A2A", "#B5443A"];
  const unit = (x, k) => g(sk(`<rect x="${x}" y="246" width="46" height="150" style="fill:#7A5638"/>${[0, 1, 2, 3].map(r => `<rect x="${x + 3}" y="${250 + r*36}" width="40" height="32" style="fill:#5A3E2C"/>`).join("")}
      ${[0, 1].map(i => `<path d="M${x + 6 + i*18} ${280} q-1 -14 8 -14 q9 0 8 14z" style="fill:${COLS[(i + k) % 6]}"/><path d="M${x + 10 + i*18} 266 q4 -7 8 0" style="fill:none;stroke:#2F2B28" stroke-width="1.2"/>`).join("")}
      ${[0, 1, 2].map(i => `<rect x="${x + 6 + i*12}" y="300" width="10" height="14" rx="1" style="fill:${COLS[(i + k + 2) % 6]}"/>`).join("")}
      ${[0, 1].map(i => `<circle cx="${x + 13 + i*20}" cy="340" r="8" style="fill:none;stroke:${COLS[(i + k + 4) % 6]}" stroke-width="4"/>`).join("")}
      ${[0, 1, 2, 3].map(i => `<rect x="${x + 5 + i*9}" y="${366}" width="7" height="12" rx="1" style="fill:${COLS[(i + k + 1) % 6]}"/>`).join("")}`,
    `<rect x="${x}" y="246" width="46" height="150"/>${[0, 1, 2, 3].map(r => `<path d="M${x} ${250 + r*36 + 32} h46"/>`).join("")}`));
  const boxes = g(sk(`<rect x="150" y="580" width="40" height="22" style="fill:#E8D3BC"/><rect x="156" y="562" width="30" height="18" style="fill:#F3E7C8"/>`, `<rect x="150" y="580" width="40" height="22"/><rect x="156" y="562" width="30" height="18"/><path d="M150 588 h40"/>`));
  const cat = spot("cat", 470, 262, "The workshop cat", `<ellipse class="hov" cx="470" cy="192" rx="18" ry="8" style="fill:var(--butter)"/>`,
    sk(`<ellipse cx="470" cy="188" rx="14" ry="7" style="fill:#3A3430"/><circle cx="458" cy="183" r="6" style="fill:#3A3430"/><path d="M454 179 l1 -6 l3 4 M460 178 l2 -5 l2 5" style="fill:#3A3430"/><path d="M484 190 q8 2 6 -6" style="fill:none;stroke:#3A3430" stroke-width="3"/>`, `<ellipse cx="470" cy="188" rx="14" ry="7"/><circle cx="458" cy="183" r="6"/>`)
    + `<text x="478" y="176" font-family="Klee One,serif" font-size="9" fill="#8A7A6A" pointer-events="none">z<animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/></text>`);
  return floor + wall + lamp(140, 80, "#F3C969") + lamp(380, 90, "#F3C969") + bench + counter + cat + unit(24, 0) + unit(474, 3) + wallets + bags + saddle + hatstand + boxes + exit("#7A5638");
}

/* ---------- the covered market ---------- */
function mercadoRoom(){
  const floor = tiles(170, 52, 40, "#E6DCCB", "#DCD0BC", "#C4B79F");
  const wall = `<g pointer-events="none"><rect width="520" height="170" style="fill:#F3ECDD"/>${[70, 190, 330, 450].map(x => `<path d="M${x - 44} 160 V70 a44 44 0 0 1 88 0 V160z" style="fill:#CFE6F2"/><path d="M${x - 44} 160 V70 a44 44 0 0 1 88 0 V160 M${x} 26 V160 M${x - 44} 100 h88" fill="none" style="stroke:#3E6B5A" stroke-width="3"/>`).join("")}
    <circle cx="260" cy="40" r="18" style="fill:#FFFDF6;stroke:#3E6B5A" stroke-width="3"/><path d="M260 40 v-10 M260 40 h8" style="stroke:#3A3430" stroke-width="2"/><rect y="160" width="520" height="10" style="fill:#3E6B5A"/></g>`;
  const column = x => sk(`<rect x="${x - 5}" y="170" width="10" height="180" style="fill:#3E6B5A"/><path d="M${x - 14} 176 h28 l-6 -8 h-16z" style="fill:#3E6B5A"/>`, `<rect x="${x - 5}" y="170" width="10" height="180"/>`);
  // Rafael's stall at the back: bottles of oil, sacks of almonds
  const rafa = spot("mercado", 222, 266, "Rafael's stall: oil, almonds and more", hovE(260, 250, 90, 16),
    sk(`<rect x="180" y="196" width="160" height="44" rx="3" style="fill:#C9A27E"/><path d="M174 172 h172 l-6 -12 h-160z" style="fill:#9DAA80"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${196 + i*12} 196 v-16 h6 v16z" style="fill:#B9B04A"/>`).join("")}${[0, 1, 2].map(i => `<path d="M${266 + i*22} 196 q-8 -20 10 -22 q18 2 10 22z" style="fill:#E8D3A8"/>`).join("")}`,
      `<rect x="180" y="196" width="160" height="44" rx="3"/><path d="M174 172 h172 l-6 -12 h-160z"/>`)
    + lab(222, 284, "Rafael's stall", "#E4EBD0", 10));
  const fruit = `<g pointer-events="none">${sk(`<rect x="44" y="306" width="108" height="40" rx="3" style="fill:#B98A5A"/>${[0, 1, 2].map(i => `<rect x="${50 + i*34}" y="${296}" width="30" height="14" rx="2" style="fill:#8A6A52"/>${[0, 1, 2].map(k => `<circle cx="${57 + i*34 + k*8}" cy="296" r="4.4" style="fill:${["#F28C28", "#F3E27A", "#E8566C"][i]}"/>`).join("")}`).join("")}`, `<rect x="44" y="306" width="108" height="40" rx="3"/>`)}</g>`;
  const ham = `<g pointer-events="none">${sk(`<rect x="368" y="306" width="108" height="40" rx="3" style="fill:#B98A5A"/><path d="M364 268 h116" style="stroke:#6B4430" stroke-width="3"/>${[384, 410, 436, 462].map(x => `<path d="M${x - 7} 270 q-3 22 7 28 q10 -6 7 -28z" style="fill:#B5443A"/>`).join("")}<path d="M380 306 q14 -14 28 0z" style="fill:#F3E7C8"/><path d="M420 306 q14 -14 28 0z" style="fill:#F3E7C8"/>`, `<rect x="368" y="306" width="108" height="40" rx="3"/>`)}</g>`;
  const flowers = `<g pointer-events="none">${sk([60, 90, 120].map((x, i) => `<path d="M${x - 10} 514 l2 -26 h16 l2 26z" style="fill:#9FC0C8"/>${[0, 1, 2, 3].map(k => `<circle cx="${x - 6 + k*4}" cy="${484 - (k % 2)*6}" r="4" style="fill:${["#D8343A", "#FFFDF6", "#F3C969"][i]}"/>`).join("")}`).join(""), [60, 90, 120].map(x => `<path d="M${x - 10} 514 l2 -26 h16 l2 26z"/>`).join(""))}</g>`;
  const spices0 = g(sk(`<rect x="378" y="474" width="104" height="38" rx="3" style="fill:#B98A5A"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${392 + i*19}" cy="474" rx="8" ry="4" style="fill:${["#D9A441", "#C8643B", "#8A5A3A", "#E8C48E", "#7A9A4A"][i]}"/><path d="M${384 + i*19} 474 v10 h16 v-10" style="fill:#F3ECDD"/>`).join("")}`, `<rect x="378" y="474" width="104" height="38" rx="3"/>`));
  const olives = spot("ceramica", 452, 432, "The ceramics corner", hovE(466, 414, 46, 12), sk(`<rect x="424" y="356" width="88" height="54" style="fill:#7A5638"/><path d="M424 382 h88" style="stroke:#5A3E2C" stroke-width="3"/>${[0, 1, 2].map(i => `<ellipse cx="${440 + i*28}" cy="374" rx="11" ry="6" style="fill:${["#3E6BAE", "#E8B13A", "#5E8A48"][i]}"/><path d="M${434 + i*28} 374 q6 -4 12 0" style="fill:none;stroke:#FFFDF6" stroke-width="1.2"/>`).join("")}${[0, 1, 2].map(i => `<path d="M${434 + i*28} 404 q-2 -12 6 -14 q8 2 6 14z" style="fill:${["#C8643B", "#3E6BAE", "#F3ECDD"][i]}"/>`).join("")}`,
    `<rect x="424" y="356" width="88" height="54"/><path d="M424 382 h88"/>`) + lab(466, 426, "Ceramics", "#DCEBF6", 9));
  const spices = spot("especias", 430, 534, "The spice stall", hovE(430, 518, 56, 12), spices0 + lab(430, 530, "Spices", "#F6E3B4", 9));
  const bread = g(sk(`<ellipse cx="80" cy="410" rx="30" ry="10" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<ellipse cx="${66 + i*14}" cy="404" rx="8" ry="5" style="fill:#E8C48E"/>`).join("")}`, `<ellipse cx="80" cy="410" rx="30" ry="10"/>`));
  return floor + wall + column(160) + column(360) + lamp(110, 70) + lamp(410, 70) + rafa + fruit + ham + flowers + bread + olives + spices + crates(170, 610) + crates(480, 610, "#F3E27A") + exit("#3E6B5A");
}

export function rondaRoomArt(scene){
  return scene === "rd_tapas" ? tapasRoom() : scene === "rd_cafe" ? cafeRoom() : scene === "rd_banos" ? banosRoom() : scene === "rd_jardin" ? jardinRoom() : scene === "rd_cuero" ? cueroRoom() : mercadoRoom();
}
