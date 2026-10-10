// Cinque Terre (round 131): four of the five villages on the cliffs of the Ligurian coast, one to a screen. Tall narrow
// houses painted every colour, green shutters, grey slate roofs, stacked up the rock; a deep blue sea; little wooden
// fishing boats; vineyard terraces held up by dry stone walls; lemons. Calm on purpose.
//   ct_vernazza:   the little harbour and its boats, the round watchtower on the rocks, the piazza with its umbrellas
//                  and bocce court, the church on the water, the focacceria
//   ct_corniglia:  high on the cliff: the vineyard terraces and the little monorail, the lemon grove, the cantina, and
//                  the station down by the sea at the foot of the long brick staircase (top right, this town)
//   ct_monterosso: the beach and its rows of striped umbrellas, the old town's alleys, the giant on the rocks, the
//                  lemon shop
//   ct_manarola:   the houses on the rock, the boats pulled up in the main street, the swimming rocks, the lovers'
//                  path, the pesto kitchen and the gelateria; in winter, the nativity of lights on the hill
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";

const C = {sea: "#4F9CC4", sea2: "#7FBCD8", foam: "#EAF5FA", rock: "#9A8E80", rock2: "#7E7266", path: "#E3D6BE", path2: "#CDBEA0", slate: "#8A8C92",
  shutter: "#6A9276", stone: "#C9BCA8", vine: "#6E9A44", vine2: "#86AE58", terrace: "#B9A88A", lemon: "#F3D34A", leaf: "#4E7A3A", ink: "#2F2B28",
  houses: ["#EFCB8E", "#E3A588", "#EDBDB8", "#F2DFA8", "#B9D6C2", "#F1E6CF", "#BFD4E2", "#E6AE96", "#F1CDB4", "#D9C2D8"]};   // faded pastels (Mel, round 135)
const W = ink;
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 10) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#6F7C9C" opacity=".18" pointer-events="none"/>`;
// a little Ligurian house (Mel, round 135: "they were quite small, three storeys max, more like individual houses"):
// faded pastel plaster, two windows a floor at most (so four to six), green shutters, window boxes and pots on the
// balconies, the odd washing line, a low slate roof. Big boxes are split up: a wide one into houses side by side, a
// tall one into a house further up the hill peeking over the one in front. A shop keeps its door and sign in the middle.
function casa(x, y, w, h, col, o = {}){
  const seed = Math.round(x*7 + y*13 + w);
  if (o.door && w > 96) {   // a wide shop: the shop in the middle, a neighbour either side
    const dx = o.doorX || w/2, sw = 84, sx = Math.max(x, Math.min(x + w - sw, x + dx - sw/2)), out = [];
    if (sx - x >= 24) out.push(casa(x, y + 8, sx - x, h - 8, C.houses[(seed + 2) % C.houses.length]));
    if (x + w - (sx + sw) >= 24) out.push(casa(sx + sw, y + 4, x + w - sx - sw, h - 4, C.houses[(seed + 5) % C.houses.length]));
    return out.join("") + casa(sx, y, sw, h, col, {...o, doorX: x + dx - sx});
  }
  if (!o.door && w > 62) {   // a wide box: two or three little houses side by side, not all the same height
    const n = Math.ceil(w/50), ww = w/n;
    return Array.from({length: n}, (_, i) => { const dy = Math.round(rnd(seed + i)*12); return casa(x + i*ww, y + dy, ww - (i < n - 1 ? 1 : 0), h - dy, C.houses[(seed + i*3) % C.houses.length], {...o, solo: true}); }).join("");
  }
  const maxH = o.door ? 96 : 84;
  if (h > maxH) {   // a tall box: the house, three floors, and the green hillside showing above it
    const hf = maxH - Math.round(rnd(seed)*8), top = h - hf;
    const scrub = `<g pointer-events="none">${sk([0, 1, 2].map(k => `<ellipse cx="${(x + w*(.2 + k*.3)).toFixed(1)}" cy="${(y + top*.55 + rnd(seed + k)*top*.3).toFixed(1)}" rx="${(w*.24).toFixed(1)}" ry="${(8 + top*.15).toFixed(1)}" style="fill:${["#9DB27A", "#8AA46A", "#A9BC86"][k]}"/>`).join(""), "")}</g>`;
    return scrub + casa(x, y + top, w, hf, col, o);
  }
  return house(x, y, w, h, col, o, seed);
}
function house(x, y, w, h, col, o, seed){
  const floors = Math.max(1, Math.min(3, Math.round((h - 4)/26))), fh = (h - 4)/floors, cols = w < 40 ? 1 : 2, r = i => rnd(seed + i);
  const winX = c => x + (cols === 1 ? w/2 : w*(c ? .7 : .3)) - 6;
  let wins = "", deco = "";
  for (let f = 0; f < floors; f++) {
    const ground = f === floors - 1, wy = y + 6 + f*fh + (fh - 16)/2;
    if (ground && o.door) continue;   // the shop front: its door and sign, below
    for (let c = 0; c < cols; c++) {
      const wx = winX(c), shut = r(f*5 + c) < .35;   // a few shutters closed against the sun
      wins += shut ? `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="12" height="16" style="fill:${C.shutter}"/><path d="M${(wx + 6).toFixed(1)} ${wy.toFixed(1)} v16" style="stroke:#4E6E58" stroke-width=".7"/>`
        : `<rect x="${(wx - 3).toFixed(1)}" y="${wy.toFixed(1)}" width="3" height="16" style="fill:${C.shutter}"/><rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="12" height="16" style="fill:#5E6A70"/><rect x="${(wx + 12).toFixed(1)}" y="${wy.toFixed(1)}" width="3" height="16" style="fill:${C.shutter}"/>`;
      // a window box of geraniums, or a pot hanging beside the window
      if (!o.back && r(f*7 + c + 3) < .45) deco += `<rect x="${(wx - 1).toFixed(1)}" y="${(wy + 16).toFixed(1)}" width="14" height="3" style="fill:#A0705A"/>${[1, 5, 9, 12].map((d, k) => `<circle cx="${(wx + d).toFixed(1)}" cy="${(wy + 15).toFixed(1)}" r="1.9" style="fill:${k % 2 ? "#7FA35A" : ["#E8566C", "#F29AB0"][(seed + k) % 2]}"/>`).join("")}`;
      else if (!o.back && r(f*11 + c) < .25) deco += `<path d="M${(wx + 18).toFixed(1)} ${(wy - 2).toFixed(1)} v5" style="stroke:#3A3430" stroke-width=".6"/><path d="M${(wx + 15).toFixed(1)} ${(wy + 3).toFixed(1)} h7 l-1 5 h-5z" style="fill:#C9805A"/><path d="M${(wx + 16).toFixed(1)} ${(wy + 7).toFixed(1)} q-1 5 -2 8 M${(wx + 19).toFixed(1)} ${(wy + 8).toFixed(1)} q0 4 1 7 M${(wx + 21).toFixed(1)} ${(wy + 7).toFixed(1)} q2 3 2 6" fill="none" style="stroke:#6E9A44" stroke-width="1.4"/>`;
    }
    // a little balcony on a middle floor, pots along the rail
    if (!o.back && floors > 1 && cols === 2 && (o.balcony ? f === 0 : f === floors - 2 && r(f + 21) < .5)) { const by = wy + 17, bx1 = x + w*.18, bx2 = x + w*.82;
      deco += `<rect x="${bx1.toFixed(1)}" y="${by.toFixed(1)}" width="${(bx2 - bx1).toFixed(1)}" height="2.5" style="fill:#8A8478"/><path d="${Array.from({length: Math.floor((bx2 - bx1)/5) + 1}, (_, k) => `M${(bx1 + k*5).toFixed(1)} ${(by - 7).toFixed(1)} v7`).join(" ")} M${bx1.toFixed(1)} ${(by - 7).toFixed(1)} H${bx2.toFixed(1)}" fill="none" style="stroke:#4A4440" stroke-width=".7"/>${[.2, .5, .8].map((t, k) => `<ellipse cx="${(bx1 + (bx2 - bx1)*t).toFixed(1)}" cy="${(by - 9).toFixed(1)}" rx="3.4" ry="3" style="fill:${k === 1 ? "#E8566C" : "#6E9A44"}"/>`).join("")}`; }
  }
  // the odd washing line strung across the top floor
  if (!o.back && cols === 2 && r(31) < .35) { const ly = y + 6 + (fh - 16)/2 + 18, lx1 = winX(0) + 13, lx2 = winX(1) - 1;
    if (lx2 - lx1 > 8) deco += `<path d="M${lx1.toFixed(1)} ${ly.toFixed(1)} Q${((lx1 + lx2)/2).toFixed(1)} ${(ly + 3).toFixed(1)} ${lx2.toFixed(1)} ${ly.toFixed(1)}" fill="none" style="stroke:#3A3430" stroke-width=".5"/>${[.3, .65].map((t, k) => `<rect x="${(lx1 + (lx2 - lx1)*t - 2.5).toFixed(1)}" y="${(ly + 1).toFixed(1)}" width="5" height="6" style="fill:${["#FFFDF6", "#9FC3D9", "#F29AB0"][(seed + k) % 3]}"/>`).join("")}`; }
  // faded plaster: a few paler patches, and a cool haze over the houses further up the hill
  const patina = `${[0, 1].map(k => `<ellipse cx="${(x + w*(.25 + r(40 + k)*.5)).toFixed(1)}" cy="${(y + h*(.3 + r(50 + k)*.5)).toFixed(1)}" rx="${(w*.22).toFixed(1)}" ry="${(h*.12).toFixed(1)}" style="fill:#FFFDF6" opacity=".22"/>`).join("")}${o.back ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#DCE6EE" opacity=".28"/>` : ""}`;
  const dx = o.doorX || w/2, door = o.door ? `<rect x="${x + dx - 10}" y="${y + h - 26}" width="20" height="26" rx="2" style="fill:${o.doorCol || "#6B5444"}"/>` : "";
  const roof = `<path d="M${x - 3} ${y + 2} L${x + w/2} ${y - 7} L${x + w + 3} ${y + 2}z" style="fill:${C.slate}"/>`;
  return (o.back ? "" : shade(x, y, w, h)) + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${col}"/>${patina}${wins}${deco}${door}${roof}`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x - 3} ${y + 2} L${x + w/2} ${y - 7} L${x + w + 3} ${y + 2}z"/>${o.door ? `<rect x="${x + dx - 10}" y="${y + h - 26}" width="20" height="26" rx="2"/>` : ""}`)
    + (o.sign ? `<rect x="${x + dx - 30}" y="${y + h - 44}" width="60" height="13" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x + dx}" y="${y + h - 34}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}" pointer-events="none">${o.sign}</text>` : "");
}
// a cluster of houses stacked up a slope: back rows higher, drawn first
const stack = (spec, seed = 0) => spec.map(([x, y, w, h], i) => casa(x, y, w, h, C.houses[(i*3 + seed) % C.houses.length])).join("");
// a washing line between two houses
const washing = (x1, x2, y) => `<g pointer-events="none"><path d="M${x1} ${y} Q${(x1 + x2)/2} ${y + 8} ${x2} ${y}" fill="none" style="stroke:#3A3430" stroke-width=".8"/>${[.25, .45, .65, .8].map((t, i) => { const x = x1 + (x2 - x1)*t, yy = y + 8*4*t*(1 - t)/1.0; return `<g class="washing" style="animation-delay:-${i*.6}s">${sk(`<rect x="${x - 5}" y="${yy}" width="10" height="${10 + (i % 2)*4}" style="fill:${["#FFFDF6", "#9FC3D9", "#E89A9A", "#F3D98A"][i]}"/>`, `<rect x="${x - 5}" y="${yy}" width="10" height="${10 + (i % 2)*4}"/>`)}</g>`; }).join("")}</g>`;
// a little wooden fishing boat (gozzo), on the water (bob) or pulled up on land
const gozzo = (x, y, col, stripe, on = "water", dir = 1, i = 0) => `<g pointer-events="none"><g>${on === "water" ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="${3 + i*.4}s" repeatCount="indefinite"/>` : ""}
  ${on === "land" ? `<ellipse cx="${x}" cy="${y + 4}" rx="26" ry="4" fill="#6F7C9C" opacity=".2"/>` : `<ellipse cx="${x}" cy="${y + 3}" rx="28" ry="3" fill="${C.foam}" opacity=".7"/>`}
  ${sk(`<path d="M${x - 26*dir} ${y - 12} Q${x} ${y + 6} ${x + 26*dir} ${y - 12} L${x + 30*dir} ${y - 18} H${x - 22*dir}z" style="fill:${col}"/><path d="M${x - 22*dir} ${y - 14} H${x + 28*dir}" style="stroke:${stripe}" stroke-width="3"/>`, `<path d="M${x - 26*dir} ${y - 12} Q${x} ${y + 6} ${x + 26*dir} ${y - 12} L${x + 30*dir} ${y - 18} H${x - 22*dir}z"/>`)}</g></g>`;
const waves = pts => `<g pointer-events="none" style="stroke:${C.foam}" stroke-width="1.4" fill="none" opacity=".9">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
const rocks = pts => `<g pointer-events="none">${sk(pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}" style="fill:${C.rock}"/><ellipse cx="${x - r*.3}" cy="${y - r*.25}" rx="${r*.4}" ry="${r*.2}" style="fill:#B9AE9E"/>`).join(""), pts.slice(0, 6).map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}"/>`).join(""))}</g>`;
// a lemon tree under its net
const lemonTree = (x, y, s = 1) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 1}" rx="${14*s}" ry="${4*s}" fill="#8A9A62" opacity=".35"/>${sk(`<path d="M${x} ${y} v${-10*s}" style="stroke:#5A4636" stroke-width="${3*s}"/><ellipse cx="${x}" cy="${y - 24*s}" rx="${17*s}" ry="${15*s}" style="fill:${C.leaf}"/>${[[-9, -26], [6, -30], [11, -20], [-3, -18], [-12, -16], [3, -36]].map(([dx, dy]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${2.6*s}" ry="${2*s}" style="fill:${C.lemon}"/>`).join("")}`,
  `<ellipse cx="${x}" cy="${y - 24*s}" rx="${17*s}" ry="${15*s}"/>`)}</g>`;
// a terrace of vines: a dry stone wall with a row of vines on top
const terrace = (x1, x2, y, i = 0) => `<g pointer-events="none">${sk(`<rect x="${x1}" y="${y}" width="${x2 - x1}" height="10" style="fill:${C.terrace}"/>${Array.from({length: Math.floor((x2 - x1)/14)}, (_, k) => `<path d="M${x1 + 4 + k*14} ${y} v-12" style="stroke:#6B5444" stroke-width="1.4"/><ellipse cx="${x1 + 4 + k*14}" cy="${y - 14}" rx="7" ry="5" style="fill:${(k + i) % 2 ? C.vine : C.vine2}"/>${ssn() === "autumn" || ssn() === "summer" ? `<circle cx="${x1 + 6 + k*14}" cy="${y - 9}" r="2" style="fill:#5A3A6E"/>` : ""}`).join("")}`,
  `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="10"/>`)}<path d="M${x1} ${y + 5} H${x2}" style="stroke:#9A8A6E" stroke-width="1" stroke-dasharray="6 4"/></g>`;
// striped beach umbrellas in a row
const umbrella = (x, y, col) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 2}" rx="16" ry="4" fill="#6F7C9C" opacity=".18"/>${sk(`<path d="M${x} ${y} v-26" style="stroke:#6B5444" stroke-width="2"/><path d="M${x - 18} ${y - 24} Q${x} ${y - 40} ${x + 18} ${y - 24}z" style="fill:${col}"/><path d="M${x - 6} ${y - 34} L${x - 8} ${y - 24} M${x + 6} ${y - 34} L${x + 8} ${y - 24}" style="stroke:#FFFDF6" stroke-width="3"/>`, `<path d="M${x - 18} ${y - 24} Q${x} ${y - 40} ${x + 18} ${y - 24}z"/>`)}</g>`;
const cafeUmbrella = (x, y, col) => umbrella(x, y, col) + `<g pointer-events="none">${sk(`<ellipse cx="${x}" cy="${y - 2}" rx="11" ry="4" style="fill:#FFFDF6"/><rect x="${x - 18}" y="${y - 6}" width="6" height="8" style="fill:#8A6A52"/><rect x="${x + 12}" y="${y - 6}" width="6" height="8" style="fill:#8A6A52"/>`, `<ellipse cx="${x}" cy="${y - 2}" rx="11" ry="4"/>`)}</g>`;
function seasonFx(){
  if (ssn() === "winter") return `<g pointer-events="none">${Array.from({length: 10}, (_, i) => `<circle r="1.6" fill="#FFFFFF" opacity=".85"><animateMotion dur="${11 + (i % 5)}s" begin="${-i*1.3}s" repeatCount="indefinite" path="M${20 + i*50} -10 q-12 330 8 660"/></circle>`).join("")}</g>`;
  return "";
}
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:#8A6A52"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:#C9483A" stroke-width="2"/><path d="M${x + 6} ${y - 19} h10" style="stroke:#FFFDF6" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
const path = (d, w = 26) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.path2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.path}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
// the coast path's red-and-white trail marks (the CAI marks: the hiking trail)
const trailMark = (x, y) => `<g pointer-events="none"><rect x="${x - 6}" y="${y - 4}" width="12" height="3" fill="#C9483A"/><rect x="${x - 6}" y="${y - 1}" width="12" height="3" fill="#FFFDF6"/><rect x="${x - 6}" y="${y + 2}" width="12" height="3" fill="#C9483A"/></g>`;

/* ---------- ct_vernazza: the harbour, the tower, the piazza, the focacceria ---------- */
function vernazzaScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.path}"/><g filter="url(#wash)" opacity=".5"><ellipse cx="320" cy="420" rx="160" ry="120" style="fill:#EADFC8"/></g>`;
  // the sea: the top-left and down the west side, with the harbour cut into it
  const sea = `<g pointer-events="none">${sk(`<path d="M0 0 H200 Q230 120 210 200 Q180 260 120 280 Q190 320 200 400 Q190 480 170 500 Q120 560 0 560z" style="fill:${C.sea}"/>`,
    `<path d="M200 0 Q230 120 210 200 Q180 260 120 280 Q190 320 200 400 Q190 480 170 500 Q120 560 0 560"/>`)}${waves([[40, 60], [120, 120], [30, 340], [100, 420], [60, 500]])}</g>`;
  const tower = place("cttower", 150, 258, 30, 9, "The watchtower", sk(`<path d="M60 250 Q80 200 150 210 Q210 220 200 260z" style="fill:${C.rock}"/><rect x="100" y="140" width="56" height="90" style="fill:${C.stone}"/><path d="M96 140 h64 v-10 h-8 v6 h-8 v-6 h-8 v6 h-8 v-6 h-8 v6 h-8 v-6 h-8 v6 h-8z" style="fill:${C.stone}"/>${[[112, 160], [134, 190]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="14" rx="4" style="fill:#3A3430"/>`).join("")}`,
    `<rect x="100" y="140" width="56" height="90"/><path d="M60 250 Q80 200 150 210 Q210 220 200 260"/>`), "Watchtower", 128, 280, "#E8D3BC");
  // the church right on the water, with its tower
  const church = `<g pointer-events="none">${sk(`<rect x="20" y="380" width="80" height="56" style="fill:#E3D6BE"/><path d="M14 382 L60 356 L106 382z" style="fill:${C.slate}"/><rect x="74" y="320" width="22" height="60" style="fill:#D9C9A8"/><path d="M70 322 L85 300 L100 322z" style="fill:${C.slate}"/><rect x="50" y="404" width="20" height="32" rx="10" style="fill:#6B5444"/>`,
    `<rect x="20" y="380" width="80" height="56"/><rect x="74" y="320" width="22" height="60"/>`)}</g>`;
  const houses = stack([[330, 70, 46, 110], [374, 60, 52, 120], [424, 74, 44, 106], [466, 66, 50, 114], [430, 470, 86, 80]], 1)
    // Jason's flat (round 135): the second floor of the yellow house by the harbour, geraniums all along the balcony
    + place("ctjason", 478, 472, 30, 9, "Jason's house", casa(446, 386, 60, 84, "#F2DFA8", {balcony: true}) + `<g pointer-events="none">${[458, 468, 484, 494].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 406 : 404}" r="2.6" style="fill:${i % 2 ? "#F29AB0" : "#E8566C"}"/>`).join("")}</g>`, "Jason's", 404, 446, "#F6E3B4")
    + `<g data-place="ctfocacceria" aria-label="The focacceria"><ellipse class="hov" cx="394" cy="192" rx="40" ry="10" style="fill:var(--butter)"/>${casa(354, 100, 80, 90, C.houses[1], {door: true, doorX: 40, sign: "FOCACCERIA", doorCol: "#8A5A3A"})}${lab(394, 214, "Focacceria", "#FBE0B8", 10)}</g>`;
  const piazza = place("ctpiazza", 300, 356, 50, 12, "The piazza", cafeUmbrella(270, 330, "#C9483A") + cafeUmbrella(340, 320, "#3E6BAE") + cafeUmbrella(320, 410, "#2E7A5A")
    + sk(`<rect x="250" y="440" width="120" height="30" rx="3" style="fill:#D9C9A8"/>${[[270, 452, "#C9483A"], [300, 458, "#3E6BAE"], [334, 450, "#C9483A"], [352, 460, "#FFFDF6"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.4" style="fill:${c}"/>`).join("")}`, `<rect x="250" y="440" width="120" height="30" rx="3"/>`), "Piazza", 300, 490, "#F6D3DC");
  const harbour = place("ctharbour", 190, 466, 30, 10, "The harbour", gozzo(80, 300, "#3E6BAE", "#FFFDF6", "water", 1, 0) + gozzo(120, 350, "#C9483A", "#F3D98A", "water", -1, 1) + gozzo(60, 460, "#2E7A5A", "#FFFDF6", "water", 1, 2)
    + gozzo(196, 440, "#F3D98A", "#3E6BAE", "land", -1), "Harbour", 140, 516, "#C3DDF3");
  const lanes = path("M504 340 Q420 330 360 330 Q300 330 250 300 Q210 270 190 300 M330 612 Q320 520 300 470 M330 330 Q380 260 394 200", 28);
  const bits = washing(426, 466, 120) + trailMark(480, 320) + trailMark(340, 580) + lemonTree(470, 300, .8);
  return lampDefs + ground + sea + lanes + church + tower + houses + harbour + piazza + bits + seasonFx()
    + gate("ctToCorniglia", 504, 340, "Corniglia", 462, 372, "East along the cliff path to Corniglia")
    + gate("ctToMonterosso", 330, 612, "Monterosso", 400, 600, "South along the coast to Monterosso", "#C3DDF3");
}

/* ---------- ct_corniglia: the terraces, the monorail, the lemons, the cantina, the station at the foot of the steps ---------- */
function cornigliaScreen(){
  const ground = `<rect width="520" height="640" style="fill:#D9CBAA"/><g filter="url(#wash)" opacity=".5"><ellipse cx="260" cy="400" rx="200" ry="100" style="fill:#E3D6BE"/></g>`;
  // the terraces climbing the top of the screen, and the monorail's single rail running up them
  const terraces = [40, 74, 108, 142, 176].map((y, i) => terrace(0, 520, y, i)).join("");
  const monorail = place("ctmonorail", 330, 240, 30, 9, "The monorail", sk(`<path d="M300 230 L420 20" style="stroke:#6B6B70" stroke-width="4"/><path d="M300 230 L420 20" style="stroke:#9A9AA0" stroke-width="1.4" stroke-dasharray="3 3"/><rect x="336" y="154" width="30" height="16" rx="3" style="fill:#C9483A" transform="rotate(-60 351 162)"/><rect x="346" y="140" width="16" height="12" style="fill:#C9A27E" transform="rotate(-60 354 146)"/>`,
    `<path d="M300 230 L420 20"/>`), "Monorail", 380, 262, "#F6D3DC");
  const terr = place("ctterraces", 200, 206, 40, 10, "The vineyard terraces", "", "Vine terraces", 200, 224, "#DCEBC8");
  const grove = place("ctlemons", 440, 330, 40, 10, "The lemon grove", lemonTree(420, 300, .9) + lemonTree(470, 290, 1) + lemonTree(450, 320, .8), "Lemon grove", 450, 350, "#FBF0B8");
  // the village up on top: a few houses and the cantina
  const village = stack([[200, 250, 44, 80], [242, 240, 48, 90]], 4)
    + `<g data-place="ctcantina" aria-label="The cantina"><ellipse class="hov" cx="112" cy="348" rx="40" ry="10" style="fill:var(--butter)"/>${casa(40, 250, 150, 90, C.houses[5], {door: true, doorX: 72, sign: "CANTINA", doorCol: "#5A3A2E"})}${lab(112, 370, "Cantina", "#E8D3BC", 10)}</g>`;
  // the long brick staircase zigzagging down to the station and the sea
  const steps = `<g pointer-events="none">${sk(`<path d="M290 360 L380 400 L300 440 L380 480" fill="none" style="stroke:#C9785A" stroke-width="18" stroke-linejoin="round"/>`, ``)}<path d="M290 360 L380 400 L300 440 L380 480" fill="none" style="stroke:#A85A3E" stroke-width="18" stroke-dasharray="1.6 5" stroke-linejoin="round"/></g>`;
  const sea = `<g pointer-events="none">${sk(`<path d="M0 600 H520 V640 H0z" style="fill:${C.sea}"/>`, `<path d="M0 600 H520"/>`)}${waves([[60, 620], [200, 626], [440, 622]])}</g>`;
  const rail = `<g pointer-events="none"><rect x="120" y="574" width="400" height="16" style="fill:#BFB7A6"/>${Array.from({length: 26}, (_, i) => `<rect x="${124 + i*15}" y="574" width="5" height="16" style="fill:#6B5444"/>`).join("")}<path d="M120 578 H520 M120 586 H520" style="stroke:#7A7A80" stroke-width="1.6"/>
    ${sk(`<path d="M120 560 q-30 0 -30 30 v14 h30z" style="fill:${C.rock2}"/><path d="M96 590 q0 -20 20 -20 h4 v22z" style="fill:#2F2B28"/>`, `<path d="M120 560 q-30 0 -30 30 v14 h30z"/>`)}</g>`;   // the tunnel mouth
  const station = `<g data-place="cttrain" aria-label="Corniglia station">${shade(300, 450, 200, 80)}
    ${sk(`<rect x="300" y="456" width="200" height="74" style="fill:#F3D98A"/><path d="M294 458 L400 436 L506 458z" style="fill:${C.slate}"/>${[316, 348, 452, 474].map(x => `<rect x="${x}" y="472" width="14" height="22" style="fill:${C.shutter}"/>`).join("")}<rect x="384" y="490" width="32" height="40" style="fill:#6B5444"/>
      <rect x="290" y="530" width="230" height="44" style="fill:#D9CBAA"/>`, `<rect x="300" y="456" width="200" height="74"/><path d="M294 458 L400 436 L506 458z"/>`)}
    <rect x="356" y="466" width="88" height="14" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8"/><text x="400" y="476" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="${C.ink}" pointer-events="none">CORNIGLIA</text>
    ${lab(450, 556, "Station · trains home", "#C3DDF3", 10)}</g>`;
  const lanes = path("M16 440 Q100 430 160 410 Q230 380 290 360 M160 410 Q160 500 160 612 M112 360 Q180 330 300 238 M290 360 Q360 330 430 340", 24);
  const bits = trailMark(60, 420) + washing(204, 242, 270) + seasonFx();
  return lampDefs + ground + terraces + monorail + terr + lanes + village + steps + grove + sea + rail + station + bits
    + gate("ctToVernazza", 16, 440, "Vernazza", 60, 410, "West along the cliff path to Vernazza")
    + gate("ctToManarola", 160, 612, "Manarola", 230, 600, "South along the coast to Manarola", "#C3DDF3");
}

/* ---------- ct_monterosso: the beach, the umbrellas, the old town, the giant, the lemon shop ---------- */
function monterossoScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.path}"/>`;
  // the beach: sand, then the sea along the bottom
  const beach = `<g pointer-events="none">${sk(`<path d="M0 400 Q260 380 520 410 V640 H0z" style="fill:#EADBB0"/>`, ``)}${sk(`<path d="M0 560 Q260 540 520 566 V640 H0z" style="fill:${C.sea}"/>`, `<path d="M0 560 Q260 540 520 566"/>`)}${waves([[60, 590], [200, 600], [340, 596], [460, 604]])}
    <path d="M0 558 Q260 538 520 564" fill="none" style="stroke:${C.foam}" stroke-width="3" opacity=".8"/></g>`;
  const cols = ["#E07A5F", "#3E6BAE", "#F3D34A", "#2E7A5A", "#E89A9A"];
  const umbrellas = place("ctbeach", 230, 466, 40, 10, "The beach", [80, 140, 200, 260, 320].map((x, i) => umbrella(x, 450 + (i % 2)*6, cols[i])).join("") + [110, 230, 290].map((x, i) => umbrella(x, 516 - (i % 2)*4, cols[(i + 2) % 5])).join(""), "Beach", 200, 540, "#FBF0B8");
  // the old town: houses along the top, the lemon shop among them
  const town = stack([[30, 70, 44, 110], [72, 60, 50, 120], [120, 74, 44, 106], [180, 66, 48, 114], [470, 70, 46, 110]], 2)
    + `<g data-place="ctlimoni" aria-label="The lemon shop"><ellipse class="hov" cx="396" cy="192" rx="40" ry="10" style="fill:var(--butter)"/>${casa(340, 96, 112, 94, C.houses[3], {door: true, doorX: 56, sign: "LIMONI", doorCol: "#4E7A5A"})}
      ${sk([0, 1, 2].map(i => `<rect x="${352 + i*30}" y="170" width="20" height="14" style="fill:#C9A27E"/><ellipse cx="${357 + i*30}" cy="170" rx="3" ry="2.4" style="fill:${C.lemon}"/><ellipse cx="${365 + i*30}" cy="170" rx="3" ry="2.4" style="fill:${C.lemon}"/>`).join(""), "")}${lab(396, 214, "Lemon shop", "#FBF0B8", 10)}</g>`;
  // the giant on the rocks at the east end of the beach
  const giant = place("ctgigante", 440, 436, 30, 9, "The giant", sk(`<path d="M420 480 Q430 380 490 380 Q520 390 520 480z" style="fill:${C.rock}"/><path d="M462 400 q14 -10 26 0 v40 h-26z" style="fill:#B9AE9E"/><circle cx="476" cy="394" r="9" style="fill:#B9AE9E"/><path d="M462 410 l-14 -18" style="stroke:#B9AE9E" stroke-width="6"/>`, `<path d="M420 480 Q430 380 490 380 Q520 390 520 480"/><circle cx="476" cy="394" r="9"/>`), "The giant", 450, 500, "#E8D3BC");
  const lanes = path("M300 26 Q300 120 290 220 Q280 300 230 380 M290 260 Q400 270 504 330 M290 220 Q340 210 396 200", 26);
  const bits = washing(72, 120, 110) + washing(180, 228, 100) + trailMark(320, 70) + lemonTree(260, 300, .8) + lemonTree(460, 270, .8) + gozzo(150, 600, "#C9483A", "#FFFDF6", "water", 1, 1);
  return lampDefs + ground + beach + lanes + town + umbrellas + giant + bits + seasonFx()
    + gate("ctToVernazzaN", 300, 26, "Vernazza", 362, 30, "North up the coast to Vernazza")
    + gate("ctToManarolaE", 504, 330, "Manarola", 462, 362, "East along the coast to Manarola", "#C3DDF3");
}

/* ---------- ct_manarola: the houses on the rock, the boats in the street, the rocks, the pesto kitchen, the gelateria ---------- */
function manarolaScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.path}"/>`;
  const sea = `<g pointer-events="none">${sk(`<path d="M0 520 Q100 540 200 580 V640 H0z" style="fill:${C.sea}"/>`, `<path d="M0 520 Q100 540 200 580"/>`)}${waves([[40, 590], [120, 610]])}</g>` + rocks([[60, 520, 22], [120, 540, 18], [170, 566, 14]]);
  // the rock with the houses stacked up it (the famous view), on the right
  const rock = `<g pointer-events="none">${sk(`<path d="M300 640 Q290 520 330 470 Q400 420 520 430 V640z" style="fill:${C.rock}"/>`, `<path d="M300 640 Q290 520 330 470 Q400 420 520 430"/>`)}</g>`;
  const houses = stack([[40, 70, 44, 110], [84, 60, 50, 120], [190, 74, 46, 106], [330, 70, 46, 110], [374, 60, 52, 120], [424, 74, 44, 106], [466, 66, 50, 114]], 3)
    + `<g data-place="ctpesto" aria-label="The pesto kitchen"><ellipse class="hov" cx="140" cy="192" rx="38" ry="10" style="fill:var(--butter)"/>${casa(100, 100, 84, 90, C.houses[4], {door: true, doorX: 40, sign: "PESTO", doorCol: "#3E5E4A"})}${lab(140, 214, "Pesto kitchen", "#DCEBC8", 10)}</g>`
    + `<g data-place="ctgelato" aria-label="The gelateria"><ellipse class="hov" cx="420" cy="348" rx="40" ry="10" style="fill:var(--butter)"/>${casa(336, 240, 170, 98, C.houses[2], {door: true, doorX: 84, sign: "GELATERIA", doorCol: "#C9483A"})}${lab(420, 370, "Gelateria", "#F6D3DC", 10)}</g>`
    + stack([[340, 470, 50, 70], [392, 456, 56, 84], [450, 466, 60, 74]], 6);
  // the boats pulled up in the main street on their trailers (the boat painting comes in round 3)
  const boats = place("ctboats", 262, 376, 40, 10, "The boats", gozzo(220, 300, "#3E6BAE", "#FFFDF6", "land", 1) + gozzo(290, 280, "#C9483A", "#F3D98A", "land", -1) + gozzo(250, 350, "#2E7A5A", "#FFFDF6", "land", 1), "Boats", 262, 396, "#C3DDF3");
  const swim = place("ctrocks", 110, 516, 30, 9, "The swimming rocks", "", "Swimming rocks", 90, 494, "#C3DDF3");
  const padlock = place("ctpadlock", 236, 478, 26, 8, "The lovers' path", sk(`<path d="M196 452 L286 470" style="stroke:#6B6B70" stroke-width="3"/><path d="M200 452 v14 M240 460 v14 M282 469 v14" style="stroke:#6B6B70" stroke-width="2"/>${[206, 220, 234, 248, 262, 274].map((x, i) => `<rect x="${x - 3}" y="${455 + (x - 196)*.2}" width="6" height="7" rx="1" style="fill:${["#C9483A", "#F3D34A", "#3E6BAE", "#E89A9A", "#2E7A5A", "#C9A2C8"][i]}"/>`).join("")}`, ""), "Lovers' path", 236, 500, "#F6D3DC");
  // the nativity of lights on the hill, in winter
  const lights = ssn() === "winter" ? `<g pointer-events="none">${Array.from({length: 18}, (_, i) => lampGlow(250 + rnd(i)*80, 30 + rnd(i + 9)*40, 8)).join("")}</g>` : "";
  const lanes = path("M262 26 Q262 120 262 220 Q262 300 262 400 Q240 470 140 500 M16 330 Q120 320 262 300 M262 420 Q360 470 440 510", 26);
  const bits = washing(84, 134, 110) + washing(374, 424, 112) + trailMark(240, 60) + lemonTree(30, 300, .8);
  return lampDefs + ground + sea + rock + lanes + houses + boats + swim + padlock + lights + bits + seasonFx()
    + gate("ctToCornigliaN", 262, 26, "Corniglia", 330, 30, "North up the coast to Corniglia")
    + gate("ctToMonterossoW", 16, 330, "Monterosso", 70, 300, "West along the coast to Monterosso", "#C3DDF3");
}

export function cinqueArt(scene){
  return scene === "ct_vernazza" ? vernazzaScreen() : scene === "ct_corniglia" ? cornigliaScreen() : scene === "ct_monterosso" ? monterossoScreen() : manarolaScreen();
}
// The train ride to Cinque Terre: in and out of tunnels along the cliffs, the sea flashing blue, coloured villages
export const cinqueRide = () => `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
  <path d="M0 56 H600 V90 H0z" fill="${C.sea}"/><path d="M0 56 Q80 10 160 30 Q240 0 320 26 Q400 4 480 30 Q540 14 600 26 V58 H0z" fill="#9AA88A"/>
  ${[60, 250, 430].map((x, k) => [0, 1, 2, 3].map(i => `<rect x="${x + i*11}" y="${36 - i*3 - k*2}" width="10" height="${16 + i*3}" fill="${C.houses[(i + k*3) % C.houses.length]}"/>`).join("")).join("")}
  ${[150, 340, 540].map(x => `<path d="M${x} 60 q20 -26 40 0z" fill="#2F2B28"/>`).join("")}</g></svg>`;
// round 134: the little painted boat by the home jetty, after a trip to Cinque Terre (Mel asked)
export const homeBoat = (x, y, col = "#3E6BAE", stripe = "#F3D98A") => gozzo(x, y, col, stripe, "land", 1);
// the cane drying rack by Mel's barrel shed (round 139): out while six bunches dry to raisins for the raisin wine
export const dryingRack = (x, y) => `<g pointer-events="none"><ellipse cx="${x + 20}" cy="${y + 2}" rx="26" ry="4" fill="#6F7C9C" opacity=".18"/>${sk(`<path d="M${x} ${y} L${x + 6} ${y - 44} L${x + 12} ${y} M${x + 28} ${y} L${x + 34} ${y - 44} L${x + 40} ${y}" style="stroke:#8A6A52" stroke-width="2.4" fill="none"/>${[-36, -24, -12].map(dy => `<path d="M${x + 2} ${y + dy} H${x + 38}" style="stroke:#C9A27E" stroke-width="2"/>`).join("")}`
  + [-36, -24, -12].map((dy, r) => [6, 15, 24, 33].map((dx, i) => `<g>${[[0, 3], [-2, 5.5], [2, 5.5], [0, 8]].map(([a, b2]) => `<circle cx="${x + dx + a}" cy="${y + dy + b2}" r="1.9" style="fill:${(r + i) % 2 ? "#9A6A3A" : "#C9A24A"}"/>`).join("")}</g>`).join("")).join(""), `<path d="M${x} ${y} L${x + 6} ${y - 44} L${x + 12} ${y} M${x + 28} ${y} L${x + 34} ${y - 44} L${x + 40} ${y}"/>`)}</g>`;
