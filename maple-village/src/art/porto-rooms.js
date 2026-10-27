// Portovenere's interiors (round 211): six rooms behind the doors on the quay, in the borgo and out on the point.
// Ligurian rooms: warm plaster and whitewash, dark beams, green shutters, terrazzo, hexagonal cotto and grey slate floors,
// black portoro marble with its gold veins, and the black-and-white striped stone of San Pietro.
// The edges full, the middle calm and clear (the playbook).
//   pv_mussels: Rosa's mussel co-op on the quay: the ropes of mussels on their rack, nets and buoys, the counter of
//               crates, the stuffing bench, the big doors open onto the mussel rafts in the gulf
//   pv_bar:     Tonio's bar on the quay: the zinc bar and the aperitivo, the deli shelves (chestnut flour, salted capers,
//               wild fennel seed), the sweets corner (pandolce, chestnut biscuits), the little table by the open doors
//   pv_bottega: Ilario's marble workshop: shelves of portoro pieces, the carving bench, slabs, the secret under the sheet
//   pv_books:   Signora Bianca's Poets' bookshop: walls of books, Byron's portrait over the old armchair, the visitors' book
//   pv_shells:  Signora Lia's seashell shop: mobiles, shell boxes, shell mirrors and frames, wreaths, garlands, little
//               shell boats, baskets of loose shells, and the whole wall of shells in patterns
//   pv_church:  San Pietro: striped stone, pointed arches, the choir stalls, the candle stand, the window over the sea
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a few small touches too.
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#3F6B4C") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none" style="fill:#FFFDF6">Exit</text></g>`;
const txt = (x, y, t, size = 9, fill = "#FFFDF6", weight = 400, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none">${t}</text>`;
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const f1 = n => n.toFixed(1);
const P = {beam: "#4A3428", beam2: "#3A2820", shutter: "#3F6E4C", shutter2: "#2F5A3C", sea: "#2F7E86", sea2: "#4E9EA0", sky: "#D3E8EE", foam: "#E8F3F2",
  isle: "#5E8A5A", wood: "#8A6A52", wood2: "#6B5444", pale: "#C9A27E", portoro: "#211E20", gold: "#D9AE4E", brass: "#D9A93E", brass2: "#B8862A",
  mussel: "#1E2230", iron: "#3E4248", red: "#B9533F", ochre: "#E3B467", cream: "#F6EFE2", zinc: "#B9BFC3"};

/* ---------- shared pieces ---------- */
// floors: grey slate slabs, terrazzo with brass strips, hexagonal cotto, stone flags
const slabs = (y0, cols, line, w = 104, h = 56) => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${cols[0]}"/>`;
  for (let r = 0; y0 + r*h < 640; r++) for (let k = -1; k*w < 520; k++) s += `<rect x="${k*w + (r % 2)*w/2}" y="${y0 + r*h}" width="${w}" height="${h}" style="fill:${cols[(r*3 + k*7 + 20) % cols.length]};stroke:${line}" stroke-width="1.3"/>`;
  return g(s); };
const terrazzo = (y0, base, chips, grid, seed = 1) => g(`<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${base}"/>${Array.from({length: 560}, (_, i) => { const x = R(i*3 + seed)*520, y = y0 + R(i*3 + 1 + seed)*(640 - y0);
  return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(1 + R(i*7 + seed)*1.9)}" ry="${f1(.8 + R(i*5 + seed)*1.1)}" transform="rotate(${Math.round(R(i*11 + seed)*180)} ${f1(x)} ${f1(y)})" style="fill:${chips[i % chips.length]}"/>`; }).join("")}
  ${Array.from({length: 6}, (_, k) => `<path d="M0 ${y0 + 40 + k*88} H520" style="stroke:${grid}" stroke-width="1.4"/>`).join("")}${Array.from({length: 6}, (_, k) => `<path d="M${k*104 + 52} ${y0} V640" style="stroke:${grid}" stroke-width="1.4"/>`).join("")}`);
const cottoHex = (y0, a = "#C98260", b = "#BC7452", line = "#9A5A3E") => { const r = 17, w = r*Math.sqrt(3), h = r*1.5; let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${a}"/>`;
  for (let row = 0; row*h < 640 - y0 + r; row++) for (let c = -1; c*w < 540; c++) { const cx = c*w + (row % 2)*w/2, cy = y0 + row*h;
    s += `<polygon points="${Array.from({length: 6}, (_, k) => { const an = Math.PI/180*(60*k - 30); return `${f1(cx + r*Math.cos(an))},${f1(cy + r*Math.sin(an))}`; }).join(" ")}" style="fill:${(row*7 + c*3 + 40) % 5 === 0 ? b : a};stroke:${line}" stroke-width="1.2"/>`; }
  return g(s); };
// the ceiling beam and the ends of the little joists (travicelli) under it
const ceiling = (col = P.beam) => g(`<rect width="520" height="14" style="fill:${col}"/>${Array.from({length: 13}, (_, k) => `<rect x="${k*40 + 11}" y="14" width="18" height="7" style="fill:${col}"/>`).join("")}`);
// soft patches in old plaster
const blotch = (col, seed, n = 9) => Array.from({length: n}, (_, i) => `<ellipse cx="${f1(R(i + seed)*520)}" cy="${f1(30 + R(i*2 + seed)*150)}" rx="${f1(16 + R(i*3 + seed)*30)}" ry="${f1(8 + R(i*5 + seed)*14)}" style="fill:${col}" opacity=".35"/>`).join("");
const shelf = (x, y, w, items, col = P.wood) => g(sk(`<rect x="${x}" y="${y}" width="${w}" height="6" style="fill:${col}"/>${items}`, `<rect x="${x}" y="${y}" width="${w}" height="6"/>`));
const plant = (x, y, pot = "#C47A55", leaf = "#5E8A4A") => g(sk(`${[[-10, -22], [-3, -30], [5, -26], [11, -18], [0, -20]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y - 14 + dy*.5}" rx="5" ry="11" transform="rotate(${dx*3} ${x + dx} ${y - 14 + dy*.5})" style="fill:${leaf}"/>`).join("")}<path d="M${x - 11} ${y - 16} h22 l-3 16 h-16z" style="fill:${pot}"/>`, `<path d="M${x - 11} ${y - 16} h22 l-3 16 h-16z"/>`));
// red geraniums in an old olive oil tin, the Ligurian way
const geranium = (x, y) => g(sk(`${[[-8, -22], [0, -28], [8, -21], [-3, -16], [6, -14]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y - 16 + dy*.6}" r="6" style="fill:#5E8A4A"/>`).join("")}${[[-7, -36], [2, -42], [9, -34], [-1, -30]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy*.8}" r="3.6" style="fill:#D9433A"/><circle cx="${x + dx + 1}" cy="${y + dy*.8 - 1}" r="1.4" style="fill:#F07A6A"/>`).join("")}<rect x="${x - 10}" y="${y - 18}" width="20" height="18" style="fill:#E3C24A"/><rect x="${x - 10}" y="${y - 12}" width="20" height="7" style="fill:#3E7A4A"/>`, `<rect x="${x - 10}" y="${y - 18}" width="20" height="18"/>`));
// an agave or aloe in a big terracotta pot
const agave = (x, y) => g(sk(`${[-60, -35, -12, 12, 35, 60].map(a => `<path d="M${x} ${y - 22} q${a*.25} -18 ${a*.5} ${-30 + Math.abs(a)*.2} q${-a*.15} 14 ${-a*.5} ${30 - Math.abs(a)*.2}" style="fill:#7FA38A"/>`).join("")}<path d="M${x - 14} ${y - 24} h28 l-4 24 h-20z" style="fill:#C47A55"/><path d="M${x - 15} ${y - 24} h30" style="stroke:#9A5A3E" stroke-width="3"/>`, `<path d="M${x - 14} ${y - 24} h28 l-4 24 h-20z"/>`));
const chair = (x, y, dir = 1, col = P.wood) => sk(`<rect x="${x - 10}" y="${y - 20}" width="20" height="5" style="fill:${col}"/><path d="M${x + 9*dir} ${y - 20} v-22 M${x + 3*dir} ${y - 20} v-22 M${x - 10} ${y - 15} v15 M${x + 10} ${y - 15} v15" style="stroke:${col}" stroke-width="2.6"/><path d="M${x + 1*dir} ${y - 40} h${10*dir}" style="stroke:${col}" stroke-width="3"/>`, `<rect x="${x - 10}" y="${y - 20}" width="20" height="5"/>`);
// a little iron café chair, the round back seen side on
const ironChair = (x, y, dir = 1) => sk(`<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="3.6" style="fill:#3F6E4C"/><path d="M${x - 9} ${y - 18} l-2 18 M${x + 9} ${y - 18} l2 18 M${x + 9*dir} ${y - 20} v-14 q0 -10 ${-8*dir} -10" fill="none" style="stroke:#2F2B28" stroke-width="2"/>`, `<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="3.6"/>`);
const stool = (x, y, col = P.wood) => sk(`<ellipse cx="${x}" cy="${y - 20}" rx="12" ry="4.5" style="fill:${col}"/><path d="M${x - 8} ${y - 18} l-3 18 M${x + 8} ${y - 18} l3 18 M${x} ${y - 17} v17" style="stroke:${P.wood2}" stroke-width="2.2"/>`, `<ellipse cx="${x}" cy="${y - 20}" rx="12" ry="4.5"/>`);
const crate = (x, y, w, h, fill, inner = "") => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${fill}"/><path d="M${x} ${y + h/2} H${x + w}" style="stroke:#7E5C40" stroke-width="1"/>${inner}`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
const frame = (x, y, w, h, inner, col = "#6B4430", bg = "#F3EBDC") => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${col}"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" style="fill:${bg}"/>${inner}`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
// a hanging lamp; shades: enamel, glass globe, green glass, iron lantern
const pendant = (x, y, kind = "enamel") => g(sk(`<path d="M${x} 14 V${y - 8}" style="stroke:#3A3430" stroke-width="1"/>${
  kind === "globe" ? `<rect x="${x - 3}" y="${y - 10}" width="6" height="4" style="fill:${P.brass}"/><circle cx="${x}" cy="${y}" r="9" style="fill:#FFF2C8"/><circle cx="${x - 3}" cy="${y - 3}" r="2.4" style="fill:#FFFFFF"/>`
  : kind === "green" ? `<path d="M${x - 11} ${y} q11 -14 22 0z" style="fill:#3E7A5A"/><path d="M${x - 11} ${y} h22" style="stroke:${P.brass}" stroke-width="1.6"/><ellipse cx="${x}" cy="${y + 1}" rx="5" ry="2.4" style="fill:#FFE3A3"/>`
  : kind === "iron" ? `<path d="M${x - 7} ${y - 8} h14 l-2 14 h-10z" style="fill:#FFE3A3"/><path d="M${x - 9} ${y - 8} l9 -6 l9 6z M${x - 7} ${y + 6} h14" style="fill:#2F2B28;stroke:#2F2B28" stroke-width="1.6"/><path d="M${x} ${y - 8} v14" style="stroke:#2F2B28" stroke-width="1"/>`
  : `<path d="M${x - 13} ${y} q13 -16 26 0z" style="fill:#F3F0E8"/><path d="M${x - 13} ${y} h26" style="stroke:#2F4A5E" stroke-width="1.6"/><ellipse cx="${x}" cy="${y + 1}" rx="5" ry="2.4" style="fill:#FFE3A3"/>`}`,
  kind === "globe" ? `<circle cx="${x}" cy="${y}" r="9"/>` : kind === "iron" ? `<path d="M${x - 7} ${y - 8} h14 l-2 14 h-10z"/>` : `<path d="M${x - 12} ${y} q12 -14 24 0z"/>`)) + lampGlow(x, y + 4, 30);
// the gulf through a window or door: pale sky, Palmaria's green hump, deep blue-green water
const seaView = (x, y, w, h, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.sky}"/><path d="M${x} ${y + h*.46} Q${x + w*.18} ${y + h*.3} ${x + w*.4} ${y + h*.36} Q${x + w*.56} ${y + h*.4} ${x + w*.66} ${y + h*.46}z" style="fill:${P.isle}"/><rect x="${x}" y="${y + h*.46}" width="${w}" height="${h*.54}" style="fill:${P.sea}"/><path d="M${x + 6} ${y + h*.6} q5 -3 10 0 q5 3 10 0 M${x + w*.5} ${y + h*.74} q5 -3 10 0 q5 3 10 0 M${x + w*.2} ${y + h*.88} q5 -3 10 0" fill="none" style="stroke:${P.sea2}" stroke-width="1.4"/>${extra}`;
// a window framed in white, its green louvred shutters folded back on the wall
const shutWin = (x, y, w, h, inner, sh = P.shutter) => { const sw = w/2 - 2;
  const louv = sx => `<rect x="${sx}" y="${y - 2}" width="${sw}" height="${h + 4}" style="fill:${sh}"/>${Array.from({length: Math.floor(h/6)}, (_, k) => `<path d="M${sx + 3} ${y + 3 + k*6} h${sw - 6}" style="stroke:${P.shutter2}" stroke-width="1.6"/>`).join("")}`;
  return g(sk(`${louv(x - sw - 8)}${louv(x + w + 8)}<rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}" style="fill:#F3EDE0"/>${inner}<path d="M${x + w/2} ${y} V${y + h} M${x} ${y + h*.42} H${x + w}" style="stroke:#F3EDE0" stroke-width="3"/><rect x="${x - 8}" y="${y + h + 3}" width="${w + 16}" height="5" style="fill:#D9CDB8"/>`,
    `<rect x="${x - sw - 8}" y="${y - 2}" width="${sw}" height="${h + 4}"/><rect x="${x + w + 8}" y="${y - 2}" width="${sw}" height="${h + 4}"/><rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}"/>`)); };

/* ---------- shells ---------- */
const SHC = ["#F4D7BE", "#F0B9A0", "#EFE6D6", "#F6E6C8", "#E3A989", "#DCC8E2", "#F7F1E6", "#E9C9A4"];
const shellBits = {
  scallop: c => `<path d="M-3 6 h6 l1.5 3 h-9z" style="fill:${c}"/><path d="M0 7 L-10 -2 Q-8 -11 0 -12 Q8 -11 10 -2 Z" style="fill:${c};stroke:#9A6A50" stroke-width=".7"/>${[-6.5, -3.2, 0, 3.2, 6.5].map(d => `<path d="M0 6 L${d} -10" style="stroke:#B8846A" stroke-width=".7"/>`).join("")}`,
  cowrie: c => `<ellipse rx="6" ry="4" style="fill:${c};stroke:#9A6A50" stroke-width=".7"/><path d="M-4.5 .5 h9" style="stroke:#7A5040" stroke-width=".8"/><circle cx="-2" cy="-2" r=".8" style="fill:#B8846A"/><circle cx="2" cy="-2.2" r=".8" style="fill:#B8846A"/>`,
  whelk: c => `<path d="M0 -11 L5 5 Q0 9 -5 5 Z" style="fill:${c};stroke:#9A6A50" stroke-width=".7"/><path d="M-3.4 0 L3.6 -2 M-2.2 -5 L2.4 -6.2 M-4.4 4 L4.6 2" style="stroke:#B8846A" stroke-width=".8"/>`,
  star: c => `<path d="${Array.from({length: 10}, (_, k) => { const a = -Math.PI/2 + k*Math.PI/5, r = k % 2 ? 3.8 : 9.5; return `${k ? "L" : "M"}${f1(Math.cos(a)*r)} ${f1(Math.sin(a)*r)}`; }).join(" ")}Z" style="fill:${c};stroke:#9A5A40" stroke-width=".7"/><circle r="1.2" style="fill:#B8846A"/>`,
  mussel: () => `<path d="M0 -7 q6 3 3.4 13 q-3.4 2 -6.8 0 q-2.6 -9 3.4 -13z" style="fill:${P.mussel}"/><path d="M0 -5 q2.4 4 1.2 9" fill="none" style="stroke:#6A7E9E" stroke-width=".8"/>`,
  snail: c => `<circle r="6" style="fill:${c};stroke:#9A6A50" stroke-width=".7"/><path d="M0 0 m-1.5 0 a1.5 1.5 0 1 1 1.5 1.5 a3 3 0 1 1 -3 -3 a4.6 4.6 0 1 1 4.6 4.6" fill="none" style="stroke:#B8846A" stroke-width=".8"/>`,
  limpet: c => `<circle r="4.4" style="fill:${c};stroke:#9A6A50" stroke-width=".6"/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M0 0 L${f1(Math.cos(k*1.05)*4.4)} ${f1(Math.sin(k*1.05)*4.4)}" style="stroke:#B8846A" stroke-width=".5"/>`).join("")}<circle r="1.2" style="fill:#FFFDF6"/>`
};
const shell = (t, x, y, s = 1, rot = 0, c = "#F4D7BE") => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${Math.round(rot)}) scale(${s})">${shellBits[t](c)}</g>`;
const TYPES = ["scallop", "cowrie", "whelk", "snail", "limpet", "scallop", "star", "cowrie"];
// a heap of loose shells (for baskets, bowls, counters)
const heap = (x, y, w, n, seed = 1, s = .7) => Array.from({length: n}, (_, i) => { const u = R(i*5 + seed), v = R(i*9 + seed), dx = (u - .5)*w, dy = -Math.sqrt(Math.max(0, 1 - (2*dx/w)**2))*w*.22*v;
  return shell(TYPES[(i + seed) % TYPES.length], x + dx, y + dy, s*(.8 + R(i*3 + seed)*.5), R(i*7 + seed)*360 - 180, SHC[(i*3 + seed) % SHC.length]); }).join("");
// a wicker basket brimming with loose shells
const basket = (x, y, w, h, n, seed) => sk(`<path d="M${x - w/2} ${y - h} l${w*.08} ${h} h${w*.84} l${w*.08} ${-h}z" style="fill:#C9A26A"/>${Array.from({length: Math.floor(h/5)}, (_, k) => `<path d="M${x - w/2 + 2} ${y - h + 4 + k*5} h${w - 4}" style="stroke:#A8834E" stroke-width="1.2"/>`).join("")}${Array.from({length: Math.floor(w/7)}, (_, k) => `<path d="M${x - w/2 + 4 + k*7} ${y - h} v${h}" style="stroke:#B8935A" stroke-width=".7"/>`).join("")}<ellipse cx="${x}" cy="${y - h}" rx="${w/2 + 1}" ry="4" style="fill:#B8935A"/>${heap(x, y - h + 2, w*.9, n, seed)}`,
  `<path d="M${x - w/2} ${y - h} l${w*.08} ${h} h${w*.84} l${w*.08} ${-h}z"/>`);
// a shell mobile: a driftwood stick on a thread from the beam, strings of shells hanging from it
const mobile = (x, y0, w, seed, long = 40, sc = 1) => g(`<path d="M${x} 14 V${y0}" style="stroke:#8E8374" stroke-width=".8"/><path d="M${x - w/2} ${y0 + 1} q${w/2} -5 ${w} 0" fill="none" style="stroke:#A8977E" stroke-width="${3*sc}" stroke-linecap="round"/>${[-w/2 + 4, -w/6, w/6, w/2 - 4].map((dx, k) => { const L = long*(.6 + R(seed + k)*.5), sx = x + dx;
  return `<path d="M${f1(sx)} ${y0} v${f1(L)}" style="stroke:#8E8374" stroke-width=".6"/>${[.3, .6, 1].map((t, j) => shell(j === 2 ? (k % 2 ? "star" : "scallop") : TYPES[(seed + k + j) % TYPES.length], sx, y0 + L*t, (j === 2 ? .8 : .55)*sc, j === 2 ? 0 : 180, SHC[(seed + k*2 + j) % SHC.length])).join("")}`; }).join("")}`);
// a box covered all over in tiny shells
const shellBox = (x, y, w, h, col, seed) => sk(`<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="2" style="fill:${col}"/><rect x="${x - 2}" y="${y - h - 5}" width="${w + 4}" height="6" rx="2" style="fill:${col}"/>${Array.from({length: Math.floor((w - 4)/6)}, (_, k) => `<circle cx="${x + 5 + k*6}" cy="${y - h + 6}" r="2.2" style="fill:${SHC[(k + seed) % SHC.length]}"/><circle cx="${x + 5 + k*6}" cy="${y - 4}" r="1.6" style="fill:#FFFDF6"/>`).join("")}${shell(seed % 2 ? "scallop" : "star", x + w/2, y - h/2 + 2, .55, 0, "#FFFDF6")}${shell("cowrie", x + w/2, y - h - 3, .5, 0, SHC[seed % SHC.length])}`, `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="2"/>`);
// a sunburst mirror of shells
const shellMirror = (x, y, r, seed = 0) => sk(`${Array.from({length: Math.round(r*.55)}, (_, k) => { const a = k/Math.round(r*.55)*360; return `<g transform="rotate(${a + 90} ${x} ${y})">${shell("scallop", x, y - r - 6, r/30, 0, SHC[(k + seed) % 4])}</g>`; }).join("")}<circle cx="${x}" cy="${y}" r="${r + 1}" style="fill:#EFE6D6"/>${Array.from({length: Math.round(r*.7)}, (_, k) => { const a = k/Math.round(r*.7)*Math.PI*2; return `<circle cx="${f1(x + Math.cos(a)*(r - 1))}" cy="${f1(y + Math.sin(a)*(r - 1))}" r="1.8" style="fill:${SHC[(k + seed + 2) % SHC.length]}"/>`; }).join("")}<circle cx="${x}" cy="${y}" r="${r - 4}" style="fill:#CFE3E8"/><path d="M${x - r*.5} ${y - r*.1} l${r*.4} ${-r*.4} M${x - r*.35} ${y + r*.15} l${r*.55} ${-r*.55}" style="stroke:#FFFFFF" stroke-width="2" opacity=".8"/>`,
  `<circle cx="${x}" cy="${y}" r="${r - 4}"/>`);
// a wreath of shells with a ribbon
const wreath = (x, y, r, seed, bow = "#4E9EA0") => sk(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" style="stroke:#C9B48E" stroke-width="7"/>${Array.from({length: 16}, (_, k) => { const a = k/16*Math.PI*2; return shell(TYPES[(k + seed) % TYPES.length], x + Math.cos(a)*r, y + Math.sin(a)*r, .55, a*57.3 + 90, SHC[(k*3 + seed) % SHC.length]); }).join("")}<path d="M${x} ${y + r} l-8 -5 v10z M${x} ${y + r} l8 -5 v10z M${x - 2} ${y + r} l-4 12 M${x + 2} ${y + r} l4 12" style="fill:${bow};stroke:${bow}" stroke-width="2"/>`,
  `<circle cx="${x}" cy="${y}" r="${r + 4}"/>`);
// a garland of shells swagged between two nails
const garland = (x0, y0, x1, y1, sag, seed, n = 10) => g(`<path d="M${x0} ${y0} Q${(x0 + x1)/2} ${(y0 + y1)/2 + sag*2} ${x1} ${y1}" fill="none" style="stroke:#A8977E" stroke-width="1"/>${Array.from({length: n}, (_, k) => { const t = (k + .5)/n, mx = (x0 + x1)/2, my = (y0 + y1)/2 + sag*2, bx = (1 - t)**2*x0 + 2*(1 - t)*t*mx + t*t*x1, by = (1 - t)**2*y0 + 2*(1 - t)*t*my + t*t*y1;
  return shell(TYPES[(k + seed) % TYPES.length], bx, by + 4, .5, 180, SHC[(k*2 + seed) % SHC.length]); }).join("")}<circle cx="${x0}" cy="${y0}" r="1.6" style="fill:#8E8374"/><circle cx="${x1}" cy="${y1}" r="1.6" style="fill:#8E8374"/>`);
// a little boat: painted hull, a scallop for a sail
const shellBoat = (x, y, s = 1, hull = "#3E7A9A") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -6 h28 l-5 7 h-18z" style="fill:${hull}"/><path d="M-13 -4 h26" style="stroke:#FFFDF6" stroke-width="1.2"/><path d="M0 -6 v-22" style="stroke:#8A6A52" stroke-width="1.4"/>${shell("scallop", 1, -18, .75, 0, "#F0B9A0")}<path d="M1 -28 l6 2 l-6 2z" style="fill:#D9433A"/>${shell("limpet", -8, -3, .35, 0, "#FFFDF6")}${shell("limpet", 8, -3, .35, 0, "#FFFDF6")}</g>`;

/* ---------- portoro marble ---------- */
const veins = (x, y, w, h, seed) => Array.from({length: 2}, (_, k) => `<path d="M${f1(x + w*R(seed + k))} ${f1(y + h*.1)} q${f1(w*(R(seed*3 + k) - .5))} ${f1(h*.3)} ${f1(w*(R(seed*5 + k) - .5)*.8)} ${f1(h*.8)}" fill="none" style="stroke:${P.gold}" stroke-width="${k ? .8 : 1.3}"/>`).join("");
const portoro = (t, x, y, s = 1, seed = 1) => { const B = P.portoro, sh = `style="fill:${B}"`;
  const body = t === "bowl" ? `<path d="M-14 -10 h28 q-2 12 -14 12 q-12 0 -14 -12z" ${sh}/><ellipse cx="0" cy="-10" rx="14" ry="3" style="fill:#3A3538"/>${veins(-12, -10, 24, 12, seed)}`
    : t === "egg" ? `<ellipse cx="0" cy="-8" rx="6" ry="8" ${sh}/>${veins(-5, -15, 10, 14, seed)}`
    : t === "obelisk" ? `<path d="M-5 0 L-3 -26 L0 -30 L3 -26 L5 0z" ${sh}/><rect x="-7" y="-3" width="14" height="3" ${sh}/>${veins(-4, -26, 8, 26, seed)}`
    : t === "candle" ? `<path d="M-6 0 h12 l-3 -4 h-2 v-16 h3 v-3 h-10 v3 h3 v16 h-2z" ${sh}/><rect x="-2.5" y="-31" width="5" height="9" style="fill:#FFFDF6"/><path d="M0 -31 q-2 -3 0 -6 q2 3 0 6" style="fill:#F6B23A"/>${veins(-4, -20, 8, 18, seed)}`
    : t === "box" ? `<rect x="-11" y="-12" width="22" height="12" ${sh}/><rect x="-12" y="-15" width="24" height="4" rx="1" style="fill:#3A3538"/><circle cx="0" cy="-16" r="1.6" style="fill:${P.gold}"/>${veins(-10, -12, 20, 12, seed)}`
    : t === "mortar" ? `<path d="M-11 -14 h22 l-3 14 h-16z" ${sh}/><ellipse cx="0" cy="-14" rx="11" ry="2.6" style="fill:#3A3538"/><path d="M4 -14 l8 -10" style="stroke:#EDE6D6" stroke-width="3.4" stroke-linecap="round"/>${veins(-9, -14, 18, 14, seed)}`
    : t === "cat" ? `<path d="M-8 0 q-2 -12 3 -16 l-1 -7 l4 4 h4 l4 -4 l-1 7 q5 4 3 16z" ${sh}/><path d="M8 -2 q8 2 6 -8" fill="none" style="stroke:${B}" stroke-width="2.4"/><circle cx="-2.4" cy="-15" r=".9" style="fill:${P.gold}"/><circle cx="2.4" cy="-15" r=".9" style="fill:${P.gold}"/>${veins(-6, -14, 12, 14, seed)}`
    : t === "heart" ? `<path d="M0 0 q-12 -8 -8 -15 q4 -5 8 1 q4 -6 8 -1 q4 7 -8 15z" ${sh}/>${veins(-6, -14, 12, 12, seed)}`
    : t === "vase" ? `<path d="M-5 0 q-6 -10 -2 -18 v-6 h14 v6 q4 8 -2 18z" ${sh}/>${veins(-6, -22, 12, 22, seed)}`
    : `<rect x="-10" y="-4" width="20" height="4" ${sh}/><rect x="-10" y="-8.5" width="20" height="4" style="fill:#2E2A2C"/>${veins(-9, -8, 18, 8, seed)}`;   // coasters
  return `<g transform="translate(${x} ${y}) scale(${s})">${body}<path d="M-4 -6 l3 -3" style="stroke:#FFFFFF" stroke-width="1" opacity=".5"/></g>`; };
const tag = (x, y) => `<rect x="${x - 4}" y="${y}" width="8" height="5" rx="1" style="fill:#FFFDF6;stroke:#8E8374" stroke-width=".4"/>`;

/* ---------- the mussel co-op ---------- */
const mussel = (x, y, s = .8, rot = 0) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${Math.round(rot)}) scale(${s})">${shellBits.mussel()}</g>`;
const musselHeap = (x, y, w, n, seed = 1) => Array.from({length: n}, (_, i) => { const dx = (R(i*3 + seed) - .5)*w, dy = -Math.sqrt(Math.max(0, 1 - (2*dx/w)**2))*w*.2*R(i*7 + seed); return mussel(x + dx, y + dy, .7, R(i*5 + seed)*360); }).join("");
function musselsRoom(){
  // warm plaster over a grey slate dado, the ceiling beam
  const wall = g(`<rect width="520" height="200" style="fill:#EFDDB8"/>${blotch("#F8EBD0", 3)}<rect y="138" width="520" height="62" style="fill:#A9C4BC"/>${Array.from({length: 26}, (_, k) => `<path d="M${k*20 + 10} 142 V192" style="stroke:#93B0A8" stroke-width="1"/>`).join("")}<rect y="134" width="520" height="6" style="fill:#3E7D80"/><rect y="192" width="520" height="8" style="fill:#3A3E42"/>`) + ceiling()
    // the painted sign across the top
    + g(sk(`<rect x="150" y="22" width="222" height="22" rx="3" style="fill:#2F6E74"/>`, `<rect x="150" y="22" width="222" height="22" rx="3"/>`) + txt(261, 37, "MUSSEL CO-OP · PORTOVENERE", 10, "#F6EFE2", 700))
    // the chalkboard of the day
    + g(sk(`<rect x="152" y="52" width="104" height="80" rx="2" style="fill:#2F3A34"/><rect x="152" y="52" width="104" height="80" rx="2" fill="none" style="stroke:${P.wood}" stroke-width="4"/>`, `<rect x="152" y="52" width="104" height="80" rx="2"/>`)
      + txt(204, 68, "FROM THE GULF", 9, "#FFFDF6", 700) + ["Mussels by the kilo", "Stuffed mussels", "Oysters · Clams", "Picked at dawn"].map((t, i) => txt(204, 84 + i*13, t, 8, i === 3 ? "#F3D34A" : "#E8EEE6")).join(""))
    // shelves of white enamel pots and jars, ladles on hooks below
    + shelf(266, 70, 106, [[284, 0], [318, 1], [352, 0]].map(([x, k]) => `<path d="M${x - 14} 70 v-${16 + k*4} h28 v${16 + k*4}z" style="fill:#F3F0E8"/><path d="M${x - 14} ${54 - k*4} h28" style="stroke:#2F4A6E" stroke-width="2"/><path d="M${x - 18} ${58 - k*4} h4 M${x + 14} ${58 - k*4} h4" style="stroke:#2F4A6E" stroke-width="2"/>`).join(""))
    + shelf(266, 116, 106, Array.from({length: 6}, (_, k) => `<rect x="${272 + k*16}" y="98" width="12" height="18" rx="2" style="fill:${["#C9483A", "#F3EEE6", "#C9483A", "#E3C24A", "#F3EEE6", "#7E9A5A"][k]}"/><rect x="${271 + k*16}" y="95" width="14" height="4" rx="1" style="fill:#5A5550"/>`).join(""))
    + g(`${[280, 300, 320, 340, 360].map((x, k) => `<path d="M${x} 122 v${8 + (k % 2)*4}" style="stroke:#9AA6AE" stroke-width="1.6"/><ellipse cx="${x}" cy="${132 + (k % 2)*4}" rx="${k % 2 ? 4 : 5}" ry="3" style="fill:#9AA6AE"/>`).join("")}`)
    // the big doors open onto the gulf: the mussel rafts, rows of floats, a boat coming in
    + g(sk(`<rect x="382" y="26" width="126" height="174" style="fill:#2F5A3C"/>${seaView(392, 36, 106, 164, `${[0, 1, 2].map(r => `<path d="M${398 - r*2} ${126 + r*16} H${494}" style="stroke:#1E4A50" stroke-width="1.4"/>${Array.from({length: 7 + r*2}, (_, k) => `<circle cx="${400 + k*(92/(6 + r*2))}" cy="${126 + r*16}" r="${2 + r*.8}" style="fill:${k % 3 ? "#FFFDF6" : "#E8823A"}"/>`).join("")}`).join("")}${[402, 446, 490].map(x => `<path d="M${x} 120 v-10" style="stroke:#3A3430" stroke-width="1.6"/>`).join("")}<path d="M428 104 l4 6 h22 l4 -7z" style="fill:#F3EEE6"/><path d="M430 106 h26" style="stroke:#2F6E9A" stroke-width="1.4"/><path d="M442 103 v-12" style="stroke:${P.wood}" stroke-width="1.2"/><path d="M412 60 q4 -4 8 0 q4 -4 8 0" fill="none" style="stroke:#3A3430" stroke-width="1.1"/>`)}<rect x="392" y="188" width="106" height="12" style="fill:#9A9488"/><path d="M372 30 L392 36 V200 L372 200z M518 30 L498 36 V200 L518 200z" style="fill:#3F6E4C"/>`,
      `<rect x="382" y="26" width="126" height="174"/><rect x="392" y="36" width="106" height="164"/>`))
    + pendant(208, 150) + pendant(318, 150);
  // the mussel ropes (the touch): a rack of long ropes thick with mussels, buoys on the posts, a tub at their feet
  const ropes = spot("pvropes", 76, 344, "The mussel ropes", hovE(76, 328, 58, 12),
    sk(`<rect x="24" y="34" width="8" height="270" style="fill:${P.wood2}"/><rect x="120" y="34" width="8" height="270" style="fill:${P.wood2}"/><rect x="18" y="34" width="116" height="9" style="fill:${P.wood}"/>
      ${[0, 1, 2, 3, 4].map(k => { const x = 42 + k*19, bot = 250 + (k % 2)*14; return `<path d="M${x} 43 V${bot}" style="stroke:#C9B07A" stroke-width="2"/>${Array.from({length: Math.floor((bot - 58)/9)}, (_, j) => [-1, 0, 1].map(d => mussel(x + d*4, 58 + j*9 + Math.abs(d)*3, .55, d*30 + 180)).join("")).join("")}`; }).join("")}
      <ellipse cx="28" cy="70" rx="9" ry="12" style="fill:#E8823A"/><path d="M19 70 h18" style="stroke:#FFFDF6" stroke-width="3"/><ellipse cx="124" cy="96" rx="9" ry="12" style="fill:#FFFDF6"/><path d="M115 96 h18" style="stroke:#E8823A" stroke-width="3"/>
      <path d="M30 306 l4 -36 h84 l4 36z" style="fill:#3E7A9A"/><path d="M33 280 h86" style="stroke:#2F5A7A" stroke-width="2"/>`,
      `<rect x="24" y="34" width="8" height="270"/><rect x="120" y="34" width="8" height="270"/><path d="M30 306 l4 -36 h84 l4 36z"/>`)
    + lab(76, 328, "Mussel ropes", "#CFE0EE", 9));
  // the counter: blue-green planks under a zinc top, crates of mussels, the red scale, net bags ready to go
  const counter = spot("pv_mussels", 255, 386, "Rosa's mussel counter", hovE(255, 368, 116, 16),
    sk(`<rect x="140" y="284" width="230" height="60" rx="2" style="fill:#3E7D80"/>${Array.from({length: 11}, (_, k) => `<path d="M${150 + k*20} 288 v54" style="stroke:#2F6468" stroke-width="1.2"/>`).join("")}<rect x="136" y="276" width="238" height="9" rx="2" style="fill:${P.zinc}"/>
      ${[[150, 1], [204, 2]].map(([x, s]) => `<rect x="${x}" y="258" width="48" height="18" style="fill:#D2B48A"/><path d="M${x} 266 h48" style="stroke:#A8875E" stroke-width="1"/>${musselHeap(x + 24, 260, 44, 18, s)}<rect x="${x + 16}" y="268" width="16" height="7" rx="1" style="fill:#FFFDF6"/>`).join("")}
      <path d="M268 276 v-14 h30 v14" fill="none" style="stroke:#C9483A" stroke-width="3"/><rect x="262" y="256" width="42" height="8" rx="2" style="fill:#C9483A"/><ellipse cx="283" cy="254" rx="16" ry="3" style="fill:#D9DDE0"/>${musselHeap(283, 252, 26, 8, 7)}<circle cx="283" cy="270" r="4" style="fill:#FFFDF6"/>
      ${[322, 342, 360].map((x, k) => `<path d="M${x - 9} 276 q-2 -18 9 -20 q11 2 9 20z" style="fill:#E8823A"/><path d="M${x - 8} 268 l16 -6 M${x - 8} 262 l16 8 M${x - 6} 274 l12 -14" style="stroke:#C25A1E" stroke-width=".7"/>${mussel(x - 3, 266, .5, 20)}${mussel(x + 3, 268, .5, -20)}`).join("")}`,
      `<rect x="140" y="284" width="230" height="60" rx="2"/><rect x="136" y="276" width="238" height="9" rx="2"/>`)
    + txt(174, 274, "1 kg", 5.5, "#2F2B28", 700) + txt(228, 274, "1 kg", 5.5, "#2F2B28", 700)
    + lab(255, 368, "Mussel counter", "#CFE0EE", 10));
  // blue crates of mussels stacked under the open doors
  const crates = g([[408, 290, 0], [452, 290, 1], [416, 262, 2], [440, 236, 3]].map(([x, y, s]) => sk(`<rect x="${x}" y="${y - 26}" width="44" height="26" rx="2" style="fill:#3E6E9A"/>${[0, 1, 2].map(k => `<rect x="${x + 4 + k*13}" y="${y - 18}" width="10" height="12" rx="2" style="fill:#2F5A7A"/>`).join("")}${musselHeap(x + 22, y - 26, 40, 12, s + 3)}`, `<rect x="${x}" y="${y - 26}" width="44" height="26" rx="2"/>`)).join(""));
  // the stuffing bench: opened mussels, a bowl of stuffing (bread, egg, cheese, herbs), tomato sauce on the ring, a tray tied up
  const bench = spot("pvstuff", 420, 446, "Stuff mussels with Rosa", hovE(436, 430, 62, 13),
    sk(`<rect x="384" y="346" width="108" height="60" style="fill:${P.wood}"/><path d="M380 338 h116 v10 h-116z" style="fill:#D9C2A0"/><path d="M392 348 v56 M484 348 v56" style="stroke:${P.wood2}" stroke-width="2"/>
      <path d="M392 334 q16 10 32 0z" style="fill:#F3EEE6"/><ellipse cx="408" cy="334" rx="16" ry="4" style="fill:#E8E2D4"/>${Array.from({length: 7}, (_, k) => `<path d="M${396 + k*4} 333 q2 -6 4 0 q-2 2 -4 0z" style="fill:${P.mussel}"/><ellipse cx="${398 + k*4}" cy="332" rx="1.6" ry="1" style="fill:#E8A06A"/>`).join("")}
      <path d="M430 336 q12 9 24 0z" style="fill:#3E7A9A"/><ellipse cx="442" cy="335" rx="12" ry="3.4" style="fill:#E3C98E"/>${[436, 440, 444, 448].map((x, k) => `<circle cx="${x}" cy="${334 + (k % 2)}" r=".9" style="fill:${k % 2 ? "#5E8A3A" : "#C9483A"}"/>`).join("")}
      <rect x="462" y="330" width="26" height="6" rx="1" style="fill:#3A3430"/><path d="M462 330 v-12 h26 v12" style="fill:#9AA6AE"/><ellipse cx="475" cy="318" rx="13" ry="3" style="fill:#B8332A"/><path d="M470 314 q2 -6 0 -10 M478 314 q2 -6 0 -10" fill="none" style="stroke:#FFFFFF" stroke-width="1" opacity=".7"/>
      <rect x="398" y="356" width="40" height="14" rx="2" style="fill:#C9C2B2"/>${[0, 1, 2, 3].map(k => `<path d="M${402 + k*9} 362 q4 -5 7 0 q-3 4 -7 0z" style="fill:${P.mussel}"/><path d="M${401 + k*9} 362 h9" style="stroke:#F3EEE6" stroke-width=".8"/>`).join("")}<path d="M446 362 h32" style="stroke:#5E8A3A" stroke-width="3" stroke-linecap="round"/>`,
      `<rect x="384" y="346" width="108" height="60"/><path d="M380 338 h116 v10 h-116z"/>`)
    + lab(436, 430, "Stuffing bench", "#F6E3B4", 9) + g(stool(372, 404, "#3E7D80")));
  // the left: a heap of buoys and a coil of rope; the front: crates, a sack, boots; the tub of sea water and the hose; geraniums
  const left = g(sk(`<path d="M22 430 q4 -44 40 -48 q40 2 50 44z" style="fill:#4E7A62"/>${Array.from({length: 8}, (_, k) => `<path d="M${30 + k*10} 430 q${4 - k} -24 ${10 - k*2} -42" fill="none" style="stroke:#3A5E4A" stroke-width="1"/>`).join("")}<path d="M30 412 q30 -16 76 4 M40 398 q24 -10 56 2" fill="none" style="stroke:#3A5E4A" stroke-width="1"/>${[[40, 396], [62, 386], [86, 392]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" style="fill:#F3D34A"/>`).join("")}`, `<path d="M22 430 q4 -44 40 -48 q40 2 50 44z"/>`))
    + g(sk(`${[[44, 444, "#E8823A"], [70, 452, "#FFFDF6"], [92, 440, "#E8823A"], [58, 420, "#FFFDF6"], [84, 416, "#3E6E9A"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="15" style="fill:${c}"/><path d="M${x - 12} ${y} h24" style="stroke:${c === "#FFFDF6" ? "#E8823A" : "#FFFDF6"}" stroke-width="3"/><path d="M${x} ${y - 15} v-4" style="stroke:#3A3430" stroke-width="1.6"/>`).join("")}`, `<ellipse cx="44" cy="444" rx="13" ry="15"/><ellipse cx="92" cy="440" rx="13" ry="15"/>`))
;
  const front = g(crate(28, 548, 70, 40, "#D2B48A", musselHeap(63, 548, 64, 22, 11)) + crate(34, 512, 58, 36, "#C9A27E", musselHeap(63, 512, 52, 16, 13)) + txt(63, 582, "MUSSELS", 7, "#5A3A2E", 700)
    + sk(`<path d="M104 590 q-6 -34 4 -46 q14 -6 28 0 q8 14 2 46z" style="fill:#C9B07A"/><path d="M112 546 q12 -6 24 0" fill="none" style="stroke:#8A6A3A" stroke-width="2"/>`, `<path d="M104 590 q-6 -34 4 -46 q14 -6 28 0 q8 14 2 46z"/>`) + txt(122, 572, "SALT", 6.5, "#5A3A2E", 700)
    + sk(`<path d="M140 590 v-26 q0 -4 5 -4 h4 v26 h8 v4z M158 590 v-26 q0 -4 5 -4 h4 v26 h8 v4z" style="fill:#4E7A3A"/>`, `<path d="M140 590 v-26 q0 -4 5 -4 h4 v26 h8 v4z M158 590 v-26 q0 -4 5 -4 h4 v26 h8 v4z"/>`))
    + g(sk(`<path d="M380 590 l-6 -60 h112 l-6 60z" style="fill:#8E9AA2"/><ellipse cx="430" cy="530" rx="56" ry="9" style="fill:#2F7E86"/>${musselHeap(430, 534, 80, 24, 17)}<path d="M378 548 h104" style="stroke:#6E7A82" stroke-width="2"/><path d="M486 540 q14 10 4 26 q-10 16 6 24" fill="none" style="stroke:#3E8A5A" stroke-width="3.4"/><rect x="474" y="520" width="14" height="8" rx="2" style="fill:#3E8A5A"/>`, `<path d="M380 590 l-6 -60 h112 l-6 60z"/>`))
    + g(sk(`<path d="M346 592 l-4 -28 h30 l-4 28z" style="fill:#E3C24A"/><path d="M344 566 q13 -12 26 0" fill="none" style="stroke:#3A3430" stroke-width="1.4"/>`, `<path d="M346 592 l-4 -28 h30 l-4 28z"/>`))
    + geranium(182, 592) + geranium(498, 470);
  return slabs(200, ["#7A7F84", "#72777C", "#80858A", "#6E7378"], "#565B60") + wall + ropes + crates + counter + bench + left + front + exit("#2F6E74");
}

/* ---------- Tonio's bar on the quay ---------- */
function barRoom(){
  // salmon plaster with a painted cornice, green panelling below
  const wall = g(`<rect width="520" height="200" style="fill:#EBB89C"/>${blotch("#F3CDB6", 5)}<rect y="20" width="520" height="8" style="fill:#E3B467"/><path d="M0 28 H520" style="stroke:#9A6A4A" stroke-width="1.2"/><rect y="136" width="520" height="64" style="fill:#3F6B4C"/>${Array.from({length: 13}, (_, c) => `<rect x="${c*40 + 6}" y="144" width="28" height="48" fill="none" style="stroke:#2F5A3C" stroke-width="1.4"/>`).join("")}<rect y="132" width="520" height="6" style="fill:#2F5A3C"/>`) + ceiling()
    // the deli shelves: chestnut flour, salted capers, wild fennel seed, oil
    + g(sk(`<rect x="14" y="34" width="106" height="160" style="fill:${P.wood}"/><rect x="18" y="38" width="98" height="152" style="fill:#7A5A44"/>${[78, 124, 170].map(y => `<rect x="16" y="${y}" width="102" height="5" style="fill:${P.pale}"/>`).join("")}
      ${[0, 1, 2, 3].map(k => `<path d="M${24 + k*23} 78 v-26 l3 -4 h12 l3 4 v26z" style="fill:#D9BE94"/><rect x="${25 + k*23}" y="60" width="16" height="9" style="fill:#8A5A3A"/>`).join("")}
      ${Array.from({length: 6}, (_, k) => `<rect x="${22 + k*16}" y="${106}" width="12" height="18" rx="2" style="fill:#B8C29A"/><rect x="${21 + k*16}" y="102" width="14" height="5" rx="1" style="fill:${k % 2 ? "#C9483A" : "#3F6E4C"}"/>${[0, 1, 2].map(j => `<circle cx="${25 + k*16 + j*3}" cy="${114 + (j % 2)*4}" r="1.3" style="fill:#5E7A3A"/>`).join("")}`).join("")}
      ${Array.from({length: 4}, (_, k) => `<rect x="${22 + k*14}" y="152" width="11" height="18" rx="1" style="fill:#7E9A4A"/><path d="M${24 + k*14} 158 h7" style="stroke:#F6EFE2" stroke-width="1.4"/>`).join("")}${[0, 1].map(k => `<rect x="${82 + k*14}" y="144" width="10" height="26" rx="3" style="fill:#9AA24A"/><rect x="${84.5 + k*14}" y="139" width="5" height="6" style="fill:#3A3430"/>`).join("")}`,
      `<rect x="14" y="34" width="106" height="160"/>`))
    + txt(67, 46, "FROM THE HILLS", 6.5, "#F6EFE2", 700) + txt(67, 92, "CHESTNUT FLOUR", 5.5, "#F6EFE2", 700) + txt(67, 138, "SALTED CAPERS", 5.5, "#F6EFE2", 700) + txt(67, 184, "WILD FENNEL SEED · OIL", 5, "#F6EFE2", 700)
    // the back bar: a mirror and bottles, the chalk menu, the coffee machine
    + g(sk(`<rect x="132" y="34" width="206" height="98" style="fill:#5A4232"/><rect x="138" y="54" width="92" height="74" style="fill:#C9D6D8"/><path d="M146 60 l30 60 M164 60 l24 50" style="stroke:#FFFFFF" stroke-width="3" opacity=".5"/><rect x="132" y="34" width="206" height="18" style="fill:#2F2420"/>`, `<rect x="132" y="34" width="206" height="98"/>`) + txt(235, 47, "BAR DEL MOLO", 11, P.gold, 700)
      + shelf(138, 88, 92, Array.from({length: 8}, (_, k) => `<rect x="${142 + k*11}" y="66" width="8" height="22" rx="3" style="fill:${["#C9483A", "#4E7A5A", "#C9A24A", "#E8823A", "#5A3A6E", "#9FC3B0", "#8A5A2E", "#D9433A"][k]}"/><rect x="${144 + k*11}" y="61" width="4" height="6" style="fill:#3A3430"/>`).join(""), "#3E2E24")
      + shelf(138, 124, 92, Array.from({length: 7}, (_, k) => `<path d="M${144 + k*12} 124 l1 -12 h8 l1 12z" style="fill:#FFFDF6" opacity=".8"/>`).join(""), "#3E2E24")
      + sk(`<rect x="238" y="56" width="94" height="72" rx="2" style="fill:#2F3A34"/>`, `<rect x="238" y="56" width="94" height="72" rx="2"/>`) + txt(285, 70, "APERITIVO", 9, "#FFFDF6", 700) + ["Spritz · Vermentino", "Farinata · Olives", "Pandolce", "Chestnut biscuits"].map((t, i) => txt(285, 85 + i*12, t, 7.5, i > 1 ? "#F3D34A" : "#E8EEE6")).join(""))
    + g(sk(`<rect x="146" y="164" width="60" height="30" rx="3" style="fill:#C9CFD3"/><rect x="150" y="150" width="52" height="16" rx="3" style="fill:#9AA6AE"/><path d="M160 176 v8 M176 176 v8 M192 176 v8" style="stroke:#3A3430" stroke-width="3"/><circle cx="176" cy="158" r="4" style="fill:#FFFDF6"/><path d="M176 158 l2 -2" style="stroke:#C9483A" stroke-width="1"/><path d="M152 150 h48" style="stroke:${P.brass}" stroke-width="2"/>`, `<rect x="146" y="164" width="60" height="30" rx="3"/>`))
    + g(`${[0, 1, 2].map(k => `<rect x="${222 + k*16}" y="${178}" width="12" height="8" rx="1" style="fill:#FFFDF6"/><rect x="${222 + k*16}" y="${170}" width="12" height="8" rx="1" style="fill:#FFFDF6"/>`).join("")}<rect x="276" y="160" width="20" height="30" rx="3" style="fill:#3A3430"/><path d="M280 160 l6 -14 l6 14z" style="fill:#5A5550"/>`)
    // the glazed doors folded right back, open onto the water: boats, the quay edge, a bollard, the tower-houses' reflections
    + g(sk(`<rect x="364" y="30" width="134" height="170" style="fill:#3F6E4C"/>${seaView(372, 38, 118, 162, `${[[380, "#E3B467"], [398, "#C9603F"], [416, "#E59A7E"], [434, "#E8C24A"]].map(([x, c]) => `<rect x="${x}" y="${38 + 76}" width="14" height="40" style="fill:${c}" opacity=".35"/>`).join("")}<path d="M404 158 l6 10 h40 l8 -12z" style="fill:#F3EEE6"/><path d="M406 162 h50" style="stroke:#2F6E9A" stroke-width="2"/><path d="M430 156 v-30 l14 26z" style="fill:#F6EFE2"/><path d="M372 186 H490" style="stroke:#8E8374" stroke-width="2"/><rect x="372" y="186" width="118" height="14" style="fill:#B6AB9C"/><path d="M474 186 v-8 q6 -4 10 0 v8z" style="fill:#3A3430"/>`)}
      <path d="M364 34 L344 44 V196 L364 200z" style="fill:#3F6E4C"/><path d="M361 46 L348 52 V184 L361 188z" style="fill:#D3E8EE" opacity=".7"/><path d="M498 34 L516 44 V196 L498 200z" style="fill:#3F6E4C"/><path d="M501 46 L513 52 V184 L501 188z" style="fill:#D3E8EE" opacity=".7"/>`,
      `<rect x="364" y="30" width="134" height="170"/><rect x="372" y="38" width="118" height="162"/>`))
    + pendant(126, 72, "globe") + pendant(344, 72, "globe");
  // the bar: a zinc top over a strip of mosaic, the aperitivo dishes, spritz glasses, the pandolce under its dome
  const bar = spot("pv_bar", 225, 388, "Tonio's bar and the deli", hovE(228, 370, 112, 16),
    sk(`<rect x="124" y="286" width="210" height="60" rx="2" style="fill:#5A4232"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${130 + k*41}" y="306" width="34" height="34" fill="none" style="stroke:#3E2E24" stroke-width="1.4"/>`).join("")}${Array.from({length: 26}, (_, k) => `<rect x="${126 + k*8}" y="290" width="7" height="10" style="fill:${["#E3B467", "#3F6E4C", "#F6EFE2", "#C9603F"][k % 4]}"/>`).join("")}<rect x="120" y="276" width="218" height="11" rx="2" style="fill:${P.zinc}"/>
      <rect x="132" y="250" width="72" height="26" rx="2" style="fill:#DDEBF0" opacity=".6"/><ellipse cx="146" cy="270" rx="10" ry="3" style="fill:#FFFDF6"/>${[140, 145, 150, 147, 143].map((x, k) => `<circle cx="${x}" cy="${267 - (k > 2 ? 3 : 0)}" r="2.2" style="fill:#5E7A3A"/>`).join("")}<path d="M164 272 l10 -12 l8 12z M174 272 l8 -12 l8 12z" style="fill:#E8B44A"/>${[0, 1, 2].map(k => `<rect x="${186 + k*5}" y="260" width="3" height="12" rx="1" style="fill:#E3C98E"/>`).join("")}<path d="M132 250 h72" style="stroke:${P.brass}" stroke-width="1.6"/>
      ${[214, 230, 246].map(x => `<path d="M${x - 5} 256 h10 l-2 12 h-6z" style="fill:#F07A3A" opacity=".9"/><path d="M${x} 268 v6 M${x - 4} 275 h8" style="stroke:#DDEBF0" stroke-width="1.4"/><circle cx="${x + 2}" cy="256" r="2" style="fill:#F3D34A"/>`).join("")}
      <rect x="264" y="252" width="16" height="24" rx="3" style="fill:#DDEBF0" opacity=".85"/><rect x="263" y="249" width="18" height="5" rx="1" style="fill:${P.pale}"/>${[0, 1, 2, 3].map(k => `<rect x="267" y="${256 + k*5}" width="10" height="3" rx="1" style="fill:#B8784A"/>`).join("")}
      <ellipse cx="310" cy="274" rx="22" ry="4" style="fill:#FFFDF6"/><path d="M294 272 q0 -18 16 -18 q16 0 16 18z" style="fill:#C98A3A"/>${[[302, 266], [310, 262], [318, 267], [306, 270], [314, 270]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="1.6" style="fill:${["#C9483A", "#5E8A3A", "#F3D34A"][k % 3]}"/>`).join("")}<path d="M288 274 q0 -30 22 -30 q22 0 22 30" fill="none" style="stroke:#DDEBF0" stroke-width="2"/><path d="M296 258 q4 -8 10 -10" fill="none" style="stroke:#FFFFFF" stroke-width="1.6" opacity=".8"/>`,
      `<rect x="124" y="286" width="210" height="60" rx="2"/><rect x="120" y="276" width="218" height="11" rx="2"/>`)
    + lab(228, 370, "Bar and deli", "#F6D2C0", 10));
  // the little table by the open doors: marble top, iron chairs, a spritz and a dish of olives
  const terrace = spot("pvterrace", 432, 334, "The little table by the water", hovE(432, 318, 60, 12),
    g(ironChair(398, 296, -1) + ironChair(468, 296, 1))
    + sk(`<path d="M432 270 v26 M420 296 h24" style="stroke:#2F2B28" stroke-width="2.6"/><ellipse cx="432" cy="266" rx="28" ry="8" style="fill:#F3EEE6"/><path d="M412 264 q8 2 14 -2" fill="none" style="stroke:#C9C2B2" stroke-width=".8"/><path d="M420 250 h10 l-2 12 h-6z" style="fill:#F07A3A"/><path d="M425 262 v4" style="stroke:#DDEBF0" stroke-width="1.4"/><ellipse cx="444" cy="263" rx="7" ry="2.4" style="fill:#FFFDF6"/>${[440, 444, 448].map(x => `<circle cx="${x}" cy="261" r="1.8" style="fill:#5E7A3A"/>`).join("")}`, `<ellipse cx="432" cy="266" rx="28" ry="8"/>`)
    + lab(432, 318, "Table by the water", "#CFE0EE", 9));
  // the left: sacks of chestnuts and chestnut flour; a palm; the sweets corner at the front; café tables at the front right
  const left = g(sk(`<path d="M22 340 q-6 -46 6 -62 q18 -8 36 0 q10 18 6 62z" style="fill:#D9BE94"/><path d="M30 280 q18 -8 34 0" fill="none" style="stroke:#8A6A3A" stroke-width="2"/>${[[36, 274], [48, 270], [58, 274], [42, 266], [54, 264]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="4" style="fill:#7A3E1E"/><circle cx="${x - 1}" cy="${y - 2}" r="1" style="fill:#C9A27E"/>`).join("")}`, `<path d="M22 340 q-6 -46 6 -62 q18 -8 36 0 q10 18 6 62z"/>`)) + txt(46, 316, "CHESTNUTS", 6, "#5A3A2E", 700)
    + g(sk(`<path d="M68 344 q-4 -30 4 -44 q14 -6 28 0 q6 14 2 44z" style="fill:#EFE3C8"/><path d="M76 300 q12 -6 24 0" fill="none" style="stroke:#8A6A3A" stroke-width="2"/>`, `<path d="M68 344 q-4 -30 4 -44 q14 -6 28 0 q6 14 2 44z"/>`)) + txt(86, 326, "FLOUR", 6, "#5A3A2E", 700)
    + agave(44, 452);
  // the sweets corner: a glass cabinet of pandolce and chestnut biscuits, a cake stand on top, a little sign
  const sweets = g(sk(`<rect x="26" y="494" width="116" height="74" rx="3" style="fill:${P.wood}"/><rect x="32" y="500" width="104" height="44" style="fill:#DDEBF0" opacity=".85"/><path d="M84 500 v44" style="stroke:${P.wood}" stroke-width="2"/><path d="M32 523 h104" style="stroke:${P.pale}" stroke-width="2"/>
      ${[48, 66].map(x => `<path d="M${x - 9} 521 q0 -12 9 -12 q9 0 9 12z" style="fill:#C98A3A"/><circle cx="${x - 3}" cy="515" r="1.3" style="fill:#C9483A"/><circle cx="${x + 3}" cy="514" r="1.3" style="fill:#5E8A3A"/>`).join("")}${Array.from({length: 8}, (_, k) => `<circle cx="${94 + (k % 4)*10}" cy="${516 - Math.floor(k/4)*6}" r="4" style="fill:#B8784A"/>`).join("")}
      ${Array.from({length: 4}, (_, k) => `<rect x="${38 + k*24}" y="530" width="16" height="13" rx="2" style="fill:#F3EEE6"/><rect x="${37 + k*24}" y="527" width="18" height="4" rx="1" style="fill:${["#C9483A", "#3F6E4C"][k % 2]}"/>`).join("")}
      <path d="M36 568 v20 M132 568 v20" style="stroke:${P.wood2}" stroke-width="4"/><ellipse cx="84" cy="490" rx="22" ry="4" style="fill:#FFFDF6"/><path d="M84 494 v-4" style="stroke:#C9C2B2" stroke-width="2"/><path d="M68 488 q0 -14 16 -14 q16 0 16 14z" style="fill:#C98A3A"/><path d="M64 488 q0 -24 20 -24 q20 0 20 24" fill="none" style="stroke:#DDEBF0" stroke-width="2"/>`, `<rect x="26" y="494" width="116" height="74" rx="3"/>`))
    + g(sk(`<rect x="110" y="458" width="36" height="22" rx="2" style="fill:#F6EFE2"/>`, `<rect x="110" y="458" width="36" height="22" rx="2"/>`) + txt(128, 467, "SWEETS", 5.5, "#7A3E2A", 700) + txt(128, 476, "of Liguria", 5.5, "#7A3E2A"))
    + txt(84, 560, "PANDOLCE · CHESTNUT BISCUITS", 5.2, "#F6EFE2", 700);
  const cafe = (x, y) => g(ironChair(x - 30, y + 16, -1) + ironChair(x + 30, y + 16, 1) + sk(`<path d="M${x} ${y + 4} v24 M${x - 10} ${y + 28} h20" style="stroke:#2F2B28" stroke-width="2.6"/><ellipse cx="${x}" cy="${y}" rx="24" ry="7.5" style="fill:#F3EEE6"/><path d="M${x - 6} ${y - 2} h8 v-4 h-8z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 2} l2 -9 h5 l1 9z" style="fill:#F07A3A" opacity=".9"/>`, `<ellipse cx="${x}" cy="${y}" rx="24" ry="7.5"/>`));
  const right = cafe(430, 486) + cafe(430, 556) + agave(494, 420) + geranium(178, 592);
  return terrazzo(200, "#EFE3CF", ["#C9603F", "#8A8078", "#7E9A6A", "#E3B467", "#FFFDF6", "#A8A098"], "#B8935A", 3) + wall + left + bar + terrace + sweets + right + exit("#3F6B4C");
}

/* ---------- Ilario's marble bottega ---------- */
function bottegaRoom(){
  // whitewash flaking to the old stone, a heavy beam, a chain hoist over the secret
  const stones = [[150, 120, 40, 20], [470, 160, 34, 18], [24, 186, 44, 14], [360, 30, 30, 16], [300, 176, 40, 16]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" style="fill:#B9AFA2;stroke:#8E8374" stroke-width="1"/>`).join("");
  const wall = g(`<rect width="520" height="200" style="fill:#EEEAE2"/>${blotch("#DCD6CC", 9, 7)}${stones}<rect y="190" width="520" height="10" style="fill:#9A948A"/>`) + ceiling(P.beam2)
    // the tool rack: chisels, mallets, rasps, a square, dividers; the pencil sketches pinned below
    + g(sk(`<rect x="16" y="30" width="124" height="96" style="fill:#C9A57A"/>${Array.from({length: 6}, (_, k) => `<path d="M${28 + k*9} 40 v34" style="stroke:#9AA6AE" stroke-width="${2 + (k % 2)}"/><rect x="${25.5 + k*9}" y="40" width="5" height="12" rx="1" style="fill:${P.wood2}"/>`).join("")}
      ${[[96, 44], [120, 44]].map(([x, y]) => `<rect x="${x - 9}" y="${y}" width="18" height="12" rx="3" style="fill:#7A5A44"/><path d="M${x} ${y + 12} v26" style="stroke:${P.pale}" stroke-width="3"/>`).join("")}
      <path d="M28 92 h40 v6 h-34 v18 h-6z" style="fill:#9AA6AE"/><path d="M82 90 l-6 30 M82 90 l6 30" style="stroke:#5A5550" stroke-width="2"/><circle cx="82" cy="90" r="2.4" style="fill:${P.brass}"/><path d="M100 92 h30 M100 102 h30" style="stroke:#5A5550" stroke-width="3"/><rect x="96" y="108" width="36" height="8" rx="2" style="fill:#5A5550"/>`, `<rect x="16" y="30" width="124" height="96"/>`))
    + g([[22, 134, -3], [62, 136, 2], [102, 133, -1]].map(([x, y, r], k) => `<g transform="rotate(${r} ${x + 18} ${y + 22})"><rect x="${x}" y="${y}" width="36" height="46" style="fill:#FBF8F0;stroke:#C9C2B2" stroke-width=".8"/><circle cx="${x + 18}" cy="${y + 2}" r="2" style="fill:#C9483A"/><path d="${["M8 34 q4 -18 12 -22 q6 -2 6 4 l6 -2 M14 28 l-8 -6 M22 24 l8 -8", "M10 36 q-2 -14 6 -18 l-1 -7 l4 4 h4 l4 -4 l-1 7 q6 4 4 18", "M18 36 L6 22 Q8 10 18 9 Q28 10 30 22 Z M18 36 L12 14 M18 36 L24 14"][k]}" transform="translate(${x} ${y})" fill="none" style="stroke:#5A5550" stroke-width="1"/></g>`).join(""))
    // the plaque, black portoro with gold letters
    + g(sk(`<rect x="174" y="20" width="174" height="22" rx="2" style="fill:${P.portoro}"/>${veins(176, 20, 170, 22, 4)}`, `<rect x="174" y="20" width="174" height="22" rx="2"/>`) + txt(261, 35, "ILARIO · PORTORO MARBLE", 10, P.gold, 700))
    // the shop shelves on the wall: bowls, eggs, obelisks, candlesticks, boxes, mortars, cats, hearts, vases, coasters
    + shelf(160, 88, 202, portoro("bowl", 178, 88, 1, 1) + portoro("egg", 206, 88, 1, 2) + portoro("egg", 218, 88, .8, 3) + portoro("obelisk", 240, 88, 1.1, 4) + portoro("vase", 262, 88, 1.1, 5) + portoro("candle", 288, 88, 1, 6) + portoro("candle", 306, 88, 1, 7) + portoro("heart", 330, 88, 1, 8) + portoro("cat", 350, 88, 1, 9) + [190, 240, 296, 340].map(x => tag(x, 92)).join(""), "#7A5A44")
    + shelf(160, 136, 202, portoro("mortar", 182, 136, 1.1, 10) + portoro("box", 216, 136, 1, 11) + portoro("coaster", 246, 136, 1, 12) + portoro("bowl", 278, 136, 1.2, 13) + portoro("box", 312, 136, .9, 14) + portoro("obelisk", 336, 136, .8, 15) + portoro("egg", 352, 136, .9, 16) + [200, 262, 324].map(x => tag(x, 140)).join(""), "#7A5A44")
    + shelf(160, 182, 202, portoro("vase", 176, 182, 1.3, 17) + portoro("cat", 204, 182, 1.2, 18) + portoro("bowl", 238, 182, 1.4, 19) + portoro("heart", 272, 182, 1.2, 20) + portoro("mortar", 300, 182, 1, 21) + portoro("candle", 330, 182, 1.1, 22) + portoro("egg", 350, 182, 1.1, 23), "#7A5A44")
    // the north window: the rocks and Palmaria, a jar of brushes on the sill; the chain hoist
    + g(sk(`<rect x="384" y="34" width="118" height="128" style="fill:#5A5550"/>${seaView(390, 40, 106, 116, `<path d="M390 156 L404 120 L420 130 L436 108 L452 124 V156z" style="fill:#5A5A5E"/><path d="M404 120 l3 10 M436 108 l4 14" style="stroke:${P.gold}" stroke-width="1"/>`)}${[0, 1, 2].map(k => `<path d="M${390 + k*35.3} 40 V156" style="stroke:#5A5550" stroke-width="2"/>`).join("")}<path d="M390 98 H496" style="stroke:#5A5550" stroke-width="2"/><rect x="378" y="160" width="130" height="8" style="fill:#C9C2B2"/><rect x="474" y="144" width="14" height="16" rx="2" style="fill:#C47A55"/><path d="M478 144 l-3 -14 M482 144 v-16 M486 144 l3 -12" style="stroke:${P.wood}" stroke-width="1.6"/>`, `<rect x="384" y="34" width="118" height="128"/>`))
    + g(`<path d="M436 14 V196" style="stroke:#5A5550" stroke-width="2.4" stroke-dasharray="4 2"/><path d="M436 196 q-6 6 0 12 q6 0 4 -6" fill="none" style="stroke:#3A3430" stroke-width="2.4"/>`)
    + `<g pointer-events="none"><path d="M384 162 L502 162 L470 600 L250 600z" fill="#FFFFFF" opacity=".08"/>${Array.from({length: 14}, (_, i) => `<circle cx="${f1(320 + R(i + 40)*140)}" cy="${f1(220 + R(i*3 + 40)*300)}" r="1" fill="#FFFFFF" opacity=".6"/>`).join("")}</g>`
    + pendant(150, 210, "iron") + lampGlow(150, 210, 1);
  // the display table: a portoro slab on trestles with the best pieces
  const table = spot("pv_bottega", 260, 386, "Ilario's shop shelves", hovE(260, 368, 108, 16),
    sk(`<path d="M182 340 l10 -46 h12 l10 46z M306 340 l10 -46 h12 l10 46z" style="fill:${P.wood}"/><path d="M188 320 h20 M312 320 h20" style="stroke:${P.wood2}" stroke-width="3"/><rect x="164" y="282" width="192" height="14" rx="2" style="fill:${P.portoro}"/>${veins(166, 282, 188, 14, 31)}${veins(220, 282, 120, 14, 33)}
      ${portoro("bowl", 192, 282, 1.5, 41)}${portoro("obelisk", 226, 282, 1.3, 42)}${portoro("box", 254, 282, 1.2, 43)}${portoro("cat", 284, 282, 1.3, 44)}${portoro("egg", 306, 282, 1, 45)}${portoro("egg", 318, 282, .8, 46)}<rect x="330" y="274" width="20" height="8" rx="1" style="fill:#FFFDF6"/><path d="M332 277 h16 M332 280 h12" style="stroke:#8E8374" stroke-width=".6"/><path d="M344 270 a4 4 0 0 1 8 0z" style="fill:${P.brass}"/>`,
      `<rect x="164" y="282" width="192" height="14" rx="2"/><path d="M182 340 l10 -46 M214 340 l-10 -46 M306 340 l10 -46 M338 340 l-10 -46"/>`)
    + lab(260, 368, "Portoro pieces", "#E8D3BC", 10));
  // the secret: a tall shape under a dust sheet on the sculptor's stand, the hoist chain above
  const secret = spot("pvsecret", 424, 476, "Something big under a dust sheet", hovE(436, 462, 58, 12),
    sk(`<path d="M402 446 l6 -56 h56 l6 56z" style="fill:${P.wood}"/><path d="M406 420 h60" style="stroke:${P.wood2}" stroke-width="3"/><rect x="396" y="384" width="80" height="8" rx="2" style="fill:${P.pale}"/>
      <path d="M392 392 q-6 -44 10 -70 q4 -34 30 -46 q22 -6 30 14 q16 20 10 46 q14 30 8 56 q-20 6 -44 2 q-26 6 -44 -2z" style="fill:#F3EFE6"/><path d="M406 330 q8 30 2 58 M432 288 q-4 50 4 100 M456 300 q8 40 0 90 M418 310 q20 6 40 -2" fill="none" style="stroke:#C9C2B2" stroke-width="1.4"/><path d="M462 290 q10 -2 14 6" fill="none" style="stroke:#C9C2B2" stroke-width="1"/>`,
      `<path d="M392 392 q-6 -44 10 -70 q4 -34 30 -46 q22 -6 30 14 q16 20 10 46 q14 30 8 56 q-20 6 -44 2 q-26 6 -44 -2z"/><path d="M402 446 l6 -56 h56 l6 56z"/>`)
    + g(`<path d="M436 208 V270" style="stroke:#5A5550" stroke-width="2.4" stroke-dasharray="4 2"/>`) + lab(436, 462, "Under the sheet", "#F6E3B4", 9));
  // the carving bench: a rough block of portoro, mallet and chisels, goggles, a brush, the dust
  const bench = g(sk(`<rect x="22" y="300" width="114" height="80" style="fill:${P.wood}"/><rect x="18" y="292" width="122" height="12" style="fill:#B08A68"/><path d="M30 304 v74 M128 304 v74" style="stroke:${P.wood2}" stroke-width="3"/>
      <path d="M44 292 l4 -30 l30 -8 l14 10 l2 28z" style="fill:${P.portoro}"/>${veins(46, 256, 46, 36, 51)}<path d="M78 254 l14 10 l2 28" fill="none" style="stroke:#4A4448" stroke-width="2"/><path d="M60 266 q8 -6 14 2" fill="none" style="stroke:${P.gold}" stroke-width="1.4"/>
      <rect x="100" y="280" width="20" height="10" rx="3" style="fill:#7A5A44"/><path d="M110 290 v-1 l16 -10" style="stroke:${P.pale}" stroke-width="3"/><path d="M98 294 l26 -2 M102 298 l22 0" style="stroke:#9AA6AE" stroke-width="2"/><ellipse cx="30" cy="290" rx="8" ry="3" style="fill:#3A3430"/><circle cx="26" cy="288" r="3" fill="none" style="stroke:#5A5550" stroke-width="1.4"/><circle cx="34" cy="288" r="3" fill="none" style="stroke:#5A5550" stroke-width="1.4"/>
      <path d="M22 380 h114" style="stroke:#EDE6D6" stroke-width="3" opacity=".7"/>`, `<rect x="22" y="300" width="114" height="80"/><rect x="18" y="292" width="122" height="12"/>`))
    + g(stool(150, 404, P.wood)) + g(`${Array.from({length: 18}, (_, i) => `<path d="M${f1(30 + R(i + 60)*110)} ${f1(388 + R(i*2 + 60)*14)} l3 -2 l2 3z" style="fill:${i % 3 ? "#EDE6D6" : P.portoro}"/>`).join("")}`);
  // the front: slabs leaning on the wall and a crate of offcuts; a finished portoro cat on a plinth, a bucket, a sack of dust
  const front = g(sk(`<path d="M28 592 l14 -110 h40 l-6 110z" style="fill:#F3EFE6"/><path d="M40 520 q14 10 30 -4" fill="none" style="stroke:#B8B0A8" stroke-width="1"/><path d="M58 592 l14 -98 h42 l-6 98z" style="fill:#9EA4A8"/><path d="M70 540 q16 -6 34 6" fill="none" style="stroke:#C9CFD3" stroke-width="1"/><path d="M92 592 l12 -84 h40 l-4 84z" style="fill:${P.portoro}"/>${veins(100, 512, 40, 78, 61)}`, `<path d="M28 592 l14 -110 h40 l-6 110z"/><path d="M58 592 l14 -98 h42 l-6 98z"/><path d="M92 592 l12 -84 h40 l-4 84z"/>`))
    + g(crate(146, 560, 48, 30, "#C9A27E", `${[[154, 558], [166, 556], [178, 559], [188, 556]].map(([x, y], k) => `<path d="M${x - 5} ${y + 2} l3 -6 l7 -1 l3 5 l-4 4z" style="fill:${k % 2 ? P.portoro : "#EDE6D6"}"/>`).join("")}`))
    + g(sk(`<rect x="446" y="530" width="44" height="62" style="fill:#EDE6D6"/><rect x="442" y="524" width="52" height="8" style="fill:#F3EFE6"/>`, `<rect x="446" y="530" width="44" height="62"/>`) + portoro("cat", 468, 524, 2.2, 71))
    + g(sk(`<path d="M382 592 q-8 -40 4 -56 q18 -8 36 0 q10 16 4 56z" style="fill:#EDE3D0"/><path d="M390 536 q18 -8 32 0" fill="none" style="stroke:#8A6A3A" stroke-width="2"/>`, `<path d="M382 592 q-8 -40 4 -56 q18 -8 36 0 q10 16 4 56z"/>`)) + txt(404, 568, "MARBLE", 6.5, "#5A3A2E", 700) + txt(404, 577, "DUST", 6.5, "#5A3A2E", 700)
    + g(sk(`<path d="M344 592 l-4 -30 h30 l-4 30z" style="fill:#9AA6AE"/><ellipse cx="355" cy="562" rx="15" ry="3.4" style="fill:#9FC3CC"/><ellipse cx="350" cy="560" rx="6" ry="4" style="fill:#E3C24A"/>`, `<path d="M344 592 l-4 -30 h30 l-4 30z"/>`))
    + g(sk(`<path d="M24 470 l4 -26 l30 -6 l10 8 v24z" style="fill:${P.portoro}"/><path d="M60 470 l2 -20 l26 -4 l14 10 l-2 14z" style="fill:#2E2A2C"/><path d="M38 444 l6 -18 l24 -2 l8 10 l-4 12z" style="fill:${P.portoro}"/>`, `<path d="M24 470 l4 -26 l30 -6 l10 8 v24z"/><path d="M60 470 l2 -20 l26 -4 l14 10 l-2 14z"/><path d="M38 444 l6 -18 l24 -2 l8 10 l-4 12z"/>`) + veins(28, 440, 36, 28, 81) + veins(64, 448, 34, 20, 83) + veins(42, 426, 30, 18, 85))
    + plant(214, 592, P.portoro, "#6E8A5A");
  return slabs(200, ["#D8D3CA", "#CFCAC0", "#DDD8D0", "#D3CDC4"], "#B3ACA2", 130, 64) + g(`${Array.from({length: 40}, (_, i) => `<circle cx="${f1(R(i + 80)*520)}" cy="${f1(210 + R(i*2 + 80)*400)}" r="${f1(.8 + R(i*3 + 80))}" style="fill:${i % 4 ? "#F6F3EC" : "#5A5550"}"/>`).join("")}`) + wall + bench + table + secret + front + exit("#5A5550");
}

/* ---------- Signora Bianca's Poets' bookshop ---------- */
function booksRoom(){
  const BK = ["#7A2E2E", "#3E5E4A", "#2F4A6E", "#C9A24A", "#E8DCC0", "#6B4430", "#9A5A3E", "#4E6A7A", "#B9533F", "#5A3A6E"];
  const books = (x0, x1, y, seed) => { let s = "", x = x0, i = 0;
    while (x < x1 - 6) { const w = 5 + Math.floor(R(i + seed)*5), h = 24 + Math.floor(R(i*3 + seed)*12), c = BK[Math.floor(R(i*7 + seed)*BK.length)];
      if (R(i*11 + seed) < .07 && x < x1 - 34) { s += `<rect x="${x}" y="${y - 7}" width="30" height="7" style="fill:${c}"/><rect x="${x + 2}" y="${y - 13}" width="26" height="6" style="fill:${BK[(i + 3) % BK.length]}"/>`; x += 32; }
      else { s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" style="fill:${c}"/><path d="M${x + 1} ${y - h + 4} h${w - 2} M${x + 1} ${y - 6} h${w - 2}" style="stroke:${P.gold}" stroke-width=".7" opacity=".7"/>`; x += w + .6; }
      i++; }
    return s; };
  // warm plaster at the left for the portrait; the rest of the wall is books to the ceiling
  const wall = g(`<rect width="520" height="200" style="fill:#F0DDBC"/>${blotch("#F8EAD0", 13, 4)}`) + ceiling()
    // Byron's portrait in a gilt frame, a brass wall light
    + g(sk(`<rect x="30" y="32" width="92" height="112" style="fill:#C9A24A"/><rect x="36" y="38" width="80" height="100" style="fill:#5A4A3E"/><path d="M48 138 q4 -30 28 -32 q24 2 28 32z" style="fill:#2F2B28"/><path d="M68 108 l8 14 l8 -14z" style="fill:#F3EEE6"/><ellipse cx="76" cy="84" rx="12" ry="15" style="fill:#E8C9A8"/><path d="M62 82 q-2 -22 14 -22 q18 0 14 22 q-2 -10 -6 -12 q-8 4 -16 0 q-4 4 -6 12z" style="fill:#3A2A20"/><circle cx="72" cy="84" r="1" style="fill:#2F2B28"/><circle cx="80" cy="84" r="1" style="fill:#2F2B28"/><path d="M73 92 q3 2 6 0" fill="none" style="stroke:#9A5A4A" stroke-width="1"/>`, `<rect x="30" y="32" width="92" height="112"/>`)
      + sk(`<rect x="50" y="150" width="52" height="12" rx="2" style="fill:${P.brass}"/>`, "") + txt(76, 159, "Lord Byron", 7, "#3A2A20", 700))
    + g(sk(`<path d="M128 100 h6 v14 h-6z" style="fill:${P.brass}"/><path d="M131 100 v-8 l-8 -4" fill="none" style="stroke:${P.brass2}" stroke-width="1.6"/><path d="M116 92 q7 -10 14 0z" style="fill:#3E7A5A"/>`, `<path d="M116 92 q7 -10 14 0z"/>`)) + lampGlow(123, 96, 26)
    // floor-to-ceiling bookcases: four shelves of spines, a bust, a globe, a candle, a little plant; the library ladder
    + g(sk(`<rect x="142" y="18" width="364" height="182" style="fill:#4A3428"/><rect x="148" y="24" width="352" height="176" style="fill:#3A2820"/>${[64, 108, 152, 196].map(y => `<rect x="144" y="${y}" width="360" height="6" style="fill:#5A4232"/>`).join("")}${[264, 384].map(x => `<rect x="${x}" y="22" width="6" height="178" style="fill:#5A4232"/>`).join("")}`,
      `<rect x="142" y="18" width="364" height="182"/>`)
      + books(150, 262, 64, 1) + books(272, 382, 64, 2) + books(392, 498, 64, 3)
      + books(150, 230, 108, 4) + `<ellipse cx="248" cy="84" rx="8" ry="10" style="fill:#EDE6D6"/><path d="M238 108 q0 -16 10 -16 q10 0 10 16z" style="fill:#EDE6D6"/>` + books(272, 382, 108, 5) + books(392, 458, 108, 6) + `<circle cx="478" cy="90" r="12" style="fill:#7FA3B8"/><path d="M468 86 q6 -4 10 2 q6 4 12 -2 M470 96 q8 2 14 -2" fill="none" style="stroke:#7E9A5A" stroke-width="3"/><path d="M478 102 v6 M470 108 h16" style="stroke:${P.brass}" stroke-width="2"/>`
      + books(150, 262, 152, 7) + books(272, 344, 152, 8) + `<rect x="352" y="132" width="10" height="20" style="fill:#F3EEE6"/><path d="M357 132 q-2 -4 0 -7 q2 3 0 7" style="fill:#F6B23A"/><path d="M366 152 h12 l-2 -10 h-8z" style="fill:#C47A55"/><circle cx="372" cy="138" r="6" style="fill:#5E8A4A"/>` + books(392, 498, 152, 9)
      + books(150, 262, 196, 10) + books(272, 382, 196, 11) + books(392, 498, 196, 12))
    + g(sk(`<path d="M418 22 L432 22 L452 200 L438 200z" fill="none" style="stroke:${P.pale}" stroke-width="3"/>${Array.from({length: 8}, (_, k) => `<path d="M${421 + k*2.4} ${42 + k*21} h14" style="stroke:${P.pale}" stroke-width="2.4"/>`).join("")}<path d="M410 22 h30" style="stroke:${P.brass}" stroke-width="2.4"/>`, `<path d="M418 22 L438 200 M432 22 L452 200"/>`))
    // the shop's board, hung on little chains in front of the top shelf
    + g(`<path d="M246 14 v12 M394 14 v12" style="stroke:#5A5550" stroke-width="1"/>` + sk(`<rect x="230" y="26" width="180" height="22" rx="3" style="fill:#F3E7C8"/>`, `<rect x="230" y="26" width="180" height="22" rx="3"/>`) + txt(320, 41, "THE POETS' BOOKSHOP", 10.5, "#5A2E24", 700));
  // Byron's armchair (the touch): red velvet wings, a side table with a cup and an open book, a standing lamp
  const chairArt = spot("pvbyron", 94, 372, "The old armchair under Byron", hovE(88, 358, 66, 12),
    sk(`<path d="M30 336 v-62 q0 -26 18 -28 h46 q18 2 18 28 v62z" style="fill:#8A2E2E"/><path d="M40 332 v-56 q0 -16 10 -18 h42 q10 2 10 18 v56z" style="fill:#A03A3A"/><rect x="40" y="300" width="62" height="16" rx="5" style="fill:#B84848"/><rect x="24" y="290" width="18" height="46" rx="6" style="fill:#7A2626"/><rect x="100" y="290" width="18" height="46" rx="6" style="fill:#7A2626"/><path d="M36 336 v6 M106 336 v6" style="stroke:${P.wood2}" stroke-width="4"/>
      <rect x="122" y="300" width="28" height="6" rx="1" style="fill:${P.wood}"/><path d="M126 306 v32 M146 306 v32" style="stroke:${P.wood2}" stroke-width="2.6"/><rect x="126" y="294" width="10" height="6" rx="1" style="fill:#FFFDF6"/><path d="M136 296 q3 0 3 2 q0 2 -3 2" fill="none" style="stroke:#FFFDF6" stroke-width="1"/><path d="M138 300 l6 -4 l6 4z" style="fill:#2F4A6E"/>
      <path d="M140 300 V236" style="stroke:${P.brass2}" stroke-width="2"/><path d="M128 236 l6 -16 h12 l6 16z" style="fill:#E8D3A0"/>`,
      `<path d="M30 336 v-62 q0 -26 18 -28 h46 q18 2 18 28 v62z"/><path d="M128 236 l6 -16 h12 l6 16z"/>`)
    + lampGlow(140, 232, 30) + lab(88, 358, "Byron's armchair", "#F6D2C0", 9));
  // the visitors' book on its stand: open, a pen and an inkpot
  const verse = spot("pvverse", 208, 372, "Write a line in the visitors' book", hovE(208, 358, 52, 12),
    sk(`<path d="M206 340 v-36 M194 340 h24" style="stroke:${P.wood2}" stroke-width="4"/><path d="M184 304 l6 -22 h36 l6 22z" style="fill:${P.wood}"/><path d="M190 300 l4 -16 h13 v16z" style="fill:#FBF8F0"/><path d="M209 300 v-16 h13 l4 16z" style="fill:#FBF8F0"/>${[0, 1, 2, 3].map(k => `<path d="M${196 + k*.8} ${289 + k*3} h9 M${212} ${289 + k*3} h${9 - k}" style="stroke:#8E8374" stroke-width=".6"/>`).join("")}<path d="M220 294 l10 -16" style="stroke:#2F2B28" stroke-width="1.4"/><rect x="226" y="296" width="6" height="6" rx="1" style="fill:#2F4A6E"/>`,
      `<path d="M184 304 l6 -22 h36 l6 22z"/>`)
    + lab(208, 358, "Visitors' book", "#CFE0EE", 9));
  // the counter: an old brass till, a pile of new books, a jug of wild broom, a dish of bookmarks
  const counter = spot("pv_books", 356, 388, "Signora Bianca's counter", hovE(356, 370, 100, 16),
    sk(`<rect x="262" y="286" width="190" height="58" rx="2" style="fill:#5A4232"/>${[0, 1, 2, 3].map(k => `<rect x="${268 + k*46}" y="294" width="40" height="42" fill="none" style="stroke:#3E2E24" stroke-width="1.4"/>`).join("")}<rect x="258" y="278" width="198" height="10" rx="2" style="fill:#7A5A44"/>
      <path d="M272 278 l5 -24 h36 l5 24z" style="fill:${P.brass}"/><rect x="280" y="246" width="30" height="10" rx="2" style="fill:${P.brass2}"/><rect x="285" y="248" width="20" height="6" style="fill:#FFF6DC"/>${Array.from({length: 8}, (_, k) => `<circle cx="${282 + (k % 4)*9}" cy="${264 + Math.floor(k/4)*7}" r="2.2" style="fill:#FFFDF6"/>`).join("")}
      ${[0, 1, 2, 3, 4].map(k => `<rect x="${332 + (k % 2)*2}" y="${270 - k*5}" width="34" height="5" style="fill:${BK[k + 2]}"/>`).join("")}${[0, 1, 2].map(k => `<rect x="${372 + (k % 2)*2}" y="${270 - k*6}" width="28" height="6" style="fill:${BK[k + 5]}"/>`).join("")}
      <path d="M416 278 l-4 -18 h20 l-4 18z" style="fill:#F3EEE6"/><path d="M412 262 h20" style="stroke:#2F4A6E" stroke-width="2"/>${[[414, 246], [420, 240], [426, 244], [432, 250], [410, 252], [422, 250]].map(([x, y]) => `<path d="M422 260 L${x} ${y}" style="stroke:#5E8A3A" stroke-width="1"/><circle cx="${x}" cy="${y}" r="2.6" style="fill:#F3D34A"/>`).join("")}<ellipse cx="444" cy="276" rx="9" ry="3" style="fill:#F3EEE6"/>${[0, 1, 2].map(k => `<rect x="${438 + k*4}" y="${266}" width="3" height="10" style="fill:${BK[k*3]}"/>`).join("")}`,
      `<rect x="262" y="286" width="190" height="58" rx="2"/><rect x="258" y="278" width="198" height="10" rx="2"/>`)
    + txt(356, 330, "POEMS OF THE GULF", 7, P.gold, 700) + lab(356, 370, "Bookshop counter", "#F6E3B4", 10));
  // the left: a standing globe; the front left: a table of books of the sea; the front right: crates of second-hand books and a sleeping cat; a postcard spinner
  const globe = g(sk(`<path d="M52 456 v-16 M40 458 h24" style="stroke:${P.wood2}" stroke-width="3"/><path d="M28 412 a24 24 0 0 1 48 0" fill="none" style="stroke:${P.brass2}" stroke-width="2"/><circle cx="52" cy="414" r="22" style="fill:#C9B07A"/><path d="M36 404 q8 -8 16 0 q4 10 -4 14 q-6 -6 -12 -14z M58 400 q10 2 12 12 q-6 8 -12 4 q2 -8 0 -16z" style="fill:#7E9A5A"/><path d="M52 436 v4" style="stroke:${P.brass2}" stroke-width="2"/>`, `<circle cx="52" cy="414" r="22"/>`));
  const spinner = g(sk(`<path d="M480 452 v-90 M470 452 h20" style="stroke:#5A5550" stroke-width="2.4"/>${[0, 1, 2, 3].map(k => `<rect x="${466 + (k % 2)*14}" y="${364 + Math.floor(k/2)*0 + k*20}" width="12" height="16" style="fill:${["#4E9EA0", "#E3B467", "#E59A7E", "#7FA3B8"][k]}"/><rect x="${468 + (k % 2)*14}" y="${366 + k*20}" width="8" height="6" style="fill:#FFFDF6"/>`).join("")}`, `<path d="M480 452 v-90"/>`));
  const bookTable = g(sk(`<rect x="28" y="500" width="124" height="10" rx="2" style="fill:${P.wood}"/><path d="M36 510 v52 M144 510 v52" style="stroke:${P.wood2}" stroke-width="4"/>${[[40, 6], [74, 4], [108, 5]].map(([x, n], j) => Array.from({length: n}, (_, k) => `<rect x="${x + (k % 2)*2}" y="${494 - k*6}" width="30" height="6" style="fill:${BK[(k + j*3) % BK.length]}"/>`).join("")).join("")}<path d="M138 500 l-6 -16 h16z" style="fill:#FFFDF6"/>`, `<rect x="28" y="500" width="124" height="10" rx="2"/>`))
    + txt(84, 526, "BOOKS OF THE SEA", 6.5, "#5A3A2E", 700) + plant(40, 592, "#C47A55") + plant(170, 592, "#3E7A5A");
  const crates = g(crate(384, 548, 56, 40, "#C9A27E", Array.from({length: 7}, (_, k) => `<rect x="${388 + k*7}" y="${530 + (k % 3)*2}" width="6" height="${18 - (k % 3)*2}" style="fill:${BK[k % BK.length]}"/>`).join("")) + crate(440, 548, 54, 40, "#B08A68", Array.from({length: 7}, (_, k) => `<rect x="${444 + k*7}" y="${532 + (k % 2)*3}" width="6" height="${16 - (k % 2)*3}" style="fill:${BK[(k + 4) % BK.length]}"/>`).join(""))
    + txt(412, 576, "SECOND-HAND", 5.5, "#5A3A2E", 700) + txt(467, 576, "EACH €2", 6, "#5A3A2E", 700)
    + `<g transform="translate(0 16)">` + sk(`<rect x="434" y="514" width="54" height="12" rx="5" style="fill:#7A3E5A"/><ellipse cx="458" cy="508" rx="20" ry="10" style="fill:#E8963A"/><circle cx="476" cy="506" r="8" style="fill:#E8963A"/><path d="M471 500 l2 -7 l4 5z M478 499 l4 -6 l1 7z" style="fill:#E8963A"/><path d="M472 507 q2 1 4 0 M478 507 q2 1 4 0" fill="none" style="stroke:#5A3A20" stroke-width=".9"/><path d="M440 512 q-4 -8 6 -8 q10 4 22 2" fill="none" style="stroke:#F6B86A" stroke-width="3"/><path d="M448 502 q4 -3 8 1 M456 500 q4 -3 8 1" style="stroke:#C2702A" stroke-width="1.2" fill="none"/>`, `<rect x="434" y="514" width="54" height="12" rx="5"/><ellipse cx="458" cy="508" rx="20" ry="10"/>`) + `</g>`)
    + plant(366, 592, "#C47A55");
  const rug = g(`<rect x="170" y="400" width="190" height="88" rx="4" style="fill:#3E5E4A" opacity=".5"/><rect x="180" y="408" width="170" height="72" rx="3" fill="none" style="stroke:#E8C9A0" stroke-width="2" opacity=".6"/><path d="M200 444 l14 -12 l14 12 l-14 12z M246 444 l14 -12 l14 12 l-14 12z M292 444 l14 -12 l14 12 l-14 12z" fill="none" style="stroke:#C9A24A" stroke-width="1.6" opacity=".55"/>`);
  return cottoHex(200) + rug + wall + chairArt + verse + counter + globe + spinner + bookTable + crates + exit("#5A2E24");
}

/* ---------- Signora Lia's seashell shop ---------- */
function shellsRoom(){
  // sea-glass plaster, a white wainscot with a painted wave, a frieze of little scallop arcs under the beam
  const wall = g(`<rect width="520" height="200" style="fill:#CDE7E3"/>${blotch("#E2F2EF", 21, 6)}<path d="M0 26 ${Array.from({length: 27}, () => "q10 -10 20 0").join(" ")}" fill="none" style="stroke:#FFFDF6" stroke-width="2"/><rect y="150" width="520" height="50" style="fill:#F7F2E8"/><path d="M0 162 ${Array.from({length: 26}, () => "q5 -6 10 0 q5 6 10 0").join(" ")}" fill="none" style="stroke:#7FB8B4" stroke-width="2"/><rect y="148" width="520" height="4" style="fill:#B9D6D2"/>`) + ceiling()
    // the right wall: two wreaths, a garland between, a shelf of shell-covered boxes and a shelf of little shell boats
    + wreath(386, 64, 22, 1, "#E59A7E") + wreath(476, 64, 22, 4, "#4E9EA0") + garland(352, 40, 510, 40, 14, 3, 12)
    + shelf(352, 124, 154, shellBox(358, 124, 30, 18, "#F3D9C8", 1) + shellBox(394, 124, 22, 24, "#BFDCE0", 2) + shellBox(422, 124, 34, 14, "#F6EFE2", 3) + shellBox(462, 124, 18, 20, "#E8C9D8", 4) + shellBox(484, 124, 18, 12, "#F3E3B4", 5), "#C9B48E")
    + shelf(352, 176, 154, shellBoat(370, 176, 1, "#3E7A9A") + shellBoat(406, 176, .85, "#D9433A") + shellBoat(440, 176, 1, "#E3B467") + shellBoat(476, 176, .9, "#3F6E4C") + shellBoat(498, 176, .6, "#E59A7E"), "#C9B48E")
    // the centre: the sign, a garland, the great sunburst mirror of shells, two little mirrors and two shell frames
    + g(sk(`<rect x="190" y="22" width="148" height="22" rx="11" style="fill:#FFFDF6"/>`, `<rect x="190" y="22" width="148" height="22" rx="11"/>`) + txt(264, 37, "SIGNORA LIA'S SHELLS", 9.5, "#2F6E74", 700) + shell("scallop", 196, 34, .6, -90, "#F0B9A0") + shell("scallop", 332, 34, .6, 90, "#F0B9A0"))
    + g(shellMirror(264, 104, 30, 0)) + g(shellMirror(208, 70, 13, 2) + shellMirror(320, 70, 13, 5))
    + g([[188, 100], [306, 100]].map(([x, y], k) => sk(`<rect x="${x}" y="${y}" width="34" height="44" style="fill:#EFE6D6"/>${Array.from({length: 14}, (_, j) => { const per = 2*(30 + 40), d = j/14*per, px = d < 30 ? x + 2 + d : d < 70 ? x + 32 : d < 100 ? x + 32 - (d - 70) : x + 2, py = d < 30 ? y + 2 : d < 70 ? y + 2 + (d - 30) : d < 100 ? y + 42 : y + 42 - (d - 100);
      return shell(TYPES[(j + k) % TYPES.length], px, py, .42, j*30, SHC[(j + k*3) % SHC.length]); }).join("")}<rect x="${x + 7}" y="${y + 7}" width="20" height="30" style="fill:${k ? "#BFDCE0" : "#F3D9C8"}"/>${k ? `<path d="M${x + 7} ${y + 26} q5 -3 10 0 q5 3 10 0 V${y + 37} H${x + 7}z" style="fill:#4E9EA0"/><path d="M${x + 12} ${y + 24} l3 -10 l5 10z" style="fill:#FFFDF6"/>` : `${shell("star", x + 17, y + 22, .8, 10, "#E3A989")}`}`, `<rect x="${x}" y="${y}" width="34" height="44"/>`)).join(""))
  // shell mobiles turning from the beam (hung in front of the shell wall)
  const hang = mobile(58, 22, 54, 1, 26) + mobile(150, 22, 40, 5, 22) + mobile(346, 36, 30, 3, 70) + mobile(206, 140, 40, 11, 74, 1.35) + mobile(452, 150, 40, 13, 66, 1.35)
    + garland(0, 16, 180, 16, 7, 2, 14)
    // a capiz-shell lamp between the wreaths
    + g(`<path d="M431 14 V44" style="stroke:#8E8374" stroke-width=".8"/>${Array.from({length: 5}, (_, r) => Array.from({length: 7 - r}, (_, k) => `<circle cx="${419 + k*4 + r*2}" cy="${48 + r*5}" r="3" style="fill:#F6EFE2;stroke:#C9B48E" stroke-width=".5"/>`).join("")).join("")}`) + lampGlow(431, 58, 34);
  // the shell wall (the touch): the whole left wall set with shells in patterns
  const swX = 14, swY = 22, swW = 166, swH = 174, cx = swX + swW/2, cy = swY + swH/2 + 4;
  let sw = `<rect x="${swX}" y="${swY}" width="${swW}" height="${swH}" style="fill:#EADBC2"/>`;
  // a lattice of little white limpets and pink cowries
  for (let r = 0; r < 12; r++) for (let c = 0; c < 11; c++) { const x = swX + 10 + c*15 + (r % 2)*7.5, y = swY + 52 + r*9; if (y > swY + swH - 30) continue; sw += shell(r % 2 ? "cowrie" : "limpet", x, y, .55, r % 2 ? 0 : 0, r % 2 ? "#F0B9A0" : "#FFFDF6"); }
  // herringbone rows of mussel shells at the top and bottom
  for (const yy of [swY + 14, swY + 32, swY + swH - 14]) for (let c = 0; c < 15; c++) sw += mussel(swX + 8 + c*11, yy, .7, (c % 2 ? 35 : -35) + 90);
  // the medallion: rings of scallops round a starfish
  sw += `<circle cx="${cx}" cy="${cy}" r="48" style="fill:#F3E7D3"/>`;
  sw += Array.from({length: 16}, (_, k) => { const a = k/16*Math.PI*2; return shell("scallop", cx + Math.cos(a)*40, cy + Math.sin(a)*40, .75, a*57.3 + 90, k % 2 ? "#F0B9A0" : "#F6E6C8"); }).join("");
  sw += Array.from({length: 10}, (_, k) => { const a = k/10*Math.PI*2; return shell("whelk", cx + Math.cos(a)*24, cy + Math.sin(a)*24, .6, a*57.3 + 90, "#E3A989"); }).join("");
  sw += shell("star", cx, cy, 1.4, 0, "#E8823A") + [[swX + 14, swY + 46], [swX + swW - 14, swY + 46], [swX + 14, swY + swH - 30], [swX + swW - 14, swY + swH - 30]].map(([x, y]) => shell("star", x, y, .9, 15, "#E3A989")).join("");
  sw += `<rect x="${swX}" y="${swY}" width="${swW}" height="${swH}" fill="none" style="stroke:#C9B48E" stroke-width="4"/>`;
  const baskets = g(basket(38, 248, 42, 22, 9, 2) + basket(86, 246, 38, 26, 8, 6) + basket(132, 248, 44, 20, 10, 11) + basket(166, 250, 22, 14, 4, 15));
  const shellWall = spot("pvshellwall", 112, 284, "The wall of shells", hovE(98, 272, 62, 12), sk(sw, `<rect x="${swX}" y="${swY}" width="${swW}" height="${swH}"/><circle cx="${cx}" cy="${cy}" r="48"/>`) + baskets + lab(98, 272, "The shell wall", "#CFE0EE", 9));
  // the counter: white wood set with scallops, a glass top of shell necklaces, a big conch, a jar of tiny shells, the cash tin, a boat
  const counter = spot("pv_shells", 330, 388, "Signora Lia's counter", hovE(330, 370, 104, 16),
    sk(`<rect x="236" y="286" width="190" height="58" rx="3" style="fill:#F7F2E8"/>${Array.from({length: 11}, (_, k) => shell("scallop", 246 + k*17, 316, .85, 0, SHC[k % 5])).join("")}${Array.from({length: 22}, (_, k) => shell("limpet", 242 + k*8.6, 338, .4, 0, k % 2 ? "#FFFDF6" : "#F0B9A0")).join("")}<path d="M238 298 H424" style="stroke:#C9B48E" stroke-width="2" stroke-dasharray="4 2"/><rect x="232" y="276" width="198" height="11" rx="2" style="fill:#BFDCE0"/>${Array.from({length: 3}, (_, k) => `<path d="M${250 + k*58} 281 q14 5 28 0" fill="none" style="stroke:${["#F0B9A0", "#FFFDF6", "#E3A989"][k]}" stroke-width="2" stroke-dasharray="2 1.4"/>`).join("")}
      <path d="M244 276 q-4 -18 12 -24 q18 -2 22 10 q-2 12 -18 14z" style="fill:#F3C9A8"/><path d="M250 270 q8 -14 22 -6" fill="none" style="stroke:#C97A5A" stroke-width="1.2"/><path d="M262 276 q8 -2 14 -10" fill="none" style="stroke:#E8A08A" stroke-width="2"/>
      ${shellBoat(300, 276, .9, "#3E7A9A")}<rect x="322" y="252" width="18" height="24" rx="4" style="fill:#DDEBF0" opacity=".85"/>${heap(331, 274, 14, 8, 21, .35)}${heap(331, 266, 12, 6, 23, .35)}<rect x="321" y="249" width="20" height="5" rx="2" style="fill:#C9B48E"/>
      <rect x="350" y="260" width="30" height="16" rx="3" style="fill:#4E9EA0"/><path d="M350 266 h30" style="stroke:#2F6E74" stroke-width="1.4"/>${shell("scallop", 365, 268, .5, 0, "#FFFDF6")}<path d="M392 276 v-14" style="stroke:#C9B48E" stroke-width="2"/><ellipse cx="392" cy="276" rx="8" ry="2" style="fill:#C9B48E"/><path d="M380 262 q12 -22 24 0z" style="fill:#F6E6C8"/>${[0, 1, 2, 3].map(k => `<path d="M${384 + k*5} 262 l${1 - k*.6} -14" style="stroke:#E3A989" stroke-width=".8"/>`).join("")}
      ${shell("star", 414, 272, .8, 12, "#E8823A")}`,
      `<rect x="236" y="286" width="190" height="58" rx="3"/><rect x="232" y="276" width="198" height="11" rx="2"/>`)
    + garland(236, 292, 426, 292, 5, 5, 16) + lampGlow(392, 258, 22) + lab(330, 370, "Lia's counter", "#F6D2C0", 10));
  // the left: a tall white cabinet of shell boxes behind glass, more boxes on top
  const cabinet = g(sk(`<rect x="20" y="324" width="80" height="118" rx="2" style="fill:#F7F2E8"/><rect x="26" y="330" width="68" height="76" style="fill:#DDEBF0" opacity=".85"/><path d="M60 330 v76 M26 368 h68" style="stroke:#F7F2E8" stroke-width="2.4"/><rect x="26" y="412" width="68" height="24" style="fill:#EFE6D6"/><circle cx="54" cy="424" r="2" style="fill:${P.brass}"/><circle cx="66" cy="424" r="2" style="fill:${P.brass}"/>`, `<rect x="20" y="324" width="80" height="118" rx="2"/>`)
    + shellBox(30, 366, 24, 16, "#F3D9C8", 6) + shellBox(64, 366, 24, 22, "#BFDCE0", 7) + shellBox(30, 404, 22, 14, "#E8C9D8", 8) + shellBox(64, 404, 26, 18, "#F6EFE2", 9)
    + shellBox(26, 324, 26, 14, "#F3E3B4", 10) + shellBox(58, 324, 20, 22, "#BFDCE0", 11) + shell("whelk", 90, 318, 1, 10, "#F3C9A8"));
  // the right: a stand hung with garlands and little mirrors
  const stand = g(sk(`<path d="M446 446 l8 -150 M494 446 l-8 -150 M450 340 h40 M448 392 h44" style="stroke:${P.pale}" stroke-width="4"/><path d="M444 446 h54" style="stroke:${P.wood}" stroke-width="4"/>`, `<path d="M446 446 l8 -150 M494 446 l-8 -150"/>`)
    + garland(454, 300, 486, 300, 16, 1, 7) + garland(450, 342, 490, 342, 16, 4, 8) + garland(448, 394, 492, 394, 14, 7, 8) + shellMirror(470, 428, 9, 3) + shell("star", 470, 290, 1, 0, "#E3A989"));
  // the front left: a round table of little boats and a wreath, baskets of loose shells on the floor
  const tableL = g(sk(`<path d="M80 534 v40 M66 574 h28" style="stroke:${P.wood2}" stroke-width="3"/><ellipse cx="80" cy="526" rx="56" ry="13" style="fill:#F7F2E8"/><path d="M24 526 q0 14 10 16 h92 q10 -2 10 -16" style="fill:#F7F2E8"/><path d="M28 534 ${Array.from({length: 10}, () => "q5 5 10 0").join(" ")}" fill="none" style="stroke:#7FB8B4" stroke-width="1.6"/>`, `<ellipse cx="80" cy="526" rx="56" ry="13"/>`)
    + shellBox(36, 526, 20, 14, "#F3D9C8", 12) + shellBoat(70, 524, 1, "#D9433A") + shellBoat(98, 520, 1.1, "#3E7A9A") + wreath(126, 504, 11, 6, "#4E9EA0"))
    + g(basket(42, 594, 36, 20, 8, 31) + basket(140, 594, 40, 22, 9, 35) + basket(178, 594, 26, 14, 5, 39));
  // the front right: a big basket of scallops, a crate of starfish, a succulent in a giant clam
  const right = g(basket(398, 592, 62, 30, 14, 41) + crate(436, 548, 56, 40, "#C9A27E", Array.from({length: 6}, (_, k) => shell("star", 444 + (k % 3)*18, 544 - Math.floor(k/3)*8, .75, k*20, ["#E8823A", "#E3A989", "#F0B9A0"][k % 3])).join("")) + txt(464, 580, "STARFISH", 6.5, "#5A3A2E", 700)
    + sk(`${[-16, -8, 0, 8, 16].map((d, k) => `<ellipse cx="${372 + d}" cy="${544 - (k % 2)*6}" rx="5" ry="11" transform="rotate(${d*2} ${372 + d} ${544 - (k % 2)*6})" style="fill:#7FA38A"/>`).join("")}<path d="M340 556 ${Array.from({length: 8}, () => "q2 -5 8 0").join(" ")} q-6 36 -32 36 q-26 0 -32 -36z" style="fill:#F6EFE2"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${344 + k*8} 558 Q372 ${590 - Math.abs(3 - k)*2} 372 590" fill="none" style="stroke:#D9C9B0" stroke-width="1.2"/>`).join("")}<path d="M352 592 h40" style="stroke:#C9B48E" stroke-width="3"/>`, `<path d="M340 556 q34 6 64 0 q-6 36 -32 36 q-26 0 -32 -36z"/>`));
  return terrazzo(200, "#F4E6DA", ["#F0B9A0", "#FFFDF6", "#C9C2B2", "#E3A989", "#BFDCE0", "#F6E6C8"], "#C9A27E", 7) + wall + shellWall + hang + counter + cabinet + stand + tableL + right + exit("#2F6E74");
}

/* ---------- San Pietro ---------- */
function churchRoom(){
  const DK = "#2B2A2E", LT = "#E9E4D8";
  const stripes = (x, y, w, h, a = DK, b = LT, band = 12) => Array.from({length: Math.ceil(h/band)}, (_, k) => `<rect x="${x}" y="${y + k*band}" width="${w}" height="${Math.min(band, h - k*band)}" style="fill:${k % 2 ? a : b}"/>`).join("");
  // a pointed arch from x0 to x1, springing at ys, standing on yb
  const arch = (x0, x1, ys, yb) => { const w = x1 - x0, r = w*.78; return `M${x0} ${yb} V${ys} A${f1(r)} ${f1(r)} 0 0 1 ${(x0 + x1)/2} ${f1(ys - Math.sqrt(r*r - (r - w/2)**2))} A${f1(r)} ${f1(r)} 0 0 1 ${x1} ${ys} V${yb}z`; };
  const A = [[34, 146], [194, 326], [374, 486]], ys = 104;
  const defs = `<defs>${A.map(([a, b], k) => `<clipPath id="pvArch${k}"><path d="${arch(a, b, ys, 200)}"/></clipPath>`).join("")}</defs>`;
  const wall = g(stripes(0, 0, 520, 200)) + g(`<rect width="520" height="10" style="fill:#1E1D20"/>`)
    // the three arches: deep recesses in darker stripes, each edged with black-and-white voussoirs
    + A.map(([a, b], k) => g(`<g clip-path="url(#pvArch${k})">${k === 2 ? seaView(a, 20, b - a, 180, `<path d="M${a} 168 L${a + 20} 150 L${a + 44} 160 L${a + 60} 146 L${b} 156 V200 H${a}z" style="fill:#4A4A50"/><path d="M${a + 66} 120 l4 6 h14 l4 -6z" style="fill:#F3EEE6"/><path d="M${a + 74} 120 v-10 l8 10z" style="fill:#F6EFE2"/><path d="M${a + 30} 70 q4 -4 8 0 q4 -4 8 0" fill="none" style="stroke:#3A3430" stroke-width="1.1"/>`) : stripes(a, 0, b - a, 200, "#1E1D20", "#BDB7AA")}</g>`)
      + sk(``, `<path d="${arch(a, b, ys, 200)}"/>`)
      + `<path d="${arch(a - 6, b + 6, ys, 200).replace(/V200z$/, "")}" fill="none" style="stroke:${LT}" stroke-width="10"/><path d="${arch(a - 6, b + 6, ys, 200).replace(/V200z$/, "")}" fill="none" style="stroke:${DK}" stroke-width="10" stroke-dasharray="9 9"/>`).join("")
    // in the left arch, the little organ; in the middle, a round window and a plain wooden cross; the right arch is open to the sea
    + g(sk(`<rect x="46" y="150" width="88" height="50" style="fill:#5A3A2A"/>${Array.from({length: 11}, (_, k) => { const h = 30 + Math.abs(5 - k)*-4 + 26; return `<rect x="${50 + k*7.6}" y="${150 - h}" width="5.4" height="${h}" rx="2.4" style="fill:#B9BFC3"/><path d="M${50 + k*7.6} ${144} h5.4" style="stroke:#3A3430" stroke-width="1"/>`; }).join("")}<rect x="54" y="168" width="72" height="8" style="fill:#F3EEE6"/>${Array.from({length: 9}, (_, k) => `<path d="M${58 + k*8} 168 v5" style="stroke:#2F2B28" stroke-width="2"/>`).join("")}`, `<rect x="46" y="150" width="88" height="50"/>`))
    + g(sk(`<circle cx="260" cy="58" r="16" style="fill:#7FB8C9"/><path d="M260 42 v32 M244 58 h32" style="stroke:${DK}" stroke-width="2"/><circle cx="260" cy="58" r="16" fill="none" style="stroke:${LT}" stroke-width="4"/>`, `<circle cx="260" cy="58" r="18"/>`))
    + g(sk(`<rect x="257" y="88" width="6" height="56" style="fill:${P.wood}"/><rect x="242" y="102" width="36" height="6" style="fill:${P.wood}"/>`, `<rect x="257" y="88" width="6" height="56"/><rect x="242" y="102" width="36" height="6"/>`))
    // the hymn board on the pillar by the choir
    + g(sk(`<rect x="154" y="112" width="32" height="50" rx="2" style="fill:#3A2820"/>`, `<rect x="154" y="112" width="32" height="50" rx="2"/>`) + ["14", "27", "52"].map((n, k) => txt(170, 127 + k*14, n, 10, "#FFFDF6", 700)).join(""))
    + g(`<path d="M344 10 v80" style="stroke:#2F2B28" stroke-width="1.2"/><path d="M336 90 h16 l-3 10 h-10z" style="fill:#2F2B28"/><ellipse cx="344" cy="103" rx="4" ry="5" style="fill:#FFE3A3"/>`) + lampGlow(344, 104, 26)
    // the shaft of sea light across the floor
    + `<g pointer-events="none"><path d="M374 200 L486 200 L470 600 L270 600z" fill="#FFFFFF" opacity=".09"/></g>`;
  // the altar on its step: a white cloth, two candles, white lilies
  const altar = g(sk(`<rect x="196" y="236" width="128" height="22" style="fill:#C9C2B2"/><rect x="210" y="206" width="100" height="32" style="fill:#E9E4D8"/><rect x="206" y="202" width="108" height="8" style="fill:#FFFDF6"/><path d="M214 210 v18 M306 210 v18" style="stroke:#FFFDF6" stroke-width="3"/><path d="M252 214 h16 M260 208 v14" style="stroke:${P.gold}" stroke-width="2"/>
    ${[222, 298].map(x => `<rect x="${x - 2}" y="184" width="4" height="18" style="fill:#FFFDF6"/><path d="M${x} 184 q-2 -4 0 -7 q2 3 0 7" style="fill:#F6B23A"/><rect x="${x - 4}" y="200" width="8" height="3" style="fill:${P.brass}"/>`).join("")}
    <path d="M254 202 l-3 -12 h18 l-3 12z" style="fill:#7FB8C9"/>${[[252, 180], [260, 174], [268, 180], [256, 184], [264, 186]].map(([x, y]) => `<path d="M260 190 L${x} ${y}" style="stroke:#5E8A4A" stroke-width="1"/><path d="M${x} ${y} l-3 -4 l3 1 l3 -1z" style="fill:#FFFDF6"/>`).join("")}`, `<rect x="196" y="236" width="128" height="22"/><rect x="210" y="206" width="100" height="32"/>`))
    + lampGlow(222, 182, 18) + lampGlow(298, 182, 18);
  // the sea window (the touch): the stone step under the open arch
  const win = spot("pvwindow", 430, 286, "The window over the sea", hovE(430, 270, 58, 12),
    sk(`<rect x="368" y="200" width="124" height="14" style="fill:#C9C2B2"/><rect x="372" y="214" width="116" height="20" style="fill:#B3ACA2"/>`, `<rect x="368" y="200" width="124" height="14"/><rect x="372" y="214" width="116" height="20"/>`) + lab(430, 270, "The sea window", "#CFE0EE", 9));
  // the choir stalls: two tiers of carved dark wood with pointed backs, hymn books open on the desks
  const choir = spot("pvchoir", 214, 418, "Sit in on the choir rehearsal", hovE(84, 404, 60, 12),
    sk(`<rect x="20" y="240" width="124" height="70" style="fill:#2F2018"/>${Array.from({length: 7}, (_, k) => `<path d="M${22 + k*20} 240 l4 -10 l4 10z" style="fill:#7A5A40"/>`).join("")}<rect x="18" y="238" width="128" height="5" style="fill:#7A5A40"/>
      ${Array.from({length: 5}, (_, k) => `<path d="M${25 + k*24} 300 v-36 l10 -14 l10 14 v36z" style="fill:#8A6A4E"/><path d="M${29 + k*24} 298 v-30 l6 -9 l6 9 v30z" style="fill:#5A4232"/><circle cx="${35 + k*24}" cy="276" r="3" fill="none" style="stroke:#B08A68" stroke-width="1"/>`).join("")}<rect x="20" y="298" width="124" height="7" style="fill:#8A2E2E"/><rect x="16" y="304" width="132" height="8" style="fill:#7A5A40"/>
      <rect x="20" y="318" width="124" height="64" style="fill:#5A4232"/>${Array.from({length: 4}, (_, k) => `<rect x="${26 + k*30}" y="330" width="24" height="46" style="fill:#4A3428"/><circle cx="${38 + k*30}" cy="344" r="6" fill="none" style="stroke:#B08A68" stroke-width="1.4"/><path d="M${38 + k*30} 338 v12 M${32 + k*30} 344 h12" style="stroke:#B08A68" stroke-width="1"/><path d="M${30 + k*30} 360 h16 M${30 + k*30} 368 h16" style="stroke:#3A2820" stroke-width="1"/>`).join("")}<path d="M14 324 h136 l-6 -12 h-124z" style="fill:#8A6A4E"/>
      ${[38, 72, 106, 132].map(x => `<path d="M${x - 10} 314 l10 -4 l10 4 l-10 4z" style="fill:#FBF8F0"/><path d="M${x} 310 v8" style="stroke:#8E8374" stroke-width=".7"/><path d="M${x - 7} 313 h5 M${x + 2} 313 h5" style="stroke:#8E8374" stroke-width=".5"/>`).join("")}
      <path d="M162 382 v-50 M154 382 h16" style="stroke:#2F2B28" stroke-width="2"/><path d="M150 332 l12 -8 l12 8z" style="fill:#2F2B28"/><rect x="153" y="320" width="18" height="11" style="fill:#FBF8F0" transform="rotate(-10 162 325)"/><path d="M156 324 h12 M156 327 h10" style="stroke:#8E8374" stroke-width=".5" transform="rotate(-10 162 325)"/>`,
      `<rect x="20" y="240" width="124" height="70"/><rect x="20" y="318" width="124" height="64"/><path d="M14 324 h136 l-6 -12 h-124z"/>`)
    + lab(84, 404, "Choir stalls", "#E8D3BC", 9));
  // the candle stand (the touch): an iron rack of votive candles, the little box for coins
  const candles = spot("pvcandles", 432, 492, "Light a candle", hovE(444, 478, 46, 12),
    sk(`<path d="M414 462 v-62 M474 462 v-62 M408 462 h72" style="stroke:#2F2B28" stroke-width="3"/>${[0, 1, 2].map(r => `<path d="M${408 + r*4} ${448 - r*18} h${72 - r*8}" style="stroke:#2F2B28" stroke-width="4"/>${Array.from({length: 7 - r}, (_, k) => `<rect x="${414 + r*4 + k*10}" y="${438 - r*18}" width="6" height="9" style="fill:#FBF8F0"/><path d="M${417 + r*4 + k*10} ${437 - r*18} q-2 -4 0 -7 q2 3 0 7" style="fill:#F6B23A"/>`).join("")}`).join("")}<rect x="430" y="384" width="28" height="16" rx="2" style="fill:#5A4232"/><path d="M438 388 h12" style="stroke:#2F2B28" stroke-width="2"/>`,
      `<path d="M414 462 v-62 M474 462 v-62"/>`)
    + `<g pointer-events="none"><ellipse cx="444" cy="420" rx="54" ry="40" fill="#FFC66B" opacity=".18"><animate attributeName="opacity" values=".14;.22;.16;.2;.14" dur="3s" repeatCount="indefinite"/></ellipse></g>`
    + lab(444, 478, "Candles", "#F6E3B4", 9));
  // plain old pews at the front, either side of the aisle
  const pew = (x, y, w) => sk(`<rect x="${x}" y="${y - 40}" width="${w}" height="12" style="fill:#5A4232"/><rect x="${x}" y="${y - 22}" width="${w}" height="8" style="fill:#6B4A34"/><path d="M${x + 4} ${y - 28} v28 M${x + w - 4} ${y - 28} v28 M${x + w/2} ${y - 14} v14" style="stroke:#4A3428" stroke-width="5"/>${[.2, .55, .8].map(t => `<rect x="${x + w*t}" y="${y - 27}" width="10" height="5" style="fill:${t > .5 ? "#7A2E2E" : "#2F4A6E"}"/>`).join("")}`, `<rect x="${x}" y="${y - 40}" width="${w}" height="12"/><rect x="${x}" y="${y - 22}" width="${w}" height="8"/>`);
  const pews = g(pew(26, 548, 144) + pew(26, 592, 144) + pew(350, 548, 144) + pew(350, 592, 144))
    // the old stone font on the left, white flowers in tall vases either side of the altar step
    + g(sk(`<path d="M50 480 l4 -8 h20 l4 8z M58 472 v-24 h12 v24z" style="fill:#B3ACA2"/><path d="M34 432 q30 30 60 0z" style="fill:#C9C2B8"/><ellipse cx="64" cy="432" rx="30" ry="6" style="fill:#D9D3C8"/><ellipse cx="64" cy="432" rx="24" ry="4" style="fill:#9FC3CC"/><path d="M44 440 q20 10 40 0" fill="none" style="stroke:#9E978A" stroke-width="1.4"/>`, `<path d="M34 432 q30 30 60 0z"/><path d="M58 472 v-24 h12 v24z"/>`))
    + g([182, 338].map(x => sk(`<path d="M${x - 8} 262 l2 -24 h12 l2 24z" style="fill:#E9E4D8"/>${[[-10, -46], [-4, -54], [4, -50], [10, -44], [0, -42], [-7, -36], [7, -36]].map(([dx, dy]) => `<path d="M${x} 240 L${x + dx} ${262 + dy}" style="stroke:#5E8A4A" stroke-width="1"/><circle cx="${x + dx}" cy="${262 + dy}" r="4" style="fill:#FFFDF6"/>`).join("")}`, `<path d="M${x - 8} 262 l2 -24 h12 l2 24z"/>`)).join(""))
    // a tall candlestick on the right
    + g(sk(`<path d="M484 340 v-60 M476 340 h16" style="stroke:${P.brass2}" stroke-width="3"/><rect x="481" y="262" width="6" height="18" style="fill:#FBF8F0"/><path d="M484 262 q-2 -4 0 -7 q2 3 0 7" style="fill:#F6B23A"/>`, `<path d="M484 340 v-60"/>`)) + lampGlow(484, 258, 16);
  return defs + slabs(200, ["#C9C3B8", "#D3CDC2", "#BEB8AC", "#CFC9BE"], "#9E978A", 86, 52) + g(`<rect x="214" y="260" width="92" height="340" style="fill:#7A2E2E" opacity=".28"/>`) + wall + altar + win + choir + candles + pews + exit("#2B2A2E");
}

export function portoRoomArt(scene){
  return scene === "pv_mussels" ? musselsRoom() : scene === "pv_bar" ? barRoom() : scene === "pv_bottega" ? bottegaRoom() : scene === "pv_books" ? booksRoom() : scene === "pv_shells" ? shellsRoom() : churchRoom();
}
