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
  return floor + wall + lamp(140, 90) + lamp(380, 120) + bar + tables + plant + exit("#8A5A3A");
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
  return floor + wall + counter + tables + pot(486, 300) + exit("#4F7A5A");
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
  return floor + wall + stars + pillars + basin + shafts + look + exit("#A8754F");
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
  return ground + wall + beds + water + fountain + benches + exit("#C9A27E");
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
  return floor + wall + lamp(140, 80, "#F3C969") + lamp(380, 90, "#F3C969") + bench + counter + pot(40, 300) + exit("#7A5638");
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
  return floor + wall + column(160) + column(360) + lamp(110, 70) + lamp(410, 70) + rafa + fruit + ham + flowers + exit("#3E6B5A");
}

export function rondaRoomArt(scene){
  return scene === "rd_tapas" ? tapasRoom() : scene === "rd_cafe" ? cafeRoom() : scene === "rd_banos" ? banosRoom() : scene === "rd_jardin" ? jardinRoom() : scene === "rd_cuero" ? cueroRoom() : mercadoRoom();
}
