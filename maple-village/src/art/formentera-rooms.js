// Formentera's interiors (round 231): five rooms behind the doors at Ses Illetes, the salt flats, Sant Francesc and La Mola.
// Formentera rooms: thick whitewashed walls, blue shutters, ceilings of twisted sabina (juniper) beams over cane,
// terracotta and marès stone underfoot, palm thatch at the beach, salt everywhere, and the turquoise sea through the windows.
// The edges full, the middle calm and clear (the playbook).
//   fm_bar:    Marina's chiringuito on the sand: the driftwood bar, palm-thatch roof, hanging lanterns, the fish grill,
//              fresh juices, a table with toes in the sand, a hammock, and the turquoise water all along the back
//   fm_salt:   the salt works shop in an old stone salt store: sacks and jars of salt, flor de sal, herb salts,
//              the wooden rake on the wall, the old salt wagon, photos of the salt workers, the pans through the window
//   fm_bakery: Margalida's bakery: the whitewashed wood oven, the blue-and-white tiled counter of flaó, fig bread,
//              almond biscuits and ensaïmadas, loaves on the shelves, strings of dried figs, the fig tree through the window
//   fm_light:  inside La Mola lighthouse: the stone spiral stair, the keeper's desk and logbook, the stamp book,
//              the postcard counter, the plaque to Jules Verne, an old lens, the open sea through the window
//   fm_bikes:  Joan's bike hire: rows of bikes, baskets, helmets, the map of the Green Routes, a pine track through the door
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a few small touches too.
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";
import { dayKey } from "../util.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#2F7DB8") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none" style="fill:#FFFDF6">Exit</text></g>`;
const txt = (x, y, t, size = 9, fill = "#FFFDF6", weight = 400, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none">${t}</text>`;
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const f1 = n => (+n).toFixed(1);
const P = {lime: "#F8F5EC", lime2: "#EDE7D9", lime3: "#DDD5C3", blue: "#2F7DB8", blue2: "#1F5E8E", blueL: "#7FB6DC",
  sabina: "#8C7660", sabina2: "#5E4C3C", sabinaL: "#B39C80", cane: "#E2D2A6", cane2: "#C9B488",
  thatch: "#D2B06C", thatch2: "#B48E4C", thatch3: "#8E6C34", sand: "#F0E1BC", sand2: "#E6D3A8", sand3: "#D6BE8C",
  sea: "#3CC4C2", seaL: "#93E6DA", seaD: "#1E8FAE", deep: "#1C5E8C", sky: "#CDE9F6", skyL: "#E8F5FA",
  terra: "#D98A5C", terra2: "#C9784A", terra3: "#E39A6C", stone: "#E2D4B4", stone2: "#CDBB94", stone3: "#B8A47C",
  drift: "#B8AE9E", drift2: "#9A9080", drift3: "#CFC6B6", wood: "#9A6A44", wood2: "#6E4A2E", woodL: "#C2946A",
  salt: "#FCFCF8", salt2: "#E8ECEE", pink: "#F2B8B0", fig: "#5E3450", fig2: "#7A4A66", figG: "#8A9A4E",
  pastry: "#E8BC6E", pastry2: "#C9903E", sugar: "#FFFBF2", leaf: "#5E9A4A", leaf2: "#3E7A3A", red: "#C8483A", orange: "#F2A03A",
  iron: "#3E4246", iron2: "#62686E", brass: "#D2A24A", ink: "#2F2B28", cream: "#FFFDF6"};
// a unique clip for a window onto the outside world
let CID = 0;
const clip = (x, y, w, h, inner) => { const id = `fmClip${++CID}`; return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`; };
// the season, the same rules as the town (src/data/formentera.js): flamingos September to April, the salt harvest
// July to September (otherwise the pans lie flooded and silvery), the fig trees bare December to February
let MONTH = 10;
const flamingoTime = () => MONTH >= 9 || MONTH <= 4;
const harvestTime = () => MONTH >= 7 && MONTH <= 9;
const figsBare = () => MONTH === 12 || MONTH <= 2;
const summer = () => MONTH >= 6 && MONTH <= 9;

/* ---------- shared pieces ---------- */
// floors: square tiles (terracotta, marès stone, cement), and the soft sand of the beach bar
const tiles = (y0, cols, line, w = 52, h = 40, off = true) => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${cols[0]}"/>`;
  for (let r = 0; y0 + r*h < 640; r++) for (let k = -1; k*w < 520; k++) s += `<rect x="${k*w + (off ? (r % 2)*w/2 : 0)}" y="${y0 + r*h}" width="${w}" height="${h}" style="fill:${cols[(r*3 + k*7 + 20) % cols.length]};stroke:${line}" stroke-width="1.1"/>`;
  return g(s); };
const sandFloor = y0 => g(`<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${P.sand}"/>`
  + Array.from({length: 22}, (_, k) => { const x = R(k*5)*500, y = y0 + 20 + R(k*11)*400; return `<path d="M${f1(x)} ${f1(y)} q14 -5 28 0 q14 5 28 0" fill="none" style="stroke:${P.sand3}" stroke-width="1.2" opacity=".55"/>`; }).join("")
  + Array.from({length: 40}, (_, k) => `<circle cx="${f1(R(k*3 + 1)*520)}" cy="${f1(y0 + R(k*7 + 2)*440)}" r="${f1(.8 + R(k)*1.2)}" style="fill:${P.sand2}"/>`).join("")
  // a few shells and a starfish washed into the corners
  + [[28, 380], [498, 380], [170, 612], [360, 618]].map(([x, y], k) => k === 2 ? `<path d="M${x} ${y - 6} l2 4.6 l5 .4 l-3.8 3.2 l1.2 5 l-4.4 -2.8 l-4.4 2.8 l1.2 -5 l-3.8 -3.2 l5 -.4z" style="fill:#F2A07A"/>`
    : `<path d="M${x - 5} ${y} q5 -9 10 0z" style="fill:#F6E2D4;stroke:#D8B49C" stroke-width=".7"/><path d="M${x} ${y - 6} v6 M${x - 3} ${y - 4} l1.6 4 M${x + 3} ${y - 4} l-1.6 4" style="stroke:#D8B49C" stroke-width=".6"/>`).join(""));
// the skirting where the floor meets the back wall (a band of blue-grey paint, the Formentera sòcol), and the step at the front
const skirt = (y = 200, col = "#B9CCD6") => g(`<rect y="${y - 14}" width="520" height="23" style="fill:${col}"/><path d="M0 ${y - 14} H520" style="stroke:#8EA6B4" stroke-width="1.2"/><path d="M0 ${y + 9} H520" style="stroke:#6E7E86" stroke-width="1.4"/>`);
const step = (col = P.lime3) => g(`<rect y="630" width="520" height="10" style="fill:${col}"/><path d="M0 630 H520" style="stroke:#7A6E5E" stroke-width="1.4"/>`);
// a thick whitewashed wall: lime on stone, a few soft patches where the wash is thicker or thinner
const limeWall = (y0 = 30, y1 = 200) => g(`<rect y="${y0}" width="520" height="${y1 - y0}" style="fill:${P.lime}"/>`
  + Array.from({length: 12}, (_, k) => `<ellipse cx="${f1(R(k*9)*520)}" cy="${f1(y0 + 10 + R(k*13)*(y1 - y0 - 20))}" rx="${f1(18 + R(k)*30)}" ry="${f1(6 + R(k*2)*8)}" style="fill:${k % 2 ? P.lime2 : "#FFFFFF"}" opacity=".6"/>`).join(""));
// a ceiling of twisted sabina beams over split cane, the way the old Formentera houses are roofed
const beams = (h = 32) => g(`<rect width="520" height="${h}" style="fill:${P.cane}"/>${Array.from({length: 65}, (_, k) => `<path d="M${k*8 + 2} 0 v${h}" style="stroke:${P.cane2}" stroke-width="1"/>`).join("")}`
  + Array.from({length: 8}, (_, k) => { const x = 30 + k*66 + Math.round(R(k)*10); return `<path d="M${x - 7} 0 q4 ${h*.5} -2 ${h} h15 q-5 ${-h*.5} 1 ${-h}z" style="fill:${k % 2 ? P.sabina : "#7E6A56"}"/><path d="M${x - 2} 2 q3 ${h*.4} -1 ${h - 4}" fill="none" style="stroke:${P.sabinaL}" stroke-width="1.2" opacity=".7"/>`; }).join("")
  + `<path d="M0 ${h - 9} q130 -4 260 1 q130 4 260 -1 v12 q-130 4 -260 -1 q-130 -4 -260 1z" style="fill:${P.sabina2}"/><path d="M0 ${h - 6} q130 -3 260 1 q130 3 260 -1" fill="none" style="stroke:${P.sabina}" stroke-width="1.4"/>`);
// a gnarled sabina post, as used for the beach bars and the old porches
const sabinaPost = (x, y0, y1, w = 12) => `<path d="M${x - w/2} ${y1} q-3 ${-(y1 - y0)*.3} 2 ${-(y1 - y0)*.55} q-4 ${-(y1 - y0)*.25} -1 ${-(y1 - y0)*.45} h${w} q3 ${(y1 - y0)*.2} -1 ${(y1 - y0)*.45} q5 ${(y1 - y0)*.3} 1 ${(y1 - y0)*.55}z" style="fill:${P.sabina}"/>`
  + `<path d="M${x - 1} ${y0 + 6} q-3 ${(y1 - y0)*.3} 1 ${(y1 - y0)*.5} q3 ${(y1 - y0)*.2} -1 ${(y1 - y0)*.45}" fill="none" style="stroke:${P.sabinaL}" stroke-width="1.4" opacity=".8"/><ellipse cx="${x + 2}" cy="${f1(y0 + (y1 - y0)*.4)}" rx="2" ry="3" style="fill:${P.sabina2}"/>`;
// the sea seen from inside: sky, a far horizon, deep blue fading to turquoise and clear water over pale sand
const seaView = (x, y, w, h, hz = .38, extra = "") => { const H = y + h*hz, d = h - h*hz;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.sky}"/><rect x="${x}" y="${y}" width="${w}" height="${f1(h*hz*.5)}" style="fill:#BFE2F2"/>`
    + `<rect x="${x}" y="${f1(H)}" width="${w}" height="${f1(d)}" style="fill:${P.deep}"/><rect x="${x}" y="${f1(H + d*.22)}" width="${w}" height="${f1(d)}" style="fill:${P.seaD}"/><rect x="${x}" y="${f1(H + d*.45)}" width="${w}" height="${f1(d)}" style="fill:${P.sea}"/><rect x="${x}" y="${f1(H + d*.72)}" width="${w}" height="${f1(d)}" style="fill:${P.seaL}"/>`
    + Array.from({length: Math.round(w/14)}, (_, k) => `<path d="M${f1(x + R(k*3 + w)*w)} ${f1(H + d*(.1 + R(k*7 + h)*.6))} h${f1(4 + R(k)*6)}" style="stroke:#FFFFFF" stroke-width="1" opacity=".55"/>`).join("") + extra; };
// a little white sail on the horizon, and a llaüt (the island's wooden fishing boat) at anchor
const sail = (x, y, s = 1) => `<path d="M${x} ${y} v${-12*s} l${7*s} ${10*s}z" style="fill:#FFFFFF"/><path d="M${x - 5*s} ${y} h${11*s} l${-2*s} ${2.4*s} h${-7*s}z" style="fill:#F4F4F0"/>`;
const llaut = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-16 -3 h32 q-3 6 -8 7 h-18 q-5 -1 -6 -7z" style="fill:#FFFDF6"/><path d="M-16 -3 h32" style="stroke:${P.blue}" stroke-width="2"/><path d="M-15 0 h30" style="stroke:#C8483A" stroke-width=".9"/><path d="M-2 -3 v-12" style="stroke:${P.wood2}" stroke-width="1.2"/><path d="M-12 -3 q6 -2 4 -6 h-4z" style="fill:${P.woodL}"/></g>`;
// a window in the thick white wall: a deep reveal, blue shutters folded back, and the view inside
const blueWindow = (x, y, w, h, view) => g(sk(`<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="3" style="fill:${P.lime3}"/>`, ``) + clip(x, y, w, h, view)
  + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" style="stroke:${P.blue2}" stroke-width="3"/><path d="M${x + w/2} ${y} v${h} M${x} ${y + h*.5} h${w}" style="stroke:${P.blue2}" stroke-width="2"/>`
    + [x - 6 - w*.32, x + w + 6].map(sx => `<rect x="${f1(sx)}" y="${y - 2}" width="${f1(w*.32)}" height="${h + 4}" style="fill:${P.blue}"/>${Array.from({length: Math.floor(h/7)}, (_, k) => `<path d="M${f1(sx + 2)} ${y + 4 + k*7} h${f1(w*.32 - 4)}" style="stroke:${P.blue2}" stroke-width="1.2"/>`).join("")}`).join("")
    + `<rect x="${x - 10}" y="${y + h + 4}" width="${w + 20}" height="6" rx="1" style="fill:${P.lime2}"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${[x - 6 - w*.32, x + w + 6].map(sx => `<rect x="${f1(sx)}" y="${y - 2}" width="${f1(w*.32)}" height="${h + 4}"/>`).join("")}`));
// a hanging lantern: wicker or palm round a candle glass, from a cord
const lantern = (x, y, top = 30, col = "#C9A05A") => g(`<path d="M${x} ${top} V${y - 13}" style="stroke:${P.sabina2}" stroke-width="1"/>`) + lampGlow(x, y, 28) + g(sk(`<ellipse cx="${x}" cy="${y}" rx="10" ry="12" style="fill:${col}"/>${[-6, -2, 2, 6].map(d => `<path d="M${x + d} ${y - 11} q${d*.6} 11 0 22" fill="none" style="stroke:#8E6A34" stroke-width=".8"/>`).join("")}<path d="M${x - 9} ${y - 4} h18 M${x - 9} ${y + 4} h18" style="stroke:#8E6A34" stroke-width=".8"/><ellipse cx="${x}" cy="${y + 1}" rx="3.4" ry="5" style="fill:#FFE28A" opacity=".9"/><path d="M${x - 4} ${y - 13} h8" style="stroke:${P.sabina2}" stroke-width="2"/>`,
  `<ellipse cx="${x}" cy="${y}" rx="10" ry="12"/>`));
// pots: red geraniums, a dwarf fan palm (palmito), a fig in a pot
const potBase = (x, y, col = P.terra) => `<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z" style="fill:${col}"/><path d="M${x - 13} ${y - 18} h26" style="stroke:#8E4A2A" stroke-width="2.4"/>`;
const geranium = (x, y) => g(sk(`${[[-10, -26], [-3, -32], [6, -28], [11, -22], [0, -22]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="6.4" ry="5" style="fill:#4E8A44"/>`).join("")}${[[-8, -34], [2, -38], [10, -32], [-2, -28]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="4.2" style="fill:#D9433A"/><circle cx="${x + dx - 1}" cy="${y + dy - 1}" r="1.6" style="fill:#F07A6A"/>`).join("")}${potBase(x, y)}`,
  `<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z"/>`));
const palmito = (x, y, s = 1) => g(sk(`${[-60, -35, -12, 12, 35, 60].map(a => `<g transform="rotate(${a} ${x} ${y - 18*s})">${[-8, -4, 0, 4, 8].map(d => `<path d="M${x} ${y - 18*s} l${d*s*.7} ${-26*s}" style="stroke:#5E8A4A" stroke-width="${2.2*s}" stroke-linecap="round"/>`).join("")}</g>`).join("")}${potBase(x, y, P.terra2)}`,
  `<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z"/>`));
const stool = (x, y, col = P.woodL, leg = P.wood2) => sk(`<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="4.2" style="fill:${col}"/><path d="M${x - 7} ${y - 18} l-3 18 M${x + 7} ${y - 18} l3 18 M${x} ${y - 17} v17" style="stroke:${leg}" stroke-width="2.2"/>`, `<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="4.2"/>`);
// a rush-seated country chair (cadira de boga), painted
const chair = (x, y, col = P.blue, seat = "#D9B866") => sk(`<path d="M${x - 10} ${y - 46} v46 M${x + 10} ${y - 46} v46" style="stroke:${col}" stroke-width="3"/><path d="M${x - 10} ${y - 42} h20 M${x - 10} ${y - 34} h20" style="stroke:${col}" stroke-width="3"/><rect x="${x - 12}" y="${y - 22}" width="24" height="7" rx="2" style="fill:${seat}"/><path d="M${x - 10} ${y - 20} h20 M${x - 10} ${y - 17} h20" style="stroke:#B8984A" stroke-width=".7"/>`,
  `<rect x="${x - 12}" y="${y - 22}" width="24" height="7" rx="2"/>`);
const crate = (x, y, w, h, col = "#C9A26A", line = "#9A7A4A") => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${col}"/>${Array.from({length: Math.floor(h/8)}, (_, k) => `<path d="M${x} ${y + 4 + k*8} h${w}" style="stroke:${line}" stroke-width="1"/>`).join("")}`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
// a woven palm basket (the island's llatra work), with a striped band
const palmBasket = (x, y, s = 1, band = "#C8483A") => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-12 -16 h24 l-3 16 h-18z" style="fill:#D8B470"/>${[-12, -8, -4].map(d => `<path d="M-12 ${d} h24" style="stroke:#B48E4C" stroke-width=".8"/>`).join("")}<path d="M-11.4 -11 h22.8" style="stroke:${band}" stroke-width="2"/><path d="M-8 -16 q8 -14 16 0" fill="none" style="stroke:#B48E4C" stroke-width="2"/></g>`;
// a straw sun hat
const strawHat = (x, y, s = 1, band = P.blue) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><ellipse rx="16" ry="4.4" style="fill:#E2C47E"/><path d="M-8 -1 q0 -10 8 -10 q8 0 8 10z" style="fill:#E8CC88"/><path d="M-8 -3 q8 2 16 0" fill="none" style="stroke:${band}" stroke-width="2"/></g>`;

/* ---------- Marina's chiringuito ---------- */
// fresh fish off the grill on a plate with lemon; a glass of juice with a straw; half a watermelon; a pineapple
const fishPlate = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><ellipse rx="15" ry="4.6" style="fill:#FFFDF6;stroke:#C9C2B4" stroke-width=".7"/><ellipse rx="10" ry="2.8" fill="none" style="stroke:${P.blue}" stroke-width=".8"/><path d="M-11 -2 q9 -6 18 -1 l5 -3 v7 l-5 -3 q-9 5 -18 0z" style="fill:#B8A68E"/>${[-6, -2, 2].map(d => `<path d="M${d} -5 l2 4" style="stroke:#5A4430" stroke-width="1"/>`).join("")}<circle cx="-8" cy="-2.4" r=".9" style="fill:#2A2420"/><path d="M8 1 q3 -4 6 0z" style="fill:#F6E04A"/><path d="M-13 1 l3 -1.4 l1 1.6z" style="fill:${P.leaf}"/></g>`;
const juice = (x, y, col, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-4 -14 h8 l-1 14 h-6z" style="fill:${col}" opacity=".92"/><path d="M-4 -14 h8" style="stroke:#FFFFFF" stroke-width="1"/><path d="M-3 -12 v9" style="stroke:#FFFFFF" stroke-width=".9" opacity=".6"/><path d="M1 -14 l3 -6 h3" fill="none" style="stroke:#E8574A" stroke-width="1.2"/><circle cx="4" cy="-14" r="2.4" style="fill:#F6E04A"/></g>`;
const jug = (x, y, col) => `<path d="M${x - 7} ${y} q-2 -14 2 -24 h10 q4 10 2 24z" style="fill:${col}" opacity=".9"/><path d="M${x - 5} ${y - 24} h10 l3 -3" fill="none" style="stroke:#E8F1F0" stroke-width="1.6"/><path d="M${x + 6} ${y - 18} q6 2 2 10" fill="none" style="stroke:#E8F1F0" stroke-width="1.6"/><path d="M${x - 4} ${y - 20} v14" style="stroke:#FFFFFF" stroke-width="1" opacity=".6"/>`;
const watermelon = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-12 0 a12 12 0 0 1 24 0z" style="fill:#E8574A"/><path d="M-12 0 a12 12 0 0 1 24 0" fill="none" style="stroke:#3E7A3A" stroke-width="2.4"/>${[[-5, -5], [0, -7], [5, -5], [-2, -3], [3, -3]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx=".9" ry="1.3" style="fill:#2A2420"/>`).join("")}</g>`;
const pineapple = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[-4, 0, 4].map(d => `<path d="M0 -14 l${d} -10" style="stroke:#4E8A44" stroke-width="2.4" stroke-linecap="round"/>`).join("")}<ellipse cy="-6" rx="6.4" ry="9" style="fill:#E8A83A"/><path d="M-5 -11 l10 8 M-6 -5 l9 7 M5 -11 l-10 8 M6 -5 l-9 7" style="stroke:#B8782A" stroke-width=".7"/></g>`;
function barRoom(){
  // the back is open to the water: sabina posts holding up the palm thatch, a low whitewashed wall, the turquoise sea
  // shallow and clear over the sand, a llaüt at anchor, and Ibiza low on the horizon
  const view = seaView(0, 30, 520, 150, .3, `<path d="M330 75 q30 -10 56 -4 q22 -8 44 -2 q30 -3 50 6 v2 h-150z" style="fill:#8EA8B8" opacity=".75"/>` + llaut(108, 128, 1.2) + sail(250, 74, .9) + sail(470, 78, .7)
    + `<path d="M0 162 q130 -10 260 -4 q130 6 260 -2 v30 h-520z" style="fill:${P.sand2}"/>`);
  const back = g(clip(0, 30, 520, 170, view))
    // the low wall at the back, whitewashed, its rounded cap; the bar's back counter in the middle against it
    + g(sk(`<rect y="160" width="520" height="40" style="fill:${P.lime}"/><path d="M0 160 q260 -6 520 0 v6 h-520z" style="fill:#FFFFFF"/><path d="M0 182 h520" style="stroke:${P.lime3}" stroke-width="1"/>`, `<path d="M0 160 q260 -6 520 0"/>`))
    + g(sk(`<rect x="176" y="118" width="168" height="82" rx="3" style="fill:${P.lime}"/><rect x="176" y="114" width="168" height="7" rx="2" style="fill:${P.drift}"/><rect x="184" y="146" width="152" height="5" style="fill:${P.drift2}"/><rect x="184" y="176" width="152" height="5" style="fill:${P.drift2}"/>`,
        `<rect x="176" y="118" width="168" height="82" rx="3"/>`)
      // glasses, jugs of juice and bottles on the back shelves
      + jug(196, 146, P.orange) + jug(216, 146, "#F27A8A") + jug(236, 146, "#9ACB5A") + [256, 268, 280, 292].map((x, k) => `<path d="M${x - 3} 146 h6 l-1 -12 h-4z" style="fill:#E8F1F0" opacity=".85"/>`).join("")
      + [312, 324].map((x, k) => `<rect x="${x - 4}" y="126" width="8" height="20" rx="2" style="fill:${k ? "#6E9A4A" : "#C9883A"}" opacity=".85"/><rect x="${x - 1.6}" y="120" width="3.2" height="7" style="fill:${k ? "#6E9A4A" : "#C9883A"}"/>`).join("")
      + [196, 222, 248].map((x, k) => `<circle cx="${x}" cy="${170 - (k % 2)*2}" r="6" style="fill:${[P.orange, "#F6E04A", "#9ACB5A"][k]}"/>`).join("") + pineapple(278, 176, .9) + watermelon(312, 176, .9) + palmBasket(334, 176, .55))
    // the sign hung from the thatch: CHIRINGUITO, and the chalkboard of the day's grill and juices
    + g(sk(`<path d="M206 42 v10 M314 42 v10" style="stroke:${P.sabina2}" stroke-width="1.2"/><rect x="196" y="52" width="128" height="24" rx="4" style="fill:${P.blue}"/>`, `<rect x="196" y="52" width="128" height="24" rx="4"/>`) + txt(260, 69, "CHIRINGUITO", 12, "#FFFDF6", 700)
      + sk(`<rect x="200" y="82" width="120" height="30" rx="2" style="fill:#2F3A34"/><rect x="200" y="82" width="120" height="30" rx="2" fill="none" style="stroke:${P.drift}" stroke-width="3"/>`, `<rect x="200" y="82" width="120" height="30" rx="2"/>`)
      + txt(260, 94, "Peix a la brasa: grilled fish", 7, "#F3D98A", 700) + txt(260, 106, "Fresh juices", 7, "#E8EEE6"))
    // the sabina posts and the palm thatch over everything, its ragged fringe
    + g(sk([10, 140, 380, 510].map(x => sabinaPost(x, 30, 200, 14)).join(""), [10, 140, 380, 510].map(x => `<path d="M${x - 7} 200 v-170 M${x + 7} 200 v-170"/>`).join("")))
    + g(`<rect width="520" height="40" style="fill:${P.thatch}"/>${Array.from({length: 66}, (_, k) => `<path d="M${k*8} 0 l${4 + (k % 3)} 40" style="stroke:${k % 2 ? P.thatch2 : "#E2C27E"}" stroke-width="2"/>`).join("")}<path d="M0 14 h520" style="stroke:${P.thatch3}" stroke-width="2" opacity=".6"/>`
      + `<path d="M0 38 ${Array.from({length: 53}, (_, k) => `L${k*10 + 5} ${46 + (k % 3)*3} L${k*10 + 10} 38`).join(" ")} V0 H0z" style="fill:${P.thatch}"/>${Array.from({length: 52}, (_, k) => `<path d="M${k*10 + 5} 36 l0 ${8 + (k % 3)*3}" style="stroke:${P.thatch2}" stroke-width="1.2"/>`).join("")}`)
    // hanging palm baskets (for sale) on the left post, and the lanterns
    + g(`<path d="M146 64 h22 M146 96 h22" style="stroke:${P.sabina2}" stroke-width="2"/>` + palmBasket(162, 86, .8) + palmBasket(160, 118, .7, P.blue) + strawHat(160, 140, .8))
    + lantern(72, 104, 44) + lantern(450, 104, 44, "#D8B470") + lantern(380, 70, 44, "#E8D8A8") + lantern(140, 70, 44, "#E8D8A8");
  // the bar: driftwood planks bleached grey by the sun, a slab of old timber for the top, the day's grilled fish and juices
  const bar = spot("fm_bar", 262, 384, "The bar: treats, juices and grilled fish", hovE(262, 366, 110, 14),
    sk(`<rect x="152" y="298" width="220" height="48" style="fill:${P.drift}"/>${[0, 1, 2, 3, 4].map(r => `<path d="M154 ${304 + r*9} q54 ${(r % 2) ? 3 : -3} 108 0 q54 ${(r % 2) ? -3 : 3} 108 0" fill="none" style="stroke:${P.drift2}" stroke-width="1.2"/>`).join("")}<ellipse cx="190" cy="318" rx="3" ry="2" style="fill:${P.drift2}"/><ellipse cx="320" cy="332" rx="3.4" ry="2" style="fill:${P.drift2}"/>
      <path d="M144 290 q118 -4 236 0 v10 q-118 3 -236 0z" style="fill:${P.wood}"/><path d="M146 293 q116 -3 232 0" fill="none" style="stroke:${P.woodL}" stroke-width="1.4"/>
      <path d="M156 346 v-48 M368 346 v-48" style="stroke:${P.sabina}" stroke-width="6"/><path d="M156 304 q4 -4 0 -8 M368 304 q-4 -4 0 -8" style="stroke:${P.sabina2}" stroke-width="1"/>`,
      `<rect x="152" y="298" width="220" height="48"/><path d="M144 290 q118 -4 236 0 v10 q-118 3 -236 0z"/>`)
    + fishPlate(184, 286) + fishPlate(214, 288, .95)
    + juice(246, 290, P.orange) + juice(262, 291, "#F27A8A") + juice(278, 290, "#9ACB5A")
    + `<path d="M296 290 q8 -8 18 0z" style="fill:#FFFDF6"/>${[0, 1, 2].map(k => `<circle cx="${300 + k*5}" cy="${286 - (k % 2)*2}" r="3.2" style="fill:#F6E04A"/>`).join("")}` + pineapple(328, 290) + watermelon(352, 290, .9)
    + `<rect x="232" y="272" width="16" height="12" rx="2" style="fill:#FFFDF6;stroke:${P.blue}" stroke-width=".8"/>` + txt(240, 281, "€", 7, P.blue, 700)
    // the fridge magnets on a little board at the end of the bar
    + `<rect x="362" y="304" width="14" height="22" rx="1" style="fill:${P.cream}"/>${[[366, 309, P.blue], [372, 311, P.sea], [366, 318, P.red], [372, 321, "#F6E04A"]].map(([a, b, c]) => `<rect x="${a - 2.4}" y="${b - 2.4}" width="4.8" height="4.8" rx="1" style="fill:${c}"/>`).join("")}`
    + lab(262, 366, "The bar", "#CFEDEA", 10));
  // the grill on the left: a whitewashed block, the charcoal glowing, a row of fish over it, the smoke going up into the thatch
  const grill = g(lampGlow(80, 278, 40) + sk(`<rect x="22" y="282" width="118" height="62" rx="3" style="fill:${P.lime}"/><path d="M22 340 h118" style="stroke:${P.lime3}" stroke-width="3"/><rect x="34" y="296" width="94" height="24" rx="2" style="fill:#3A2E28"/>
      <rect x="18" y="272" width="126" height="12" rx="2" style="fill:${P.lime2}"/><rect x="30" y="264" width="102" height="10" style="fill:#2F2B28"/>${Array.from({length: 12}, (_, k) => `<path d="M${33 + k*8.6} 264 v10" style="stroke:${P.iron2}" stroke-width="1"/>`).join("")}`,
      `<rect x="22" y="282" width="118" height="62" rx="3"/><rect x="18" y="272" width="126" height="12" rx="2"/>`)
    + Array.from({length: 9}, (_, k) => `<circle cx="${40 + k*10}" cy="${306 + (k % 3)*4}" r="${f1(3 + R(k)*1.6)}" style="fill:${k % 3 ? "#E8682A" : "#FFB44A"}"/>`).join("")
    + [44, 70, 96, 120].map((x, k) => `<g transform="translate(${x} 266) rotate(${k % 2 ? 6 : -6})"><path d="M-11 0 q9 -6 18 -1 l5 -3 v7 l-5 -3 q-9 5 -18 0z" style="fill:#B8A68E"/><path d="M-5 -3 l2 4 M0 -3 l2 4" style="stroke:#4A3424" stroke-width="1"/></g>`).join("")
    + `<path d="M60 254 q-8 -20 4 -36 q10 -14 0 -30 M92 252 q8 -18 -2 -34 q-8 -14 4 -28" fill="none" style="stroke:#FFFFFF" stroke-width="3" opacity=".5"/>`
    + sk(`<rect x="56" y="324" width="50" height="12" rx="1" style="fill:${P.blue}"/>`, ``) + txt(81, 333, "A LA BRASA", 6.4, "#FFFDF6", 700));
  // the juice corner on the right: a blue cool box, crates of oranges and watermelons, the woven baskets and hats for sale
  const juiceCorner = g(crate(386, 300, 112, 46) + sk(`<rect x="392" y="262" width="58" height="38" rx="3" style="fill:#3E8FC8"/><rect x="392" y="262" width="58" height="9" rx="3" style="fill:#FFFDF6"/>`, `<rect x="392" y="262" width="58" height="38" rx="3"/>`)
    + txt(421, 290, "GEL", 7, "#FFFDF6", 700) + [0, 1, 2, 3].map(k => watermelon(468 + (k % 2)*16, 300 - Math.floor(k/2)*10, .9)).join("")
    + [0, 1, 2, 3, 4, 5, 6].map(k => `<circle cx="${396 + k*14}" cy="318" r="5.6" style="fill:${P.orange}"/><circle cx="${394 + k*14}" cy="316" r="1.4" style="fill:#FFD08A"/>`).join("")
    + sk(`<rect x="420" y="330" width="56" height="12" rx="1" style="fill:${P.cream}"/>`, ``) + txt(448, 339, "FRUITA FRESCA", 5.8, P.leaf2, 700)
    + palmBasket(402, 254, .75) + palmBasket(424, 250, .65, P.blue) + strawHat(476, 250, .8, P.red));
  // a table with your toes in the sand: a low driftwood table, two blue chairs, a plate of fish and two glasses, a candle jar
  const view2 = spot("fmview", 96, 530, "A table with your toes in the sand", hovE(96, 516, 58, 11),
    lampGlow(96, 446, 24) + chair(36, 496, P.blue) + chair(156, 496, "#3E9FB0")
    + sk(`<ellipse cx="96" cy="458" rx="48" ry="12" style="fill:${P.woodL}"/><path d="M52 458 q44 8 88 0 v6 q-44 8 -88 0z" style="fill:${P.wood}"/><path d="M84 468 v26 M108 468 v26" style="stroke:${P.wood2}" stroke-width="5"/>`, `<ellipse cx="96" cy="458" rx="48" ry="12"/>`)
    + fishPlate(82, 458, .9) + juice(112, 458, P.orange, .8) + juice(124, 460, "#F27A8A", .8) + `<rect x="91" y="440" width="10" height="12" rx="2" style="fill:#E8F1F0" opacity=".8"/><ellipse cx="96" cy="446" rx="2" ry="3.4" style="fill:#FFE28A"/>`
    // two pairs of sandals kicked off under the table
    + `<ellipse cx="74" cy="500" rx="5" ry="2.4" style="fill:#A8683A"/><ellipse cx="84" cy="502" rx="5" ry="2.4" style="fill:#A8683A"/><ellipse cx="114" cy="502" rx="5" ry="2.4" style="fill:${P.blue}"/><ellipse cx="124" cy="500" rx="5" ry="2.4" style="fill:${P.blue}"/>`
    + lab(96, 516, "Toes in the sand", "#F6E3B4", 9));
  // the hammock, slung between two sabina posts, striped like the old beach cloths
  const hammock = spot("fmhammock", 446, 520, "The hammock", hovE(446, 506, 54, 11),
    sk(sabinaPost(394, 404, 492, 10) + sabinaPost(498, 404, 492, 10)
      + `<path d="M398 424 q48 64 96 0 q-48 46 -96 0z" style="fill:#F4EDE0"/>${[0, 1, 2, 3].map(k => `<path d="M${404 + k*4} ${430 + k*6} q${42 - k*4} ${42 - k*6} ${84 - k*8} 0" fill="none" style="stroke:${k % 2 ? P.sea : P.blue}" stroke-width="3"/>`).join("")}<path d="M394 418 l6 8 M498 418 l-6 8" style="stroke:#C9A26A" stroke-width="1.6"/>`,
      `<path d="M398 424 q48 64 96 0 q-48 46 -96 0z"/>`)
    + `<rect x="430" y="440" width="18" height="10" rx="2" transform="rotate(-8 439 445)" style="fill:#E8C26A"/>`
    + lab(446, 506, "Hammock", "#CFEDEA", 9));
  // the front: a big dwarf fan palm, the crate of empties and a cool box (left); two striped deckchairs and a beach umbrella (right)
  const frontL = g(palmito(42, 594, 1.2) + crate(66, 568, 52, 28, "#8EA8B8", "#6E8698") + [0, 1, 2, 3, 4].map(k => `<rect x="${71 + k*9.4}" y="${552 - (k % 2)*3}" width="5" height="18" rx="2" style="fill:${k % 2 ? "#6E9A4A" : "#C9883A"}" opacity=".85"/>`).join("")
    + sk(`<rect x="122" y="566" width="34" height="30" rx="3" style="fill:#E8574A"/><rect x="122" y="566" width="34" height="8" rx="3" style="fill:#FFFDF6"/>`, `<rect x="122" y="566" width="34" height="30" rx="3"/>`));
  const deckchair = (x, col) => sk(`<path d="M${x} 596 l14 -42 M${x + 34} 596 l-8 -30 M${x + 4} 584 h28" style="stroke:${P.wood}" stroke-width="3"/><path d="M${x + 4} 582 l12 -30 l14 6 l-8 26z" style="fill:${col}"/>${[0, 1, 2].map(k => `<path d="M${x + 7 + k*4} 576 l10 -22" style="stroke:#FFFDF6" stroke-width="1.6"/>`).join("")}`, `<path d="M${x + 4} 582 l12 -30 l14 6 l-8 26z"/>`);
  const frontR = g(deckchair(368, P.blue) + deckchair(412, P.sea)
    + sk(`<path d="M484 596 v-46" style="stroke:${P.wood2}" stroke-width="3"/><path d="M460 554 q24 -18 48 0z" style="fill:#FFFDF6"/>${[0, 1, 2].map(k => `<path d="M${468 + k*10} 552 q3 -9 6 -12" fill="none" style="stroke:${P.blue}" stroke-width="4"/>`).join("")}`, `<path d="M460 554 q24 -18 48 0z"/>`)
    + `<path d="M454 596 l4 -14 h12 l4 14z" style="fill:#E8C26A"/><path d="M456 584 h16" style="stroke:${P.red}" stroke-width="2"/>`);
  return sandFloor(200) + back + grill + juiceCorner + bar + view2 + hammock + frontL + frontR + exit(P.blue);
}

/* ---------- the salt works shop ---------- */
// a glass jar of salt with a cloth cap tied with string; the herb salts are tinted (rosemary green, hibiscus pink, pepper)
const saltJar = (x, y, col = P.salt, cap = "#E8DCC4", s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><rect x="-6" y="-16" width="12" height="16" rx="2" style="fill:#E8F1F0" opacity=".9"/><rect x="-5" y="-12" width="10" height="11" rx="1" style="fill:${col}"/>${col === P.salt ? `<circle cx="-2" cy="-8" r=".7" style="fill:#D8DEE2"/><circle cx="2" cy="-5" r=".7" style="fill:#D8DEE2"/>` : `<circle cx="-2" cy="-8" r=".8" style="fill:#FFFFFF" opacity=".7"/><circle cx="2" cy="-4" r=".8" style="fill:#2A2420" opacity=".4"/>`}<path d="M-7 -17 q7 -5 14 0 l-1 3 h-12z" style="fill:${cap}"/><path d="M-6 -14.6 h12" style="stroke:#A8683A" stroke-width=".8"/></g>`;
// a jute sack of salt, the top rolled down, stencilled SAL
const saltSack = (x, y, s = 1, word = true) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-16 0 q-4 -20 2 -32 h28 q6 12 2 32z" style="fill:#C9AE80"/><path d="M-14 -32 q14 6 28 0 q-2 -6 -14 -6 q-12 0 -14 6z" style="fill:${P.salt}"/><path d="M-15 -30 q15 6 30 0" fill="none" style="stroke:#A88E60" stroke-width="2"/>${[-8, 0, 8].map(d => `<path d="M${d} -26 v24" style="stroke:#B89A6A" stroke-width=".6"/>`).join("")}${word ? `<text x="0" y="-10" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${P.blue2}">SAL</text>` : ""}</g>`;
// the salt pans seen through the window: flat shallow pools edged with low dykes, pink with brine in summer and heaped
// with white pyramids at the harvest, silvery and flooded otherwise; flamingos in the cool months; the old windmill far off
const pansView = (x, y, w, h) => { const H = y + h*.3, col = harvestTime() ? "#F0C8C0" : summer() ? "#EAD2CC" : "#C8D8E0";
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.sky}"/><path d="M${x} ${H} q${w*.3} -8 ${w*.55} -2 q${w*.25} -6 ${w*.45} 0 v6 h${-w}z" style="fill:#7E9A6A"/>`
    + `<path d="M${x + w*.78} ${H - 2} v-18 M${x + w*.78 - 8} ${H - 28} l16 16 M${x + w*.78 + 8} ${H - 28} l-16 16" style="stroke:#8A7258" stroke-width="2"/><rect x="${x + w*.78 - 3}" y="${H - 22}" width="6" height="20" style="fill:#E8DCC4"/>`
    + `<rect x="${x}" y="${H + 4}" width="${w}" height="${h}" style="fill:#D8C9A4"/>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const px = x + 4 + c*(w - 8)/3, py = H + 8 + r*((h*.7 - 12)/3), pw = (w - 8)/3 - 5, ph = (h*.7 - 12)/3 - 5;
    s += `<rect x="${f1(px)}" y="${f1(py)}" width="${f1(pw)}" height="${f1(ph)}" style="fill:${(r + c) % 2 ? col : "#E2E8EC"}"/><path d="M${f1(px + 3)} ${f1(py + ph*.4)} h${f1(pw*.4)}" style="stroke:#FFFFFF" stroke-width=".8" opacity=".7"/>`; }
  if (harvestTime()) s += [[.25, .62], [.5, .78], [.72, .55]].map(([a, b]) => `<path d="M${f1(x + a*w - 9)} ${f1(y + b*h)} l9 -12 l9 12z" style="fill:#FFFFFF;stroke:#D8D8D2" stroke-width=".7"/>`).join("");
  if (flamingoTime()) s += [[.3, .52], [.42, .58], [.6, .68]].map(([a, b], k) => { const fx = x + a*w, fy = y + b*h; return `<path d="M${f1(fx)} ${f1(fy)} v-6" style="stroke:#E88A8A" stroke-width=".8"/><ellipse cx="${f1(fx)}" cy="${f1(fy - 8)}" rx="4" ry="2.4" style="fill:#F4A6A6"/><path d="M${f1(fx + 3)} ${f1(fy - 9)} q3 -6 ${k % 2 ? 0 : 2} -9" fill="none" style="stroke:#F4A6A6" stroke-width="1.2"/>`; }).join("");
  return s; };
// an old black-and-white photograph in a thin frame: salt workers with rakes, a pyramid of salt, a wagon, a boat loading
const photo = (x, y, w, h, kind) => { const inner = kind === 0 ? `<path d="M${x + 4} ${y + h - 6} h${w - 8}" style="stroke:#8A8478" stroke-width="2"/><path d="M${x + w*.3 - 5} ${y + h - 6} l5 -12 l5 12z" style="fill:#F4F0E6"/>${[.55, .72].map(t => `<circle cx="${f1(x + t*w)}" cy="${y + h*.4}" r="2.2" style="fill:#4A4640"/><path d="M${f1(x + t*w)} ${y + h*.48} v${h*.3} M${f1(x + t*w)} ${y + h*.5} l6 -8 v20" style="stroke:#4A4640" stroke-width="1.6"/>`).join("")}`
  : kind === 1 ? `<path d="M${x + w/2 - 14} ${y + h - 5} l14 -${h - 14} l14 ${h - 14}z" style="fill:#F4F0E6"/><circle cx="${x + w/2 + 18}" cy="${y + h*.5}" r="2" style="fill:#4A4640"/><path d="M${x + w/2 + 18} ${y + h*.56} v${h*.3}" style="stroke:#4A4640" stroke-width="1.6"/>`
  : kind === 2 ? `<path d="M${x + 6} ${y + h - 6} h${w - 12}" style="stroke:#4A4640" stroke-width="1.2" stroke-dasharray="2 2"/><path d="M${x + 10} ${y + h - 10} h${w*.5} l-3 -10 h${-w*.5 + 6}z" style="fill:#6A6458"/><path d="M${x + 12} ${y + h - 20} q${w*.22} -10 ${w*.44} 0" style="fill:#F4F0E6"/><circle cx="${x + w*.78}" cy="${y + h*.42}" r="2" style="fill:#4A4640"/><path d="M${x + w*.78} ${y + h*.48} v${h*.32}" style="stroke:#4A4640" stroke-width="1.6"/>`
  : `<rect x="${x + 2}" y="${y + h*.55}" width="${w - 4}" height="${h*.4}" style="fill:#8A8478"/><path d="M${x + 8} ${y + h*.6} h${w*.6} q-4 8 -8 8 h${-w*.5}z" style="fill:#3A3630"/><path d="M${x + w*.4} ${y + h*.6} v-${h*.4}" style="stroke:#3A3630" stroke-width="1.2"/><path d="M${x + w*.4} ${y + h*.24} l${w*.2} ${h*.32} h${-w*.2}z" style="fill:#E8E4DA"/>`;
  return `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" style="fill:${P.wood2}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#D8D0BE"/>${inner}`; };
function saltRoom(){
  // an old stone salt store: whitewashed walls over the marès blocks (showing where the lime has worn), sabina beams
  const worn = [[22, 168, 34, 14], [60, 182, 28, 12], [300, 40, 30, 14], [476, 168, 30, 14], [356, 176, 26, 12]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" style="fill:${P.stone2}"/><rect x="${x + w + 2}" y="${y + 2}" width="${w*.7}" height="${h - 2}" rx="2" style="fill:${P.stone}"/>`).join("");
  const wall = limeWall(30, 200) + g(worn) + beams(32)
    // the long wooden salt rake (a rasclet) hung on two pegs, and a wooden shovel
    + g(sk(`<path d="M30 70 h132" style="stroke:${P.wood}" stroke-width="5" stroke-linecap="round"/><rect x="18" y="58" width="12" height="40" rx="2" style="fill:${P.woodL}"/><path d="M24 62 v32" style="stroke:${P.wood2}" stroke-width="1"/><path d="M60 64 v12 M136 64 v12" style="stroke:${P.iron}" stroke-width="3"/>
        <path d="M40 92 h112" style="stroke:${P.wood}" stroke-width="4" stroke-linecap="round"/><path d="M152 92 q14 -10 22 0 q-8 10 -22 0z" style="fill:${P.woodL}"/>`, `<path d="M30 70 h132"/><rect x="18" y="58" width="12" height="40" rx="2"/>`)
      + sk(`<rect x="28" y="112" width="128" height="20" rx="2" style="fill:${P.blue}"/>`, `<rect x="28" y="112" width="128" height="20" rx="2"/>`) + txt(92, 126, "SAL DE FORMENTERA", 8.4, "#FFFDF6", 700)
      + `<path d="M34 146 h116" style="stroke:${P.wood}" stroke-width="4"/>` + [44, 62, 80, 98, 116, 134].map((x, k) => saltJar(x, 145, [P.salt, "#B9D89A", "#F2B8C6", P.salt, "#D8C8A8", "#C8D8F0"][k], "#E8DCC4", .8)).join(""))
    // the shelves behind the counter: jars of flor de sal and herb salts, paper bags of coarse salt, a sign over them
    + g(sk(`<rect x="182" y="40" width="156" height="24" rx="3" style="fill:${P.wood2}"/>`, `<rect x="182" y="40" width="156" height="24" rx="3"/>`) + txt(260, 57, "SALINES", 12, "#F6E3B4", 700)
      + sk(`${[104, 140, 176].map(y => `<rect x="180" y="${y}" width="160" height="5" style="fill:${P.wood}"/>`).join("")}<path d="M182 72 v110 M338 72 v110" style="stroke:${P.wood}" stroke-width="4"/>`, `<rect x="180" y="104" width="160" height="5"/><rect x="180" y="140" width="160" height="5"/><rect x="180" y="176" width="160" height="5"/>`)
      + Array.from({length: 9}, (_, k) => saltJar(194 + k*16.4, 104, k % 3 === 1 ? "#F2B8C6" : k % 3 === 2 ? "#B9D89A" : P.salt, k % 2 ? "#E8DCC4" : "#C8D8F0")).join("")
      + Array.from({length: 7}, (_, k) => `<path d="M${190 + k*21} 140 v-18 l3 -4 h12 l3 4 v18z" style="fill:#E8D8B4"/><rect x="${193 + k*21}" y="128" width="12" height="7" style="fill:${k % 2 ? P.blue : P.cream}"/>`).join("")
      + Array.from({length: 6}, (_, k) => `<rect x="${188 + k*25}" y="${158}" width="20" height="18" rx="2" style="fill:#E8F1F0" opacity=".9"/><rect x="${190 + k*25}" y="162" width="16" height="12" style="fill:${k % 2 ? "#D8C8F0" : "#C8E8F0"}"/>`).join("")
      + txt(260, 196, "bath salts", 6.4, P.ink))
    // the window onto the salt pans, blue shutters folded back
    + blueWindow(392, 52, 94, 96, pansView(392, 52, 94, 96));
  // the counter: old timber panels, a brass balance, scoops, little dishes of flor de sal to taste, paper cones, a jar of bath crystals
  const counter = spot("fm_salt", 262, 384, "The salt works shop", hovE(262, 366, 110, 14),
    sk(`<rect x="152" y="298" width="220" height="48" style="fill:${P.wood}"/>${[0, 1, 2, 3].map(k => `<rect x="${160 + k*53}" y="304" width="46" height="36" rx="2" style="fill:${P.wood2}"/><rect x="${163 + k*53}" y="307" width="40" height="30" rx="2" fill="none" style="stroke:${P.woodL}" stroke-width="1"/>`).join("")}<rect x="146" y="290" width="232" height="9" rx="2" style="fill:${P.woodL}"/>`,
      `<rect x="152" y="298" width="220" height="48"/><rect x="146" y="290" width="232" height="9" rx="2"/>`)
    // the balance
    + `<path d="M196 290 v-20 M178 270 h36" style="stroke:${P.brass}" stroke-width="2.4"/><path d="M170 272 q8 8 16 0z M206 272 q8 8 16 0z" style="fill:${P.brass}"/><path d="M174 271 q4 -4 8 0" style="fill:${P.salt}"/><path d="M190 290 h12" style="stroke:${P.brass}" stroke-width="4"/>`
    // tasting dishes of flor de sal, each with a tiny wooden spoon
    + [236, 254, 272].map((x, k) => `<ellipse cx="${x}" cy="286" rx="7" ry="2.6" style="fill:${["#FFFDF6", "#E8F2F6", "#F6E8E8"][k]};stroke:${P.blue}" stroke-width=".7"/><path d="M${x - 5} 285 q5 -4 10 0" style="fill:${[P.salt, "#B9D89A", "#F2B8C6"][k]}"/><path d="M${x + 2} 284 l6 -6" style="stroke:${P.woodL}" stroke-width="1.2"/>`).join("")
    + saltJar(296, 290, P.salt, "#C8D8F0", 1.1) + saltJar(312, 290, "#F2B8C6", "#E8DCC4") + saltJar(326, 290, "#B9D89A", "#E8DCC4", .95)
    + `<path d="M340 290 v-22 l4 -5 h14 l4 5 v22z" style="fill:#E8D8B4"/><rect x="343" y="272" width="16" height="9" style="fill:${P.blue}"/>` + txt(351, 279, "SAL", 5.4, "#FFFDF6", 700)
    + `<path d="M362 290 l4 -12 l4 12z" style="fill:#F4ECD8"/>`
    + lab(262, 366, "Salt shop", "#E8F2F6", 10));
  // the heap of salt sacks at the back left, and a wooden scoop stuck in an open one
  const sacks = g(saltSack(40, 346, 1.15) + saltSack(80, 348, 1.2) + saltSack(120, 346, 1.1) + saltSack(58, 316, 1.05, false) + saltSack(100, 314, 1.05) + saltSack(80, 286, 1, false)
    + `<path d="M74 252 l12 -16" style="stroke:${P.wood}" stroke-width="3"/><path d="M84 240 q8 -6 12 -2 l-4 6z" style="fill:${P.woodL}"/>`);
  // the old photographs of the salt workers on a board at the back right
  const photos = spot("fmphotos", 446, 384, "Old photos of the salt workers", hovE(446, 366, 56, 11),
    sk(`<rect x="396" y="214" width="104" height="112" rx="2" style="fill:#E8DCC4"/><rect x="396" y="214" width="104" height="112" rx="2" fill="none" style="stroke:${P.wood}" stroke-width="4"/><path d="M406 326 v24 M490 326 v24" style="stroke:${P.wood2}" stroke-width="4"/>`, `<rect x="396" y="214" width="104" height="112" rx="2"/>`)
    + photo(406, 224, 40, 30, 0) + photo(452, 224, 38, 30, 1) + photo(406, 264, 40, 28, 2) + photo(452, 264, 38, 28, 3)
    + txt(448, 310, "Les Salines, 1950s", 7, P.ink, 600) + `<circle cx="426" cy="222" r="1.6" style="fill:${P.red}"/><circle cx="470" cy="222" r="1.6" style="fill:${P.red}"/>`
    + lab(446, 366, "Old photos", "#E8DCC4", 9));
  // the salt wagon from the old railway that ran the salt to the boats, on a length of track, heaped white
  const wagon = g(`<path d="M18 486 h132 M18 492 h132" style="stroke:${P.iron2}" stroke-width="2"/>${[24, 44, 64, 84, 104, 124, 144].map(x => `<rect x="${x - 4}" y="484" width="8" height="10" style="fill:${P.wood2}"/>`).join("")}`
    + sk(`<path d="M26 470 l8 -40 h82 l8 40z" style="fill:#7E8A92"/><path d="M34 444 h82" style="stroke:#5E6A72" stroke-width="2"/><path d="M28 430 q47 -26 94 0z" style="fill:${P.salt}"/><circle cx="50" cy="478" r="8" style="fill:${P.iron}"/><circle cx="100" cy="478" r="8" style="fill:${P.iron}"/><circle cx="50" cy="478" r="2.4" style="fill:${P.iron2}"/><circle cx="100" cy="478" r="2.4" style="fill:${P.iron2}"/>`,
      `<path d="M26 470 l8 -40 h82 l8 40z"/>`) + sk(`<rect x="52" y="450" width="46" height="12" rx="1" style="fill:${P.cream}"/>`, ``) + txt(75, 459, "SALINERA", 6.4, P.blue2, 700));
  // the herb bench on the right: bundles of rosemary and thyme drying, a mortar, little sacks of herb salt
  const herbs = g(sk(`<rect x="398" y="448" width="104" height="8" rx="2" style="fill:${P.woodL}"/><path d="M404 456 v34 M496 456 v34" style="stroke:${P.wood2}" stroke-width="4"/><rect x="404" y="470" width="92" height="5" style="fill:${P.wood}"/>`, `<rect x="398" y="448" width="104" height="8" rx="2"/>`)
    + [412, 432, 452].map((x, k) => `${Array.from({length: 6}, (_, j) => `<path d="M${x} 446 l${(j - 2.5)*2.4} -24" style="stroke:${k === 1 ? "#8AA46A" : "#5E8A4A"}" stroke-width="1.6"/>`).join("")}<path d="M${x - 4} 440 h8" style="stroke:#C9A26A" stroke-width="2"/>`).join("")
    + `<path d="M470 446 q-2 -12 8 -14 h8 q10 2 8 14z" style="fill:#C8BCA8"/><path d="M484 434 l10 -12" style="stroke:#9A8E7A" stroke-width="3"/>`
    + [416, 440, 464, 486].map((x, k) => `<path d="M${x - 8} 470 q-2 -12 2 -16 h12 q4 4 2 16z" style="fill:${["#E8DCC4", "#D8E8C8", "#F2D8D8", "#E8DCC4"][k]}"/><path d="M${x - 6} 456 h12" style="stroke:#A8683A" stroke-width="1"/>`).join(""));
  // the front: boxes of bath crystals and baskets of salt bags (left); barrels of coarse salt with scoops, a cat asleep (right)
  const frontL = g(crate(22, 568, 64, 28) + crate(90, 572, 58, 24, "#E8D8B4", "#B89A6A") + [0, 1, 2, 3, 4].map(k => saltJar(32 + k*11, 568, ["#D8C8F0", "#C8E8F0", "#F2B8C6", "#D8C8F0", "#C8E8F0"][k], "#FFFDF6", .8)).join("")
    + [0, 1, 2].map(k => palmBasket(102 + k*18, 572, .7, [P.blue, P.red, P.leaf][k])).join("") + [0, 1, 2].map(k => `<rect x="${96 + k*18}" y="${556}" width="12" height="8" rx="1" style="fill:${P.salt}"/>`).join(""));
  const barrel = (x, y) => sk(`<path d="M${x - 22} ${y} q-4 -22 2 -40 h40 q6 18 2 40z" style="fill:${P.wood}"/><path d="M${x - 22} ${y - 32} h44 M${x - 23} ${y - 8} h46" style="stroke:${P.iron}" stroke-width="2.4"/><ellipse cx="${x}" cy="${y - 40}" rx="20" ry="5" style="fill:${P.salt}"/><path d="M${x - 14} ${y - 42} q14 -10 28 0" style="fill:${P.salt}"/>`, `<path d="M${x - 22} ${y} q-4 -22 2 -40 h40 q6 18 2 40z"/>`);
  const frontR = g(barrel(392, 596) + barrel(442, 596) + `<path d="M398 554 l10 -14" style="stroke:${P.woodL}" stroke-width="3"/><path d="M404 558 q-4 -8 4 -10 l4 6z" style="fill:${P.woodL}"/>`
    + sk(`<rect x="470" y="560" width="32" height="36" rx="2" style="fill:${P.wood2}"/>`, `<rect x="470" y="560" width="32" height="36" rx="2"/>`)
    + `<ellipse cx="486" cy="556" rx="14" ry="6.4" style="fill:#F4F0E8"/><circle cx="476" cy="552" r="5" style="fill:#F4F0E8"/><path d="M473 548 l1 -4 l3 3 M477 547 l2 -4 l2 4" style="fill:#F4F0E8"/><ellipse cx="490" cy="554" rx="5" ry="3" style="fill:#3A3430"/><path d="M474 553 q2 1 4 0" fill="none" style="stroke:${P.ink}" stroke-width=".7"/><path d="M499 558 q6 0 4 -6" fill="none" style="stroke:#F4F0E8" stroke-width="3" stroke-linecap="round"/>`);
  return tiles(200, [P.stone, "#E8DCBE", "#DCCCA8", "#E4D6B6"], P.stone3, 64, 44) + skirt(200, "#C8D2D6") + wall + sacks + counter + photos + wagon + herbs + frontL + frontR + step(P.stone2) + exit(P.blue2);
}

/* ---------- Margalida's bakery ---------- */
// a blue-and-white tile (rajola), its little pattern
const tile = (x, y, sz = 12, k = 0) => `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" style="fill:#F8F8F4;stroke:#9AB4CC" stroke-width=".5"/>${k % 2 ? `<circle cx="${x + sz/2}" cy="${y + sz/2}" r="${sz*.28}" fill="none" style="stroke:${P.blue}" stroke-width="1.2"/><circle cx="${x + sz/2}" cy="${y + sz/2}" r="${sz*.08}" style="fill:${P.blue}"/>`
  : `<path d="M${x + sz/2} ${y + 1.4} l${sz*.38} ${sz*.38 - 1.4} l${-sz*.38} ${sz*.38 - 1.4} l${-sz*.38} ${-sz*.38 + 1.4}z" style="fill:${P.blue}"/><circle cx="${x + sz/2}" cy="${y + sz/2}" r="${sz*.12}" style="fill:#F8F8F4"/>`}`;
// the island's pastries: flaó (a cheese and mint tart, pale with a darker scalloped edge), ensaïmada (a sugared spiral),
// almond biscuits, fig bread (dark, studded with almonds), a round country loaf
const flao = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><ellipse rx="13" ry="4.4" style="fill:${P.pastry2}"/><ellipse cy="-1" rx="11" ry="3.4" style="fill:#F6E2B0"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<circle cx="${f1(Math.cos(k*.785)*12)}" cy="${f1(Math.sin(k*.785)*4 - .4)}" r="1.6" style="fill:${P.pastry2}"/>`).join("")}<path d="M-2 -2 l3 -1.4 l1 1.6z" style="fill:${P.leaf}"/></g>`;
const ensaimada = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><ellipse rx="13" ry="4.6" style="fill:${P.pastry}"/><path d="M0 -1 m-2 0 a2.4 1 0 1 1 4 0 a5 2 0 1 1 -8 0 a8 3 0 1 1 14 0 a11 3.8 0 1 1 -18 0" fill="none" style="stroke:${P.pastry2}" stroke-width="1.2"/>${[[-6, -2], [4, -3], [8, 0], [-9, 0], [0, 1]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r=".9" style="fill:${P.sugar}"/>`).join("")}</g>`;
const biscuits = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[[-8, 0], [0, 1], [8, 0], [-4, -3], [4, -3]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="4.4" ry="2" style="fill:#E8C88A"/><ellipse cx="${a}" cy="${b - .6}" rx="1.6" ry=".8" style="fill:${P.almond}"/>`).join("")}</g>`;
const figBread = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-12 0 q0 -9 12 -9 q12 0 12 9z" style="fill:${P.fig}"/><ellipse rx="12" ry="2.4" style="fill:#4A2840"/>${[[-6, -5], [0, -7], [6, -5], [-2, -3], [4, -2]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="1.8" ry="1" style="fill:#E8D0A8"/>`).join("")}</g>`;
const loaf = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-12 0 q0 -12 12 -12 q12 0 12 12z" style="fill:#C98A4A"/><path d="M-6 -8 l4 3 M0 -10 l4 3 M5 -8 l3 3" style="stroke:#E8C08A" stroke-width="1.4"/><path d="M-12 0 h24" style="stroke:#8E5A2A" stroke-width="1"/></g>`;
const figFruit = (x, y, r = 4) => `<path d="M${x} ${y - r*1.5} q${-r*1.1} ${r*.8} ${-r} ${r*1.6} q${r} ${r*.6} ${r*2} 0 q${r*.1} ${-r*.8} ${-r} ${-r*1.6}z" style="fill:${P.fig2}"/><path d="M${x} ${y - r*1.5} v-2" style="stroke:#6E8A3A" stroke-width="1"/>`;
// a round of fresh sheep's cheese on a cloth
const cheese = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-12 -8 h24 v8 h-24z" style="fill:#F6F0DC"/><ellipse cy="-8" rx="12" ry="3.4" style="fill:#FFFAEA"/><ellipse cy="0" rx="12" ry="3.4" style="fill:#EDE4C8"/>${[-8, -4, 0, 4, 8].map(d => `<path d="M${d} -7 v6" style="stroke:#E2D6B4" stroke-width=".6"/>`).join("")}</g>`;
// the street through the bakery window: whitewashed houses, a blue door, the fig tree (bare in winter), a glimpse of sea
const streetView = (x, y, w, h) => { const bare = figsBare();
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.sky}"/>${seaView(x, y + 18, w, 14, .2)}<rect x="${x}" y="${y + 32}" width="${w}" height="${h}" style="fill:#E8DCC0"/>`
    + `<rect x="${x + 4}" y="${y + 26}" width="${w*.45}" height="${h*.62}" style="fill:#FFFFFF"/><rect x="${x + 14}" y="${y + h*.5}" width="10" height="${h*.36}" style="fill:${P.blue}"/><rect x="${x + w*.6}" y="${y + 34}" width="${w*.4}" height="${h*.5}" style="fill:#F4F0E6"/><rect x="${x + w*.72}" y="${y + 44}" width="8" height="8" style="fill:${P.blue}"/>`
    // the fig tree, its spreading branches propped on forked wooden crutches
    + `<path d="M${x + w*.5} ${y + h} q-2 -14 0 -26 M${x + w*.5} ${y + h - 20} q-16 -6 -30 -2 M${x + w*.5} ${y + h - 22} q16 -6 32 -2" fill="none" style="stroke:#8A8478" stroke-width="3"/><path d="M${x + w*.5 - 26} ${y + h} v-20 M${x + w*.5 + 28} ${y + h} v-20" style="stroke:${P.sabina}" stroke-width="2"/>`
    + (bare ? "" : [[-.22, -.28], [0, -.4], [.22, -.3], [-.1, -.5], [.12, -.52]].map(([a, b]) => `<ellipse cx="${f1(x + w*(.5 + a))}" cy="${f1(y + h + h*b)}" rx="${f1(w*.16)}" ry="${f1(h*.12)}" style="fill:${MONTH >= 7 && MONTH <= 9 ? "#5E8A44" : "#7EA65A"}"/>`).join("")); };
function bakeryRoom(){
  const wall = limeWall(30, 200) + beams(32)
    // the sign over the counter, painted on a board
    + g(sk(`<rect x="184" y="40" width="152" height="26" rx="3" style="fill:${P.blue}"/><rect x="188" y="44" width="144" height="18" rx="2" fill="none" style="stroke:#FFFDF6" stroke-width="1"/>`, `<rect x="184" y="40" width="152" height="26" rx="3"/>`) + txt(260, 58, "FORN MARGALIDA", 11, "#FFFDF6", 700))
    // shelves of bread behind the counter: round country loaves, long ones in baskets, a row of tiles along the wall
    + g(Array.from({length: 13}, (_, k) => tile(182 + k*12, 72, 12, k)).join("")
      + sk(`${[120, 160, 194].map(y => `<rect x="180" y="${y}" width="160" height="5" style="fill:${P.wood}"/>`).join("")}<path d="M182 86 v112 M338 86 v112" style="stroke:${P.wood}" stroke-width="4"/>`, `<rect x="180" y="120" width="160" height="5"/><rect x="180" y="160" width="160" height="5"/>`)
      + [0, 1, 2, 3, 4, 5].map(k => loaf(198 + k*25, 120, .95)).join("")
      + [0, 1, 2].map(k => `<path d="M${196 + k*50} 160 l4 -14 h34 l4 14z" style="fill:#C9A26A"/>${[0, 1, 2].map(j => `<path d="M${204 + k*50 + j*8} 148 l4 -16" style="stroke:#D8A060" stroke-width="5" stroke-linecap="round"/>`).join("")}`).join("")
      + [0, 1, 2, 3, 4].map(k => `<rect x="${192 + k*30}" y="${178}" width="20" height="16" rx="2" style="fill:#E8F1F0" opacity=".9"/><rect x="${194 + k*30}" y="183" width="16" height="10" style="fill:${k % 2 ? "#E8A83A" : P.fig}"/>`).join(""))
    // strings of dried figs hanging beside the window, and a calendar from the cooperative
    + g(`<path d="M354 46 v74 M370 46 v62" style="stroke:#C9A26A" stroke-width="1.2"/>` + [0, 1, 2, 3, 4, 5].map(k => figFruit(354, 58 + k*11, 3.6)).join("") + [0, 1, 2, 3, 4].map(k => figFruit(370, 60 + k*11, 3.4)).join(""))
    + blueWindow(400, 54, 86, 90, streetView(400, 54, 86, 90))
    + g(sk(`<rect x="364" y="132" width="20" height="28" style="fill:#FFFDF6"/><rect x="364" y="132" width="20" height="6" style="fill:${P.red}"/>`, `<rect x="364" y="132" width="20" height="28"/>`) + `<circle cx="374" cy="149" r="5" style="fill:${P.fig2}"/>`)
    + lampGlow(140, 60, 30) + g(`<path d="M140 30 v20" style="stroke:${P.ink}" stroke-width="1"/><path d="M130 58 q10 -14 20 0z" style="fill:${P.blue}"/>`);
  // the wood oven at the back left: a whitewashed dome built into the corner, the arched mouth with the fire inside,
  // the long wooden peel leaning on it, the stack of almond and olive wood
  const oven = spot("fmoven", 90, 384, "The wood oven", hovE(90, 366, 60, 11),
    lampGlow(78, 296, 48) + sk(`<path d="M20 340 v-70 q0 -64 64 -66 q64 2 64 66 v70z" style="fill:${P.lime}"/><path d="M30 252 q14 -38 54 -40" fill="none" style="stroke:#FFFFFF" stroke-width="4" opacity=".7"/><path d="M60 214 v-30 h20 v28" style="fill:${P.lime2}"/><path d="M20 340 h128" style="stroke:${P.lime3}" stroke-width="3"/>
      <path d="M52 330 v-32 q0 -24 26 -24 q26 0 26 24 v32z" style="fill:#3A2620"/><rect x="44" y="326" width="68" height="10" rx="1" style="fill:${P.stone2}"/>`,
      `<path d="M20 340 v-70 q0 -64 64 -66 q64 2 64 66 v70z"/><path d="M52 330 v-32 q0 -24 26 -24 q26 0 26 24 v32z"/>`)
    + `<path d="M58 326 q4 -22 10 -12 q4 -18 10 -2 q6 -20 10 0 q6 -12 10 14z" style="fill:#F28A2A"/><path d="M66 326 q4 -12 8 -6 q4 -10 8 0 q4 -6 6 6z" style="fill:#FFD84A"/>`
    + loaf(90, 326, .6) + `<path d="M122 344 l18 -96" style="stroke:${P.woodL}" stroke-width="3.4"/><path d="M134 260 q8 -24 14 -2z" style="fill:${P.woodL}"/>`
    + `${[0, 1, 2, 3].map(k => `<circle cx="${150 + (k % 2)*0}" cy="${340 - k*8}" r="4" style="fill:#A8783E"/><circle cx="${150}" cy="${340 - k*8}" r="1.6" style="fill:#D8B07A"/>`).join("")}`
    + lab(90, 366, "Wood oven", "#F6E3B4", 9));
  // the counter: blue-and-white tiles down the front, a glass case of the day's pastries on top, the bell, a cake stand
  const counter = spot("fm_bakery", 262, 384, "The bakery counter", hovE(262, 366, 110, 14),
    sk(`<rect x="152" y="296" width="220" height="50" style="fill:#F8F8F4"/>`, `<rect x="152" y="296" width="220" height="50"/>`)
    + g(Array.from({length: 4}, (_, r) => Array.from({length: 18}, (_, c) => tile(154 + c*12, 298 + r*12, 12, r + c)).join("")).join(""))
    + sk(`<rect x="146" y="290" width="232" height="8" rx="2" style="fill:${P.woodL}"/><path d="M160 290 v-26 h204 v26" style="fill:#E8F4F6" opacity=".55"/><path d="M160 264 h204" style="stroke:${P.woodL}" stroke-width="2.4"/><path d="M160 290 v-26 M364 290 v-26 M262 290 v-26" style="stroke:${P.woodL}" stroke-width="2"/>`,
      `<rect x="146" y="290" width="232" height="8" rx="2"/><path d="M160 290 v-26 h204 v26"/>`)
    + flao(180, 286) + flao(196, 280, .8) + ensaimada(226, 286) + ensaimada(244, 280, .8) + biscuits(284, 286) + biscuits(298, 280, .9) + figBread(328, 288) + figBread(348, 286, .8)
    + `<path d="M370 290 v-14" style="stroke:${P.brass}" stroke-width="1.6"/><path d="M362 276 q8 -12 16 0z" style="fill:${P.brass}"/>`
    + `<ellipse cx="166" cy="262" rx="8" ry="2.4" style="fill:#FFFDF6"/><path d="M166 262 v-6" style="stroke:#C9C2B4" stroke-width="2"/>`
    + lab(262, 366, "Bakery counter", "#E8F0F8", 10));
  // the dresser at the back right: rounds of fresh sheep's cheese, jars of dried figs and honey, almonds
  const dresser = g(sk(`<rect x="396" y="236" width="104" height="110" rx="2" style="fill:${P.blue}"/><rect x="392" y="230" width="112" height="8" rx="2" style="fill:${P.blue2}"/><rect x="402" y="300" width="92" height="40" rx="2" style="fill:${P.blue2}"/><path d="M448 300 v40" style="stroke:${P.blue}" stroke-width="2"/><circle cx="442" cy="320" r="2" style="fill:${P.brass}"/><circle cx="454" cy="320" r="2" style="fill:${P.brass}"/>
      <rect x="400" y="268" width="96" height="5" style="fill:${P.blue2}"/><rect x="400" y="296" width="96" height="5" style="fill:${P.blue2}"/>`, `<rect x="396" y="236" width="104" height="110" rx="2"/>`)
    + `<rect x="400" y="240" width="96" height="28" style="fill:#E8F0F6"/><rect x="400" y="273" width="96" height="23" style="fill:#E8F0F6"/>`
    + cheese(414, 268, .9) + cheese(438, 268, .9) + cheese(426, 258, .8) + [460, 476, 490].map((x, k) => `<rect x="${x - 6}" y="250" width="12" height="18" rx="2" style="fill:#E8F1F0" opacity=".9"/><rect x="${x - 5}" y="254" width="10" height="13" style="fill:${k === 1 ? "#E8A83A" : P.fig}"/><rect x="${x - 6.4}" y="247" width="12.8" height="4" rx="1" style="fill:${P.red}"/>`).join("")
    + [0, 1, 2, 3, 4, 5].map(k => figFruit(410 + k*14, 294, 3.6)).join("") + sk(`<rect x="408" y="324" width="34" height="10" rx="1" style="fill:${P.cream}"/>`, ``) + txt(425, 332, "FORMATGE", 5.6, P.blue2, 700)
    + sk(`<rect x="454" y="324" width="34" height="10" rx="1" style="fill:${P.cream}"/>`, ``) + txt(471, 332, "FIGUES", 5.6, P.fig, 700));
  // a café table on the left: coffee and an ensaïmada, two rush chairs, a jug of almond blossom (or wild rosemary)
  const table = g(chair(36, 494, P.blue, "#D9B866") + chair(156, 494, P.blue, "#D9B866")
    + sk(`<ellipse cx="96" cy="452" rx="46" ry="11" style="fill:#FFFDF6"/><path d="M52 452 q44 8 88 0" fill="none" style="stroke:${P.blue}" stroke-width="2"/><path d="M96 462 v30 M80 492 h32" style="stroke:${P.iron}" stroke-width="3.4"/>`, `<ellipse cx="96" cy="452" rx="46" ry="11"/>`)
    + `<rect x="68" y="440" width="12" height="10" rx="2" style="fill:#FFFDF6;stroke:${P.blue}" stroke-width=".8"/><ellipse cx="74" cy="440" rx="5" ry="1.4" style="fill:#6A3E24"/><ellipse cx="74" cy="451" rx="9" ry="2.4" style="fill:#FFFDF6;stroke:#C9C2B4" stroke-width=".6"/>`
    + ensaimada(100, 452, .7) + `<rect x="118" y="436" width="9" height="14" rx="2" style="fill:${P.terra}"/>${[[118, 428], [124, 424], [128, 430], [114, 432]].map(([a, b]) => `<path d="M122 436 L${a} ${b + 3}" style="stroke:#6E5A44" stroke-width=".8"/><circle cx="${a}" cy="${b}" r="2.4" style="fill:${MONTH <= 2 ? "#FBE8EE" : "#B8A8D8"}"/>`).join("")}`);
  // flour sacks and a basket of almonds on the right
  const flour = g(saltSack(420, 494, 1.1, false) + saltSack(456, 492, 1.15, false) + `<text x="420" y="484" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7" fill="${P.blue2}">FARINA</text><text x="456" y="482" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7" fill="${P.blue2}">FARINA</text>`
    + `<path d="M476 494 l4 -22 h22 l4 22z" style="fill:#C9A26A"/>${Array.from({length: 9}, (_, k) => `<ellipse cx="${484 + (k % 4)*5}" cy="${474 - Math.floor(k/4)*3}" rx="3.2" ry="1.8" style="fill:#D8B07A;stroke:#9A7240" stroke-width=".5"/>`).join("")}`);
  // the front: geraniums and a crate of lemons (left); a bench of bread baskets and the bakery cat (right)
  const frontL = g(geranium(36, 596) + geranium(66, 598) + crate(88, 568, 58, 28) + Array.from({length: 7}, (_, k) => `<ellipse cx="${96 + (k % 4)*13}" cy="${566 - Math.floor(k/4)*6}" rx="6" ry="4.6" style="fill:#F6D84A"/>`).join(""));
  const frontR = g(sk(`<rect x="368" y="566" width="132" height="8" rx="2" style="fill:${P.woodL}"/><path d="M376 574 v22 M492 574 v22" style="stroke:${P.wood2}" stroke-width="4"/>`, `<rect x="368" y="566" width="132" height="8" rx="2"/>`)
    + [392, 428].map(x => `<path d="M${x - 16} 566 l3 -14 h26 l3 14z" style="fill:#C9A26A"/>${[0, 1].map(j => loaf(x - 6 + j*12, 554, .6)).join("")}`).join("")
    + `<ellipse cx="474" cy="560" rx="14" ry="6.4" style="fill:#3A3430"/><circle cx="464" cy="556" r="5" style="fill:#3A3430"/><path d="M461 552 l1 -4 l3 3 M465 551 l2 -4 l2 4" style="fill:#3A3430"/><path d="M462 556 q2 1 4 0" fill="none" style="stroke:#F6E3B4" stroke-width=".7"/><path d="M466 562 h6" style="stroke:#FFFDF6" stroke-width="2"/><path d="M487 562 q6 0 4 -6" fill="none" style="stroke:#3A3430" stroke-width="3" stroke-linecap="round"/>`);
  return tiles(200, [P.terra, P.terra2, P.terra3, "#D4825A"], "#A8603A", 48, 40, false) + skirt(200) + wall + oven + counter + dresser + table + flour + frontL + frontR + step(P.terra2) + exit(P.blue);
}

/* ---------- inside La Mola lighthouse ---------- */
// the open sea from the cliff top: no land, just the long horizon, a ferry far out, deep blue to turquoise below
const cliffSea = (x, y, w, h) => seaView(x, y, w, h, .42, sail(x + w*.3, y + h*.46, .8) + `<path d="M${x + w*.68} ${y + h*.48} h14 l-2 3 h-10z" style="fill:#FFFFFF"/><rect x="${x + w*.68 + 3}" y="${y + h*.48 - 3}" width="7" height="3" style="fill:#FFFFFF"/>`
  + `<path d="M${x} ${y + h} v-10 q${w*.2} -6 ${w*.35} 0 q${w*.15} 4 ${w*.2} 10z" style="fill:#B85A3A"/>`);
function lightRoom(){
  // the round tower: whitewash, the curve shown by shading towards the sides, a vaulted ceiling with the hole the stair goes up through
  const wall = g(`<rect y="30" width="520" height="170" style="fill:${P.lime}"/><rect y="30" width="70" height="170" style="fill:${P.lime2}" opacity=".7"/><rect x="450" y="30" width="70" height="170" style="fill:${P.lime2}" opacity=".7"/><rect y="30" width="26" height="170" style="fill:${P.lime3}" opacity=".6"/><rect x="494" y="30" width="26" height="170" style="fill:${P.lime3}" opacity=".6"/>`)
    + g(`<rect width="520" height="34" style="fill:#EDE8DC"/><path d="M0 34 q260 -26 520 0" fill="none" style="stroke:${P.lime3}" stroke-width="2"/><ellipse cx="80" cy="12" rx="56" ry="12" style="fill:#5A5048"/><ellipse cx="80" cy="10" rx="50" ry="8" style="fill:#3A3430"/>`)
    // the big window over the sea, set deep in the thick wall
    + g(sk(`<path d="M200 182 v-104 q60 -40 120 0 v104z" style="fill:${P.lime3}"/>`, `<path d="M200 182 v-104 q60 -40 120 0 v104z"/>`) + clip(210, 52, 100, 124, cliffSea(210, 52, 100, 124))
      + sk(`<path d="M210 176 v-94 q50 -34 100 0 v94" fill="none" style="stroke:${P.blue2}" stroke-width="3"/><path d="M260 58 v118 M210 120 h100" style="stroke:${P.blue2}" stroke-width="2.4"/><rect x="196" y="178" width="128" height="7" rx="1" style="fill:${P.lime2}"/>`, `<path d="M210 176 v-94 q50 -34 100 0 v94"/>`))
    // the plaque to Jules Verne, who sent his heroes across this very cape in Hector Servadac
    + g(sk(`<rect x="398" y="54" width="92" height="74" rx="3" style="fill:#E8E4DC"/><rect x="402" y="58" width="84" height="66" rx="2" fill="none" style="stroke:#B8B0A0" stroke-width="1.4"/>`, `<rect x="398" y="54" width="92" height="74" rx="3"/>`)
      + `<circle cx="444" cy="80" r="13" style="fill:#C8BFAE"/><path d="M438 86 q6 8 12 0 q-2 6 -6 8 q-4 -2 -6 -8z" style="fill:#9A9080"/><path d="M436 76 q8 -10 16 0" fill="none" style="stroke:#9A9080" stroke-width="2"/>`
      + txt(444, 106, "JULES VERNE", 8, P.ink, 700) + txt(444, 117, "1828 to 1905", 6.4, "#5A5048"))
    // a barometer and the old brass clock on the left wall by the stair
    + g(sk(`<circle cx="176" cy="74" r="12" style="fill:${P.brass}"/><circle cx="176" cy="74" r="9" style="fill:#FFFDF6"/><path d="M176 74 l4 -6" style="stroke:${P.ink}" stroke-width="1.2"/><rect x="170" y="88" width="12" height="40" rx="5" style="fill:${P.wood}"/><rect x="174" y="94" width="4" height="28" style="fill:#FFFDF6"/><path d="M176 122 v-14" style="stroke:${P.red}" stroke-width="2"/>`, `<circle cx="176" cy="74" r="12"/><rect x="170" y="88" width="12" height="40" rx="5"/>`))
    + lampGlow(360, 70, 30) + g(sk(`<path d="M352 60 h16 l-2 -8 h-12z" style="fill:${P.iron}"/><rect x="354" y="60" width="12" height="16" rx="2" style="fill:#FFE28A" opacity=".9"/><path d="M360 50 v-18" style="stroke:${P.iron}" stroke-width="1.4"/>`, `<rect x="354" y="60" width="12" height="16" rx="2"/>`));
  // the stone spiral stair, its wedge steps winding round a central column up through the ceiling, an iron rail
  let st = "";
  for (let k = 0; k < 11; k++) { const y = 340 - k*29, side = k % 2 ? 1 : -1, x0 = 80, w = 52 - (k % 2)*6;
    st += `<path d="M${x0} ${y + 4} l${side*w} -6 v8 l${-side*w} 6z" style="fill:${P.stone3}"/><path d="M${x0} ${y} l${side*w} ${-6} v6 l${-side*w} 6z" style="fill:${k % 2 ? P.stone : P.stone2}"/><path d="M${x0} ${y} l${side*w} -6" style="stroke:${P.stone3}" stroke-width="1"/>`; }
  const stair = g(`<path d="M18 352 V40 q62 -22 124 0 V352z" style="fill:${P.lime3}"/><path d="M18 352 V40 q62 -22 124 0" fill="none" style="stroke:#C8BEA8" stroke-width="2"/>`) + g(sk(`<rect x="72" y="0" width="16" height="352" style="fill:${P.lime2}"/>${st}<path d="M${Array.from({length: 11}, (_, k) => `${k ? "L" : ""}${80 + (k % 2 ? 1 : -1)*(52 - (k % 2)*6)} ${340 - k*29 - 30}`).join(" ")}" fill="none" style="stroke:${P.iron}" stroke-width="1.8"/>${Array.from({length: 11}, (_, k) => `<path d="M${80 + (k % 2 ? 1 : -1)*(52 - (k % 2)*6)} ${340 - k*29 - 6} v-24" style="stroke:${P.iron}" stroke-width="1.4"/>`).join("")}`,
    `<rect x="72" y="0" width="16" height="352"/>`) + sk(`<rect x="26" y="340" width="110" height="12" rx="2" style="fill:${P.stone2}"/>`, `<rect x="26" y="340" width="110" height="12" rx="2"/>`));
  // the stamp book on its little lectern, the rubber stamp and the ink pad
  const stamp = spot("fmstamp", 208, 384, "The stamp book: stamp the lighthouse", hovE(208, 366, 46, 11),
    sk(`<path d="M196 346 v-44 M220 346 v-44 M188 346 h40" style="stroke:${P.wood2}" stroke-width="4"/><path d="M178 304 l60 0 l-6 -24 h-48z" style="fill:${P.wood}"/>`, `<path d="M178 304 l60 0 l-6 -24 h-48z"/>`)
    + `<path d="M186 300 l22 -2 l-2 -18 l-18 2z" style="fill:#FFFDF6"/><path d="M208 298 l22 2 l-4 -18 l-18 -2z" style="fill:#F6EFE0"/><circle cx="197" cy="290" r="5" fill="none" style="stroke:${P.red}" stroke-width="1.4"/><path d="M197 286 v8 M195 288 h4" style="stroke:${P.red}" stroke-width="1"/>`
    + `<rect x="232" y="268" width="12" height="7" rx="1" style="fill:${P.blue2}"/><rect x="235" y="258" width="6" height="10" rx="2" style="fill:${P.wood}"/>`
    + lab(208, 366, "Stamp book", "#F6E3B4", 9));
  // the postcard counter: Pep sells the keeper's postcards; a rack of them, a model lighthouse, a little lighthouse lamp
  const postcard = (x, y, k) => `<rect x="${x}" y="${y}" width="14" height="10" style="fill:#FFFDF6;stroke:#C9C2B4" stroke-width=".5"/><rect x="${x + 1.4}" y="${y + 1.4}" width="11.2" height="7.2" style="fill:${[P.sea, P.sky, "#E8C88A", P.seaD][k % 4]}"/>${k % 2 ? `<rect x="${x + 6}" y="${y + 2}" width="2" height="6" style="fill:#FFFFFF"/>` : `<path d="M${x + 2} ${y + 7} h10" style="stroke:#FFFFFF" stroke-width="1"/>`}`;
  const counter = spot("fm_light", 350, 384, "The keeper's postcards", hovE(350, 366, 84, 13),
    sk(`<rect x="276" y="298" width="148" height="46" style="fill:${P.wood}"/>${[0, 1, 2].map(k => `<rect x="${284 + k*46}" y="304" width="40" height="34" rx="2" style="fill:${P.wood2}"/>`).join("")}<rect x="270" y="290" width="160" height="9" rx="2" style="fill:${P.woodL}"/>`,
      `<rect x="276" y="298" width="148" height="46"/><rect x="270" y="290" width="160" height="9" rx="2"/>`)
    + `<path d="M288 290 l4 -26 h40 l4 26" style="fill:#E8DCC4"/>` + [0, 1, 2, 3, 4, 5].map(k => postcard(292 + (k % 2)*18, 268 + Math.floor(k/2)*7.4, k)).join("")
    // a little model of La Mola lighthouse: the square tower on its keeper's house
    + `<rect x="352" y="276" width="26" height="14" style="fill:#FFFDF6"/><rect x="360" y="252" width="10" height="24" style="fill:#F4F0E6"/><rect x="358" y="246" width="14" height="6" style="fill:${P.iron}"/><rect x="361" y="248" width="8" height="3" style="fill:#FFE28A"/><path d="M356 246 l9 -6 l9 6" style="fill:${P.iron}"/>`
    + `<rect x="390" y="280" width="20" height="10" rx="1" style="fill:#FFFDF6;stroke:${P.blue}" stroke-width=".8"/>` + txt(400, 288, "€1", 7, P.blue, 700)
    + lab(350, 366, "Postcards", "#CFE6EE", 10));
  // a little bookcase under the plaque: Verne's books, a globe
  const verne = spot("fmverne", 466, 384, "The plaque to Jules Verne", hovE(466, 366, 42, 11),
    sk(`<rect x="440" y="246" width="62" height="100" rx="2" style="fill:${P.wood2}"/><rect x="444" y="250" width="54" height="92" style="fill:#4A3828"/><rect x="444" y="282" width="54" height="4" style="fill:${P.wood}"/><rect x="444" y="314" width="54" height="4" style="fill:${P.wood}"/>`, `<rect x="440" y="246" width="62" height="100" rx="2"/>`)
    + [282, 314, 342].map((y, r) => Array.from({length: 7}, (_, k) => `<rect x="${446 + k*7.4}" y="${y - 22 + (k % 3)*2}" width="6.4" height="${22 - (k % 3)*2}" style="fill:${["#8E3A30", "#2E4E6E", "#C9A24A", "#3E6A44", "#7E5A9A"][(k + r) % 5]}"/>`).join("")).join("")
    + `<circle cx="471" cy="236" r="10" style="fill:#7EB6D0"/><path d="M465 230 q4 4 2 8 q4 2 6 -2 M474 240 q2 -4 4 -2" fill="none" style="stroke:#8AA46A" stroke-width="2"/><path d="M471 246 v-2 M464 248 h14" style="stroke:${P.brass}" stroke-width="2"/>`
    + lab(466, 366, "Jules Verne", "#E8E4DC", 9));
  // the keeper's desk: the logbook open, a pen in an inkwell, the oil lamp, a brass telescope, the chair
  const logbook = spot("fmlogbook", 94, 520, "The keeper's logbook", hovE(94, 506, 54, 11),
    lampGlow(140, 436, 26) + chair(154, 496, P.wood, "#C9483A")
    + sk(`<rect x="26" y="448" width="124" height="10" rx="2" style="fill:${P.woodL}"/><rect x="30" y="458" width="40" height="34" style="fill:${P.wood}"/><path d="M34 468 h32 M34 480 h32" style="stroke:${P.wood2}" stroke-width="1.4"/><path d="M144 458 v34" style="stroke:${P.wood2}" stroke-width="5"/>`, `<rect x="26" y="448" width="124" height="10" rx="2"/><rect x="30" y="458" width="40" height="34"/>`)
    + `<path d="M66 448 l22 -3 v-8 l-22 3z" style="fill:#FFFDF6"/><path d="M88 445 l22 3 v-8 l-22 -3z" style="fill:#F6EFE0"/><path d="M70 442 h14 M70 445 h12 M92 443 h14 M92 446 h12" style="stroke:#8A8478" stroke-width=".6"/><path d="M66 448 l22 -3 l22 3" fill="none" style="stroke:#8E3A30" stroke-width="1.4"/>`
    + `<rect x="44" y="440" width="8" height="8" rx="2" style="fill:#2A2420"/><path d="M50 440 l8 -10" style="stroke:#F4F0E6" stroke-width="1"/>`
    + `<path d="M132 448 h16 l-3 -4 h-10z" style="fill:${P.brass}"/><path d="M134 444 q-2 -10 6 -14 q8 4 6 14z" style="fill:#F6E8C4" opacity=".85"/><ellipse cx="140" cy="438" rx="2" ry="3.4" style="fill:#FFD84A"/>`
    + `<path d="M118 446 l-14 -10" style="stroke:${P.brass}" stroke-width="3.4" stroke-linecap="round"/>`
    + lab(94, 506, "Logbook", "#F6E3B4", 9));
  // an old lighthouse lens on its stand: the glass rings of a Fresnel lens catching the light
  const lens = g(lampGlow(450, 440, 40) + sk(`<path d="M420 496 h60 l-6 -12 h-48z" style="fill:${P.iron}"/><path d="M432 484 l4 -10 h28 l4 10z" style="fill:${P.iron2}"/>
      <path d="M422 474 q-8 -34 6 -60 h44 q14 26 6 60z" style="fill:#D8EEF2" opacity=".85"/><path d="M428 414 h44 l-4 -8 h-36z" style="fill:${P.brass}"/><path d="M422 474 h56" style="stroke:${P.brass}" stroke-width="3"/>`,
      `<path d="M422 474 q-8 -34 6 -60 h44 q14 26 6 60z"/>`)
    + [0, 1, 2, 3, 4].map(k => `<path d="M${424 + k*1.4} ${424 + k*10} h${52 - k*2.8}" style="stroke:#9ACCD8" stroke-width="1.6"/>`).join("") + `<ellipse cx="450" cy="444" rx="9" ry="12" style="fill:#FFF0B0" opacity=".9"/><path d="M432 422 q-4 20 0 40" fill="none" style="stroke:#FFFFFF" stroke-width="2" opacity=".8"/>`
    + sk(`<rect x="430" y="500" width="40" height="0" />`, ``));
  // the front: coils of rope, the old paraffin cans and a spare lamp (left); a bench with binoculars and a potted pine (right)
  const frontL = g(sk(`<ellipse cx="44" cy="586" rx="22" ry="8" style="fill:#C9A26A"/><ellipse cx="44" cy="580" rx="20" ry="7" style="fill:#D8B47A"/><ellipse cx="44" cy="574" rx="16" ry="5.4" style="fill:#C9A26A"/><ellipse cx="44" cy="574" rx="6" ry="2" style="fill:#8E6A34"/>`, `<ellipse cx="44" cy="586" rx="22" ry="8"/>`)
    + sk([80, 104].map(x => `<rect x="${x - 10}" y="560" width="20" height="34" rx="2" style="fill:${P.red}"/><rect x="${x - 3}" y="554" width="6" height="7" style="fill:${P.iron}"/><path d="M${x - 10} 568 h20" style="stroke:#8E2A22" stroke-width="1.4"/>`).join(""), `<rect x="70" y="560" width="20" height="34" rx="2"/><rect x="94" y="560" width="20" height="34" rx="2"/>`)
    + lampGlow(136, 572, 18) + sk(`<path d="M128 594 h16 l-3 -6 h-10z" style="fill:${P.brass}"/><path d="M130 588 q-2 -16 6 -20 q8 4 6 20z" style="fill:#F6E8C4" opacity=".85"/><path d="M130 568 h12 l-6 -6z" style="fill:${P.iron}"/>`, `<path d="M130 588 q-2 -16 6 -20 q8 4 6 20z"/>`));
  const frontR = g(sk(`<rect x="370" y="566" width="92" height="8" rx="2" style="fill:${P.woodL}"/><path d="M378 574 v22 M454 574 v22" style="stroke:${P.wood2}" stroke-width="4"/>`, `<rect x="370" y="566" width="92" height="8" rx="2"/>`)
    + `<path d="M392 560 h14 v6 h-14z M410 560 h14 v6 h-14z" style="fill:${P.iron}"/><path d="M404 562 h8" style="stroke:${P.iron2}" stroke-width="2"/>` + strawHat(438, 562, .7, P.blue)
    + `<path d="M488 596 l-4 -20 h28 l-4 20z" style="fill:${P.terra}"/>${[[-10, -34, 12], [6, -42, 14], [12, -30, 10], [-2, -50, 10]].map(([dx, dy, r]) => `<ellipse cx="${496 + dx}" cy="${596 + dy}" rx="${r}" ry="${r*.5}" style="fill:#3E6A44"/>`).join("")}<path d="M496 576 q-2 -14 4 -24" fill="none" style="stroke:#6B4A34" stroke-width="3"/>`);
  // a compass rose laid into the stone floor, flat underfoot
  const rose = g(`<circle cx="262" cy="470" r="44" fill="none" style="stroke:#B8A47C" stroke-width="1.4" opacity=".7"/><circle cx="262" cy="470" r="36" fill="none" style="stroke:#B8A47C" stroke-width=".8" opacity=".6"/>`
    + `<path d="M262 430 l7 40 l-7 40 l-7 -40z M222 470 l40 -7 l40 7 l-40 7z" style="fill:#D8C49C" opacity=".75"/><path d="M262 430 l7 40 h-14z" style="fill:${P.blue}" opacity=".45"/>` + txt(262, 424, "N", 8, "#9A8462", 700));
  return tiles(200, ["#E8E2D4", "#DED6C4", "#E4DCCC", "#D8D0BE"], "#B8AE98", 60, 44) + rose + g(`<rect y="186" width="520" height="23" style="fill:${P.lime2}"/><path d="M0 209 H520" style="stroke:#9A8E7A" stroke-width="1.4"/>`) + wall + stair + stamp + counter + verne + logbook + lens + frontL + frontR + step("#C8BEA8") + exit(P.blue2);
}

/* ---------- Joan's bike hire ---------- */
// a sit-up bike side on, step-through frame, a basket on the front (the island's favourite way round)
const bike = (x, y, col = P.blue, s = 1, basket = true) => { const r = 15*s, a = x - 22*s, b = x + 22*s, wy = y - r;
  return `<circle cx="${f1(a)}" cy="${f1(wy)}" r="${f1(r)}" fill="none" style="stroke:#2F2B28" stroke-width="${f1(2.4*s)}"/><circle cx="${f1(b)}" cy="${f1(wy)}" r="${f1(r)}" fill="none" style="stroke:#2F2B28" stroke-width="${f1(2.4*s)}"/>`
    + [0, 60, 120].map(d => `<path d="M${f1(a + Math.cos(d*Math.PI/180)*r)} ${f1(wy + Math.sin(d*Math.PI/180)*r)} L${f1(a - Math.cos(d*Math.PI/180)*r)} ${f1(wy - Math.sin(d*Math.PI/180)*r)} M${f1(b + Math.cos(d*Math.PI/180)*r)} ${f1(wy + Math.sin(d*Math.PI/180)*r)} L${f1(b - Math.cos(d*Math.PI/180)*r)} ${f1(wy - Math.sin(d*Math.PI/180)*r)}" style="stroke:#9A9690" stroke-width=".6"/>`).join("")
    + `<path d="M${f1(a)} ${f1(wy)} L${f1(x - 4*s)} ${f1(wy)} L${f1(x - 10*s)} ${f1(wy - 18*s)} M${f1(x - 4*s)} ${f1(wy)} Q${f1(x + 6*s)} ${f1(wy - 4*s)} ${f1(b - 6*s)} ${f1(wy - 24*s)} L${f1(b)} ${f1(wy)} M${f1(a)} ${f1(wy)} L${f1(x - 10*s)} ${f1(wy - 18*s)}" fill="none" style="stroke:${col}" stroke-width="${f1(3.4*s)}" stroke-linecap="round"/>`
    + `<path d="M${f1(x - 16*s)} ${f1(wy - 20*s)} h${f1(12*s)}" style="stroke:#3A3430" stroke-width="${f1(4*s)}" stroke-linecap="round"/><path d="M${f1(b - 6*s)} ${f1(wy - 24*s)} l${f1(-4*s)} ${f1(-6*s)} h${f1(8*s)}" fill="none" style="stroke:#3A3430" stroke-width="${f1(2*s)}"/>`
    + `<path d="M${f1(a - r)} ${f1(wy - 4*s)} q${f1(r)} ${f1(-10*s)} ${f1(2*r)} 0" fill="none" style="stroke:${col}" stroke-width="${f1(1.6*s)}"/>`
    + (basket ? `<path d="M${f1(b - 2*s)} ${f1(wy - 30*s)} h${f1(16*s)} l${f1(-2*s)} ${f1(12*s)} h${f1(-12*s)}z" style="fill:#D8B470"/><path d="M${f1(b - 1*s)} ${f1(wy - 25*s)} h${f1(14*s)}" style="stroke:#B48E4C" stroke-width="${f1(.8*s)}"/>` : ""); };
const helmet = (x, y, col, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-10 0 q0 -12 10 -12 q10 0 10 12z" style="fill:${col}"/><path d="M-6 -9 l2 6 M0 -11 v7 M6 -9 l-2 6" style="stroke:#2F2B28" stroke-width="1.2" opacity=".5"/><path d="M-10 0 h20" style="stroke:#2F2B28" stroke-width="1.4"/></g>`;
// the shop door open onto the Green Route: a sandy track between dry-stone walls, pines and juniper, the sea beyond
const trackView = (x, y, w, h) => seaView(x, y, w, h*.4, .5) + `<rect x="${x}" y="${y + h*.4}" width="${w}" height="${h*.6}" style="fill:#C8B884"/><path d="M${x + w*.4} ${y + h} L${x + w*.48} ${y + h*.4} h${w*.06} L${x + w*.7} ${y + h}z" style="fill:#EADBB0"/>`
  + `<path d="M${x} ${y + h*.62} h${w*.4} M${x + w*.62} ${y + h*.62} h${w*.4}" style="stroke:#A89A80" stroke-width="5" stroke-dasharray="6 2"/>`
  + [[.12, .46, 14], [.28, .42, 11], [.82, .44, 15], [.95, .5, 10]].map(([a, b, r]) => `<path d="M${f1(x + a*w)} ${f1(y + b*h + r)} v${r*.8}" style="stroke:#6B4A34" stroke-width="2"/><ellipse cx="${f1(x + a*w)}" cy="${f1(y + b*h)}" rx="${r}" ry="${f1(r*.55)}" style="fill:#3E6A44"/><ellipse cx="${f1(x + a*w - 2)}" cy="${f1(y + b*h - 2)}" rx="${f1(r*.6)}" ry="${f1(r*.3)}" style="fill:#5E8A54"/>`).join("");
// the Green Routes map: the island's shape, La Savina and the Illetes spit at the top, the salt ponds, Sant Francesc,
// Cap de Barbaria to the south west, the long isthmus and La Mola's plateau to the east, the green routes dotted across it
const routeMap = (x, y, w, h) => { const X = t => f1(x + t*w), Y = t => f1(y + t*h);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#BFE6EC"/>`
    + `<path d="M${X(.22)} ${Y(.12)} l${f1(w*.03)} ${f1(h*.18)} q${f1(w*.04)} ${f1(h*.06)} ${f1(w*.1)} ${f1(h*.06)} q${f1(w*.04)} ${f1(h*.06)} ${f1(w*.12)} ${f1(h*.08)} q${f1(w*.14)} ${f1(h*.04)} ${f1(w*.22)} ${f1(h*.02)} q${f1(w*.1)} ${f1(-h*.04)} ${f1(w*.2)} ${f1(h*.04)} q${f1(w*.06)} ${f1(h*.1)} 0 ${f1(h*.2)} q${f1(-w*.1)} ${f1(h*.06)} ${f1(-w*.2)} 0 q${f1(-w*.1)} ${f1(-h*.04)} ${f1(-w*.2)} ${f1(h*.02)} q${f1(-w*.06)} ${f1(h*.04)} ${f1(-w*.06)} ${f1(h*.18)} q${f1(-w*.08)} ${f1(h*.04)} ${f1(-w*.12)} ${f1(-h*.08)} q${f1(-w*.04)} ${f1(-h*.12)} ${f1(-w*.08)} ${f1(-h*.2)} q${f1(-w*.04)} ${f1(-h*.1)} ${f1(-w*.02)} ${f1(-h*.22)} l${f1(-w*.02)} ${f1(-h*.22)}z" style="fill:#F0E2B8;stroke:#B8A47C" stroke-width="1"/>`
    + `<ellipse cx="${X(.3)}" cy="${Y(.4)}" rx="${f1(w*.05)}" ry="${f1(h*.04)}" style="fill:#F2C8C0"/><ellipse cx="${X(.38)}" cy="${Y(.36)}" rx="${f1(w*.04)}" ry="${f1(h*.03)}" style="fill:#9FD8E0"/>`
    + `<path d="M${X(.28)} ${Y(.28)} Q${X(.36)} ${Y(.5)} ${X(.4)} ${Y(.5)} T${X(.62)} ${Y(.54)} T${X(.84)} ${Y(.58)} M${X(.4)} ${Y(.5)} Q${X(.36)} ${Y(.66)} ${X(.3)} ${Y(.8)}" fill="none" style="stroke:#3E8A44" stroke-width="2" stroke-dasharray="3 2"/>`
    + [[.28, .28, P.blue], [.4, .5, P.red], [.3, .8, "#F2A03A"], [.86, .58, "#F2A03A"]].map(([a, b, c]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="3" style="fill:${c};stroke:#FFFDF6" stroke-width="1"/>`).join(""); };
function bikeRoom(){
  const wall = limeWall(30, 200) + beams(32)
    // the sign: LLOGUER DE BICIS (bike hire), helmets on pegs, the board of numbered keys
    + g(sk(`<rect x="184" y="40" width="152" height="26" rx="3" style="fill:#3E8A44"/><rect x="188" y="44" width="144" height="18" rx="2" fill="none" style="stroke:#FFFDF6" stroke-width="1"/>`, `<rect x="184" y="40" width="152" height="26" rx="3"/>`) + txt(260, 58, "LLOGUER DE BICIS", 10.4, "#FFFDF6", 700)
      + `<path d="M190 96 h140" style="stroke:${P.wood}" stroke-width="4"/>` + [204, 232, 260, 288, 316].map((x, k) => `<path d="M${x} 96 v6" style="stroke:${P.iron}" stroke-width="2"/>${helmet(x, 116, ["#E8574A", P.blue, "#F2C84A", "#3E9FB0", "#8ABE5A"][k])}`).join("")
      + sk(`<rect x="208" y="130" width="104" height="48" rx="2" style="fill:${P.wood}"/>`, `<rect x="208" y="130" width="104" height="48" rx="2"/>`)
      + Array.from({length: 12}, (_, k) => `<circle cx="${218 + (k % 6)*17}" cy="${142 + Math.floor(k/6)*20}" r="1.6" style="fill:${P.brass}"/><path d="M${218 + (k % 6)*17} 144 v5" style="stroke:#C9C2B4" stroke-width="1" transform="translate(0 ${Math.floor(k/6)*20})"/><rect x="${214 + (k % 6)*17}" y="${150 + Math.floor(k/6)*20}" width="8" height="6" rx="1" style="fill:${k % 3 ? "#F6E3B4" : "#CFEDEA"}"/>`).join(""))
    // the open door onto the pine track and the sea (left)
    + g(sk(`<rect x="34" y="50" width="104" height="150" style="fill:${P.lime3}"/>`, `<rect x="34" y="50" width="104" height="150"/>`) + clip(42, 58, 88, 142, trackView(42, 58, 88, 142))
      + sk(`<rect x="22" y="50" width="12" height="150" style="fill:#3E8A44"/><rect x="138" y="50" width="12" height="150" style="fill:#3E8A44"/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M24 ${64 + k*22} h8 M140 ${64 + k*22} h8" style="stroke:#2E6A34" stroke-width="1.6"/>`).join("")}`, `<rect x="22" y="50" width="12" height="150"/><rect x="138" y="50" width="12" height="150"/>`))
    // a blue-shuttered window over the right, the sea through it, a tyre and pump hanging beside it
    + blueWindow(400, 58, 80, 70, seaView(400, 58, 80, 70, .35, sail(440, 82, .8)))
    + g(`<circle cx="356" cy="76" r="16" fill="none" style="stroke:#2F2B28" stroke-width="4"/><path d="M356 58 v-6" style="stroke:${P.iron}" stroke-width="2"/><rect x="350" y="102" width="8" height="40" rx="2" style="fill:#E8574A"/><path d="M346 102 h16" style="stroke:${P.iron}" stroke-width="3"/>`)
    + lampGlow(100, 40, 22);
  // the hire desk: helmets, a bell, a basket, the receipt book, a dish of sweets for little riders
  const counter = spot("fm_bikes", 262, 384, "The hire desk: hire bikes and ride the Green Route", hovE(262, 366, 110, 14),
    sk(`<rect x="152" y="298" width="220" height="48" style="fill:${P.wood}"/>${[0, 1, 2, 3].map(k => `<rect x="${160 + k*53}" y="304" width="46" height="36" rx="2" style="fill:${P.wood2}"/>`).join("")}<rect x="146" y="290" width="232" height="9" rx="2" style="fill:${P.woodL}"/>`,
      `<rect x="152" y="298" width="220" height="48"/><rect x="146" y="290" width="232" height="9" rx="2"/>`)
    + helmet(178, 290, "#E8574A") + helmet(200, 290, P.blue, .9) + helmet(190, 280, "#F2C84A", .8)
    + `<circle cx="232" cy="284" r="5" style="fill:#C8CCD0"/><path d="M228 288 h8" style="stroke:${P.iron}" stroke-width="2"/>`
    + `<rect x="246" y="280" width="26" height="9" style="fill:#FFFDF6;stroke:#C9C2B4" stroke-width=".6"/><path d="M250 283 h18 M250 286 h12" style="stroke:#8A8478" stroke-width=".6"/>`
    + palmBasket(298, 290, .9) + `<path d="M322 290 q8 -8 16 0z" style="fill:#E8F1F0"/>${[0, 1, 2, 3].map(k => `<circle cx="${325 + k*3.4}" cy="${287 - (k % 2)*2}" r="2" style="fill:${["#E8574A", "#F2C84A", "#8ABE5A", P.blue][k]}"/>`).join("")}`
    + `<rect x="344" y="270" width="24" height="18" rx="2" style="fill:${P.cream};stroke:#3E8A44" stroke-width="1"/>` + txt(356, 282, "€10", 7, "#3E8A44", 700)
    + lab(262, 366, "Hire desk", "#D8EEC8", 10));
  // the Green Routes map on its easel at the back right
  const map = spot("fmroutemap", 446, 384, "The map of the Green Routes", hovE(446, 366, 58, 11),
    sk(`<path d="M408 350 l12 -128 M484 350 l-12 -128 M446 236 v114" style="stroke:${P.wood2}" stroke-width="4"/><rect x="396" y="214" width="104" height="104" rx="2" style="fill:#FFFDF6"/><rect x="396" y="214" width="104" height="104" rx="2" fill="none" style="stroke:${P.wood}" stroke-width="4"/>`, `<rect x="396" y="214" width="104" height="104" rx="2"/>`)
    + routeMap(402, 232, 92, 80) + sk(`<rect x="402" y="218" width="92" height="13" style="fill:#3E8A44"/>`, ``) + txt(448, 228, "RUTES VERDES", 7.6, "#FFFDF6", 700)
    + lab(446, 366, "Green Routes", "#D8EEC8", 9));
  // the back left: a rack of bikes ready to go; left middle: a second row in a floor rack
  const rackBack = g(`<path d="M18 344 h132" style="stroke:${P.iron2}" stroke-width="3"/>` + bike(50, 348, P.blue, 1.05) + bike(90, 344, "#3E9FB0", 1.05) + bike(126, 340, "#E8574A", .98, false));
  const rackMid = g(`<path d="M20 494 h148 M28 494 v-14 M160 494 v-14 M28 480 h132" style="stroke:${P.iron2}" stroke-width="2.4"/>` + bike(52, 494, "#8ABE5A", 1) + bike(96, 492, P.blue, 1) + bike(140, 490, "#F2C84A", 1, false));
  // right middle: a child's bike and a trailer for little ones, a stack of baskets
  const kids = g(bike(424, 492, "#E8574A", .7) + sk(`<path d="M452 486 h44 l-4 -28 h-36z" style="fill:#F2C84A"/><path d="M456 458 q20 -20 36 0" fill="none" style="stroke:#3E8A44" stroke-width="2.4"/><circle cx="474" cy="490" r="8" fill="none" style="stroke:#2F2B28" stroke-width="2.4"/><path d="M452 478 l-14 6" style="stroke:${P.iron}" stroke-width="2"/>`, `<path d="M452 486 h44 l-4 -28 h-36z"/>`)
    + palmBasket(408, 444, .8) + palmBasket(408, 432, .8, P.blue) + palmBasket(408, 420, .8, "#3E8A44"));
  // the front: the tool bench with the pump and spare tyres (left); baskets, bottles and caps for sale and a bougainvillea (right)
  const frontL = g(sk(`<rect x="22" y="560" width="126" height="8" rx="2" style="fill:${P.woodL}"/><path d="M28 568 v28 M142 568 v28" style="stroke:${P.wood2}" stroke-width="4"/><rect x="30" y="578" width="110" height="5" style="fill:${P.wood}"/>`, `<rect x="22" y="560" width="126" height="8" rx="2"/>`)
    + `<rect x="36" y="530" width="8" height="30" rx="2" style="fill:#E8574A"/><path d="M32 530 h16" style="stroke:${P.iron}" stroke-width="3"/>` + [70, 100].map(x => `<circle cx="${x}" cy="546" r="13" fill="none" style="stroke:#2F2B28" stroke-width="4"/>`).join("")
    + `<path d="M118 560 l6 -12 l6 12 M128 556 l10 -6" style="stroke:${P.iron2}" stroke-width="2.4"/>` + [0, 1, 2].map(k => `<rect x="${44 + k*30}" y="584" width="20" height="10" rx="1" style="fill:${["#C8CCD0", "#E8574A", "#F2C84A"][k]}"/>`).join(""));
  const frontR = g(crate(366, 566, 66, 30) + [0, 1, 2].map(k => `<g transform="translate(${380 + k*20} 562)"><path d="M-9 0 q0 -9 9 -9 q9 0 9 9z" style="fill:${["#3E8A44", P.blue, "#E8574A"][k]}"/><path d="M0 0 h12" style="stroke:${["#3E8A44", P.blue, "#E8574A"][k]}" stroke-width="2.4"/></g>`).join("")
    + sk(`<rect x="372" y="580" width="54" height="10" rx="1" style="fill:${P.cream}"/>`, ``) + txt(399, 588, "CYCLING CAPS", 5.4, "#3E8A44", 700)
    + `<path d="M466 596 l-4 -20 h32 l-4 20z" style="fill:${P.terra}"/>` + `<path d="M478 576 q-10 -20 -24 -30 M480 576 q4 -24 18 -34" fill="none" style="stroke:#6B4A34" stroke-width="2"/>`
    + [[454, 546], [462, 536], [476, 530], [492, 540], [498, 552], [486, 556], [468, 552], [480, 544]].map(([a, b], k) => `<circle cx="${a}" cy="${b}" r="${5 + (k % 3)}" style="fill:${k % 3 === 2 ? "#4E8A44" : "#D8408A"}"/>`).join(""));
  return tiles(200, ["#E2DCD0", "#D8D2C6", "#E8E2D6", "#D0CABE"], "#A8A294", 48, 48) + skirt(200) + wall + rackBack + counter + map + rackMid + kids + frontL + frontR + step("#B8B2A6") + exit("#3E8A44");
}

export function formenteraRoomArt(scene, day){
  CID = 0; MONTH = +(day || dayKey()).slice(5, 7) || 10;
  return scene === "fm_bar" ? barRoom() : scene === "fm_salt" ? saltRoom() : scene === "fm_bakery" ? bakeryRoom() : scene === "fm_light" ? lightRoom() : bikeRoom();
}
