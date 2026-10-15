// Hokkaido's interiors (round 222): five rooms behind the doors at the market and canal, in the hot springs valley,
// at Niseko and on the flower farm. Hokkaido rooms: honest timber and pale plaster, Otaru's old soft-stone warehouses,
// red paper lanterns at the market, tatami and shoji at the ryokan, log walls and a river-stone hearth at the lodge,
// whitewashed boards and big windows at the flower farm. The windows follow the season (snow, sakura, summer, autumn).
// The edges full, the middle calm and clear (the playbook).
//   hk_hall:   the morning market hall: the stalls on their ice bed (sea urchin trays, salmon roe, scallops, crab legs),
//              the kaisendon bar, the tank of live king crab, kombu bundles, red lanterns, the chalkboard
//   hk_glass:  Kenta's glassworks in an old stone warehouse on the canal: the glowing furnace, blowpipes, the marver,
//              glass floats in nets, oil lamps, the glass counter and shelves, a stand of music boxes
//   hk_ryokan: Mrs Sato's ryokan: tatami, shoji, the tokonoma, the front desk with folded yukata and bath salts,
//              the garden through the open screens on the left, the stone outdoor bath steaming on the right
//   hk_lodge:  the Niseko ski lodge: log walls, a river-stone fireplace, the hire and lessons desk, skis, boot dryers,
//              the trail map, Mount Yotei through the window, hot chocolate
//   hk_cafe:   the flower farm café and shop: the soft-serve machine, Yubari melon slices, the seed rack,
//              the pressed-flower wall, dried flowers hanging from the beam, the rainbow stripes through the window
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a few small touches too.
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";
import { dayKey } from "../util.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#7E2A22") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none" style="fill:#FFFDF6">Exit</text></g>`;
const txt = (x, y, t, size = 9, fill = "#FFFDF6", weight = 400, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none">${t}</text>`;
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const f1 = n => (+n).toFixed(1);
const P = {timber: "#7A5236", timber2: "#5A3A26", timberL: "#A87E58", pine: "#DDBE8E", pine2: "#BE9A64", pine3: "#9E7A48",
  plaster: "#EEE7D7", plaster2: "#DCD3BF", stone: "#B7AF9F", stone2: "#9F9786", stone3: "#857D6E",
  red: "#C8372D", red2: "#962A22", navy: "#2E3E5C", navy2: "#1F2B44", ice: "#E6F2F5", ice2: "#BFDCE3", water: "#8CC4D2", water2: "#5E9EB2",
  crab: "#D6553A", crab2: "#A23A26", crabL: "#F08A62", uni: "#EBA23A", uni2: "#C9791E", ikura: "#EE5A2A", salmon: "#F29470",
  kombu: "#2F3A2C", rice: "#FFFDF6", shiso: "#5E9A4A", tatami: "#CFC892", tatami2: "#C3BC82", heri: "#34433A", shoji: "#F8F4E8", shojiF: "#9A7A56",
  brick: "#A8583C", brick2: "#7E3E2A", glow: "#FFB44A", glowL: "#FFE28A", steel: "#C3C8CC", steel2: "#8A9096",
  melon: "#8FB85A", melon2: "#6E9A3E", melonF: "#F3A24E", cream: "#FFF8EA", ink: "#2F2B28"};
// a unique clip for a window onto the outside world
let CID = 0;
const clip = (x, y, w, h, inner) => { const id = `hkClip${++CID}`; return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`; };
// the season, the same rules as the town (src/data/hokkaido.js hkSeason): the windows follow it
export const roomSeason = day => { const m = +day.slice(5, 7), d = +day.slice(8, 10);
  return m === 12 || m <= 3 ? "winter" : m === 4 && d < 20 ? "spring" : m === 4 || m === 5 ? "sakura" : m <= 9 ? "summer" : "autumn"; };
let SEASON = "autumn";

/* ---------- shared pieces ---------- */
// floors: square tiles (wet concrete at the market), timber boards, tatami
const tiles = (y0, cols, line, w = 52, h = 40, off = true) => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${cols[0]}"/>`;
  for (let r = 0; y0 + r*h < 640; r++) for (let k = -1; k*w < 520; k++) s += `<rect x="${k*w + (off ? (r % 2)*w/2 : 0)}" y="${y0 + r*h}" width="${w}" height="${h}" style="fill:${cols[(r*3 + k*7 + 20) % cols.length]};stroke:${line}" stroke-width="1.1"/>`;
  return g(s); };
const boards = (y0, cols, line, bh = 24) => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${cols[0]}"/>`;
  for (let r = 0; y0 + r*bh < 640; r++) { let x = -((r*53) % 140); while (x < 520) { const w = 120 + Math.round(R(r*9 + x)*90); s += `<rect x="${x}" y="${y0 + r*bh}" width="${w}" height="${bh}" style="fill:${cols[((r + Math.round(x/7)) % cols.length + cols.length) % cols.length]};stroke:${line}" stroke-width="1"/>`; x += w; } }
  return g(s); };
// tatami: rush mats two to one, their black cloth edges (heri) along the long sides, laid in a running pattern
const tatami = y0 => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${P.tatami}"/>`;
  // one mat: the rush runs across it (fine lines parallel to the short side), the heri along the two long sides
  const mat = (x, y, w, h, tone) => { const hz = w > h, lines = Array.from({length: Math.floor((hz ? w : h)/6) - 1}, (_, j) => hz ? `M${x + 6 + j*6} ${y + 4}v${h - 8}` : `M${x + 4} ${y + 6 + j*6}h${w - 8}`).join("");
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${tone};stroke:#A39C66" stroke-width="1"/><path d="${lines}" style="stroke:#B4AD72" stroke-width=".6" opacity=".7"/><path d="${hz ? `M${x} ${y + 1.6}h${w}M${x} ${y + h - 1.6}h${w}` : `M${x + 1.6} ${y}v${h}M${x + w - 1.6} ${y}v${h}`}" style="stroke:${P.heri}" stroke-width="3.2"/>`; };
  // blocks of two mats, laid crosswise to their neighbours
  for (let b = 0; y0 + b*108 < 640; b++) for (let k = -1; k*108 < 560; k++) { const x = k*108 + (b % 2)*54, y = y0 + b*108;
    s += (k + b) % 2 === 0 ? mat(x, y, 108, 54, P.tatami) + mat(x, y + 54, 108, 54, P.tatami2) : mat(x, y, 54, 108, P.tatami2) + mat(x + 54, y, 54, 108, P.tatami); }
  return g(s); };
// the skirting where the floor meets the back wall, and the step down at the front
const skirt = (y = 200, col = P.timber2) => g(`<rect y="${y}" width="520" height="9" style="fill:${col}"/><path d="M0 ${y + 2} H520" style="stroke:#FFFFFF" stroke-width="1" opacity=".18"/><path d="M0 ${y + 9} H520" style="stroke:#3A2A20" stroke-width="1.4"/>`);
const step = (col = P.timber) => g(`<rect y="630" width="520" height="10" style="fill:${col}"/><path d="M0 630 H520" style="stroke:#3A2A20" stroke-width="1.4"/>`);
// a ceiling of dark timber rafters
const rafters = (h = 30, col = P.timber2, lite = P.timber) => g(`<rect width="520" height="${h}" style="fill:${col}"/>${Array.from({length: 14}, (_, k) => `<rect x="${k*40 - 6}" y="0" width="12" height="${h}" style="fill:${lite}"/>`).join("")}<rect y="${h - 10}" width="520" height="12" style="fill:${lite}"/><path d="M0 ${h - 10} h520" style="stroke:#2A1C14" stroke-width="1.2"/>`);
// soft Otaru stone in big blocks, the mortar pale
const stoneWall = (x, y, w, h) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.stone}"/>`;
  for (let r = 0; r*20 < h; r++) for (let k = -1; k*44 < w; k++) { const bx = x + k*44 + (r % 2)*22, by = y + r*20; const c = [P.stone, "#BFB7A6", "#ADA594", "#B3AB9A"][(r*5 + k*3 + 8) % 4];
    s += `<rect x="${Math.max(x, bx)}" y="${by}" width="${Math.min(44, x + w - Math.max(x, bx), bx + 44 - x)}" height="${Math.min(20, y + h - by)}" style="fill:${c};stroke:#D6D0C2" stroke-width="1.6"/>`; }
  return s; };
// horizontal logs, their round ends showing at the corners
const logWall = (x, y, w, h) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#A8743E"/>`;
  for (let r = 0; r*18 < h; r++) { const yy = y + r*18; s += `<rect x="${x}" y="${yy}" width="${w}" height="17" rx="8" style="fill:${r % 2 ? "#B88248" : "#AE7A42"}"/><path d="M${x} ${yy + 5} h${w}" style="stroke:#D09A5E" stroke-width="1.2" opacity=".6"/><path d="M${x} ${yy + 17} h${w}" style="stroke:#6E4A26" stroke-width="1.4"/>`; }
  return s; };
// a shoji screen: white paper on a fine lattice (kumiko)
const shoji = (x, y, w, h, cols = 3, rows = 6) => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.shoji}"/>${Array.from({length: cols - 1}, (_, k) => `<path d="M${f1(x + (k + 1)*w/cols)} ${y} v${h}" style="stroke:${P.shojiF}" stroke-width="1.4"/>`).join("")}${Array.from({length: rows - 1}, (_, k) => `<path d="M${x} ${f1(y + (k + 1)*h/rows)} h${w}" style="stroke:${P.shojiF}" stroke-width="1.4"/>`).join("")}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" style="stroke:${P.timber}" stroke-width="4"/>`,
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
// a red paper lantern (chochin) with black caps, hung from the beam
const chochin = (x, y, s = 1, top = 30) => g(`<path d="M${x} ${top} V${y - 14*s}" style="stroke:#2A1C14" stroke-width="1"/>`) + lampGlow(x, y, 26*s) + g(sk(`<rect x="${x - 7*s}" y="${y - 15*s}" width="${14*s}" height="${4*s}" style="fill:#2A2420"/><ellipse cx="${x}" cy="${y}" rx="${11*s}" ry="${12*s}" style="fill:${P.red}"/>${[-8, -4, 0, 4, 8].map(d => `<path d="M${f1(x - Math.sqrt(1 - (d/12)**2)*11*s)} ${f1(y + d*s)} h${f1(Math.sqrt(1 - (d/12)**2)*22*s)}" style="stroke:${P.red2}" stroke-width=".8"/>`).join("")}<ellipse cx="${x - 3*s}" cy="${y - 3*s}" rx="${3*s}" ry="${6*s}" style="fill:#F06A4A" opacity=".5"/><rect x="${x - 7*s}" y="${y + 11*s}" width="${14*s}" height="${4*s}" style="fill:#2A2420"/><path d="M${x} ${y + 15*s} v${6*s}" style="stroke:#E8B23A" stroke-width="${1.6*s}"/>`,
  `<ellipse cx="${x}" cy="${y}" rx="${11*s}" ry="${12*s}"/>`));
// an Otaru glass oil lamp hung on a chain: a coloured glass shade over a little flame
const oilLamp = (x, y, col = "#7EC4D6", top = 30) => g(`<path d="M${x} ${top} V${y - 16}" style="stroke:#3A3430" stroke-width="1" stroke-dasharray="2 1.4"/>`) + lampGlow(x, y, 28) + g(sk(`<path d="M${x - 4} ${y - 16} h8 l7 12 h-22z" style="fill:#4A4440"/><path d="M${x - 9} ${y - 4} q-4 10 2 16 h14 q6 -6 2 -16z" style="fill:${col}" opacity=".85"/><path d="M${x - 6} ${y} q-2 6 1 10" fill="none" style="stroke:#FFFFFF" stroke-width="1.2" opacity=".7"/><ellipse cx="${x}" cy="${y + 4}" rx="2.4" ry="4" style="fill:${P.glowL}"/><path d="M${x - 8} ${y + 12} h16" style="stroke:#4A4440" stroke-width="2"/>`,
  `<path d="M${x - 9} ${y - 4} q-4 10 2 16 h14 q6 -6 2 -16z"/>`));
// a potted plant: a little pine (in the ryokan), or broad green leaves
const pot = (x, y, kind = "leaf", col = "#8A6A52") => g(sk(`${kind === "pine" ? `<path d="M${x} ${y - 16} q-4 -14 4 -24 q-10 -6 -16 -2 M${x + 4} ${y - 40} q8 -4 14 2" fill="none" style="stroke:#6B4A34" stroke-width="3"/>${[[-16, -44, 14], [6, -52, 16], [16, -38, 11], [-6, -58, 10]].map(([dx, dy, r]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${r}" ry="${r*.5}" style="fill:#3E6A44"/><ellipse cx="${x + dx - 2}" cy="${y + dy - 2}" rx="${r*.6}" ry="${r*.25}" style="fill:#5E8A54"/>`).join("")}`
  : [[-12, -26], [-4, -36], [6, -32], [13, -22], [0, -24]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y - 18 + dy*.5}" rx="5" ry="12" transform="rotate(${dx*3} ${x + dx} ${y - 18 + dy*.5})" style="fill:#4E8A44"/>`).join("")}<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z" style="fill:${col}"/><path d="M${x - 13} ${y - 18} h26" style="stroke:#3A2A20" stroke-width="2.4"/>`,
  `<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z"/>`));
const stool = (x, y, col = P.timber, leg = P.timber2) => sk(`<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="4.2" style="fill:${col}"/><path d="M${x - 7} ${y - 18} l-3 18 M${x + 7} ${y - 18} l3 18 M${x} ${y - 17} v17" style="stroke:${leg}" stroke-width="2.2"/>`, `<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="4.2"/>`);
const chair = (x, y, col = P.pine2, seat = "#C9483A") => sk(`<rect x="${x - 11}" y="${y - 44}" width="22" height="22" rx="3" style="fill:${col}"/><path d="M${x - 7} ${y - 40} v14 M${x} ${y - 40} v14 M${x + 7} ${y - 40} v14" style="stroke:${P.pine3}" stroke-width="2"/><rect x="${x - 12}" y="${y - 22}" width="24" height="7" rx="2" style="fill:${seat}"/><path d="M${x - 10} ${y - 15} v15 M${x + 10} ${y - 15} v15" style="stroke:${P.pine3}" stroke-width="2.6"/>`,
  `<rect x="${x - 11}" y="${y - 44}" width="22" height="22" rx="3"/><rect x="${x - 12}" y="${y - 22}" width="24" height="7" rx="2"/>`);

/* ---------- the season through a window ---------- */
// a tree by season: maple (red in autumn), cherry (pink in sakura), birch (white bark, gold in autumn); bare and snowy in winter
const vTree = (x, y, h, kind = "maple") => { const S = SEASON, bark = kind === "birch" ? "#EDE8DE" : "#5E4634";
  const crown = S === "winter" ? "" : S === "spring" ? "#B9CF8A" : S === "sakura" ? (kind === "cherry" ? "#F4B8C8" : "#A8CF7A") : S === "summer" ? "#5E9A4A" : kind === "birch" ? "#E8B83A" : "#D2542E";
  const trunk = `<path d="M${x} ${y} q${-2} ${-h*.5} 0 ${-h}" fill="none" style="stroke:${bark}" stroke-width="${Math.max(2, h*.07)}"/><path d="M${x} ${y - h*.55} l${-h*.22} ${-h*.24} M${x} ${y - h*.7} l${h*.2} ${-h*.2}" style="stroke:${bark}" stroke-width="${Math.max(1.4, h*.035)}"/>${kind === "birch" ? [.2, .4, .62].map(t => `<path d="M${x - 1.6} ${f1(y - h*t)} h3" style="stroke:#3A3430" stroke-width="1"/>`).join("") : ""}`;
  if (S === "winter") return trunk + `<path d="M${x - h*.22} ${f1(y - h*.79)} q${h*.1} -2 ${h*.2} 2 M${x + h*.2} ${f1(y - h*.9)} q-${h*.1} -2 -${h*.18} 2" fill="none" style="stroke:#FFFFFF" stroke-width="2"/>`;
  const blobs = [[0, -.92, .34], [-.24, -.8, .26], [.24, -.78, .26], [-.12, -.66, .24], [.14, -.62, .22]];
  return trunk + blobs.map(([dx, dy, r], k) => `<circle cx="${f1(x + dx*h)}" cy="${f1(y + dy*h)}" r="${f1(r*h)}" style="fill:${crown}" opacity="${k ? .92 : 1}"/>`).join("")
    + (S === "sakura" && kind === "cherry" ? Array.from({length: 6}, (_, k) => `<circle cx="${f1(x + (R(k + x) - .5)*h)}" cy="${f1(y - h*.3 + R(k*3 + x)*h*.3)}" r="1.2" style="fill:#F8D0DC"/>`).join("") : "")
    + (S === "autumn" && kind === "maple" ? `<circle cx="${f1(x + h*.1)}" cy="${f1(y - h*.86)}" r="${f1(h*.12)}" style="fill:#E8823A"/>` : ""); };
const skyCol = () => ({winter: "#DCE6EE", spring: "#D8E8F0", sakura: "#DCEBF3", summer: "#C8E2F0", autumn: "#E0E8EC"})[SEASON];
const groundCol = () => ({winter: "#F4F7FA", spring: "#B4BE88", sakura: "#9CC46A", summer: "#7FB257", autumn: "#C2A562"})[SEASON];
// falling snow or sakura petals over a view
const drift = (x, y, w, h) => SEASON === "winter" ? Array.from({length: 14}, (_, k) => `<circle cx="${f1(x + R(k*3 + w)*w)}" cy="${f1(y + R(k*7 + h)*h)}" r="${f1(1 + R(k)*1.2)}" style="fill:#FFFFFF"/>`).join("")
  : SEASON === "sakura" ? Array.from({length: 8}, (_, k) => `<ellipse cx="${f1(x + R(k*3 + w)*w)}" cy="${f1(y + R(k*7 + h)*h)}" rx="1.8" ry="1.1" transform="rotate(${k*40} ${f1(x + R(k*3 + w)*w)} ${f1(y + R(k*7 + h)*h)})" style="fill:#F6C2D0"/>`).join("") : "";
// Mount Yotei: the near-perfect cone, its snow cap growing and shrinking with the year
const yotei = (cx, base, w, hgt) => { const cap = {winter: .75, spring: .55, sakura: .42, summer: .12, autumn: .2}[SEASON];
  const top = base - hgt, cw = w*cap*.5;
  return `<path d="M${cx - w/2} ${base} Q${cx - w*.2} ${top + hgt*.2} ${cx - w*.06} ${top} h${w*.12} Q${cx + w*.2} ${top + hgt*.2} ${cx + w/2} ${base}z" style="fill:#7E92A8"/>`
    + `<path d="M${f1(cx - w*.06 - cw*.55)} ${f1(top + hgt*cap*.6)} Q${cx - w*.1} ${top + 3} ${cx - w*.06} ${top} h${w*.12} Q${cx + w*.1} ${top + 3} ${f1(cx + w*.06 + cw*.55)} ${f1(top + hgt*cap*.6)} l-4 -5 l-5 7 l-5 -8 l-4 6 l-5 -6 l-5 7 l-5 -7 l-4 5z" style="fill:#FAFCFE"/>`; };

/* ---------- the morning market hall ---------- */
// sea urchin in a little wooden tray: rows of golden tongues
const uniTray = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><rect x="-14" y="-8" width="28" height="12" rx="1" style="fill:#E6CFA2;stroke:#A88A5A" stroke-width=".8"/>${[0, 1, 2].map(r => Array.from({length: 6}, (_, k) => `<ellipse cx="${-11 + k*4.4}" cy="${-5 + r*3.2}" rx="2.4" ry="1.5" style="fill:${(k + r) % 2 ? P.uni : "#F2B24A"}"/>`).join("")).join("")}</g>`;
// salmon roe glistening in a bowl
const ikura = (x, y, s = 1, bowl = P.navy) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-10 -2 q10 12 20 0z" style="fill:${bowl}"/><path d="M-10 -2 h20" style="stroke:#FFFDF6" stroke-width="1"/>${Array.from({length: 11}, (_, k) => `<circle cx="${f1(-8 + (k % 6)*3.2 + (k > 5 ? 1.6 : 0))}" cy="${k > 5 ? -5 : -2.8}" r="1.7" style="fill:${P.ikura}"/>`).join("")}<circle cx="-3" cy="-5.6" r=".6" style="fill:#FFFFFF"/><circle cx="3" cy="-3.4" r=".6" style="fill:#FFFFFF"/></g>`;
// a Hokkaido scallop in its shell, on the half shell showing its plump white meat
const scallop = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-8 0 q0 -10 8 -11 q8 1 8 11 q-8 3 -16 0z" style="fill:#E8C9A8;stroke:#B89270" stroke-width=".7"/>${[-5, -2.5, 0, 2.5, 5].map(d => `<path d="M0 -10 L${d} 0" style="stroke:#C9A07E" stroke-width=".6"/>`).join("")}<ellipse cx="0" cy="-3.6" rx="4" ry="3" style="fill:#FFF6EA"/><path d="M-4 -2 q4 3 8 0" fill="none" style="stroke:#F2A07A" stroke-width="1.2"/></g>`;
// a cooked king crab leg: red-orange shell, spines, pale underside
const crabLeg = (x, y, len, ang = 0, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${ang}) scale(${s})">${[0, 1, 2].map(k => { const x0 = k*len/3; return `<rect x="${f1(x0)}" y="-3.6" width="${f1(len/3 - 1.4)}" height="7.2" rx="3" style="fill:${P.crab}"/><path d="M${f1(x0 + 2)} 2.2 h${f1(len/3 - 5)}" style="stroke:#FBE6D6" stroke-width="1.6"/>${[.3, .6, .85].map(t => `<path d="M${f1(x0 + t*len/3)} -3.4 l1.2 -2.4 l1.2 2.4" style="fill:${P.crab2}"/>`).join("")}`; }).join("")}</g>`;
// a king crab, alive and dark burgundy in the tank, or cooked red
const kingCrab = (x, y, s = 1, col = "#8E3A30", col2 = "#6A2A22") => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[-1, 1].map(d => [0, 1, 2].map(k => `<path d="M${d*10} ${-2 + k*3} q${d*14} ${-12 + k*6} ${d*24} ${4 + k*6} l${d*3} ${8 + k*2}" fill="none" style="stroke:${col}" stroke-width="3.2" stroke-linecap="round"/><path d="M${d*20} ${-6 + k*6} l${d*1} -2 M${d*27} ${0 + k*6} l${d*2} -1.6" style="stroke:${col2}" stroke-width="1.2"/>`).join("")).join("")}
  <path d="M-6 6 q-8 2 -10 8 q4 2 8 -2 M6 6 q8 2 10 8 q-4 2 -8 -2" style="fill:${col}"/><ellipse rx="13" ry="10" style="fill:${col}"/><path d="M-9 -2 q9 -9 18 0" fill="none" style="stroke:${col2}" stroke-width="1.2"/>${[[-6, -3], [0, -6], [6, -3], [-3, 2], [4, 2]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.3" style="fill:${col2}"/>`).join("")}<circle cx="-3" cy="-9" r="1.2" style="fill:#1E1A18"/><circle cx="3" cy="-9" r="1.2" style="fill:#1E1A18"/></g>`;
// a kaisendon: rice in a bowl, piled with sea urchin, salmon roe, salmon, crab, a shiso leaf and wasabi
const donBowl = (x, y, s = 1, bowl = P.navy) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-14 -2 q14 18 28 0z" style="fill:${bowl}"/><path d="M-10 4 q10 6 20 0" fill="none" style="stroke:#FFFDF6" stroke-width=".8" opacity=".7"/><ellipse cx="0" cy="-2" rx="14" ry="4.2" style="fill:${P.rice}"/>
  <ellipse cx="-9" cy="-4" rx="4.4" ry="2.2" transform="rotate(-20 -9 -4)" style="fill:${P.shiso}"/>${[[-7, -5], [-4, -6.4], [-5.6, -3.2]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="2.6" ry="1.5" style="fill:${P.uni}"/>`).join("")}
  ${Array.from({length: 7}, (_, k) => `<circle cx="${f1(-1 + (k % 4)*2.4)}" cy="${k > 3 ? -6 : -3.6}" r="1.3" style="fill:${P.ikura}"/>`).join("")}<path d="M7 -3 q3 -5 7 -3 q-3 3 -7 3z" style="fill:${P.salmon}"/><path d="M8.4 -4.4 l3 -1.2" style="stroke:#FFE6DA" stroke-width=".7"/>
  <rect x="3" y="-9.4" width="8" height="3.4" rx="1.6" style="fill:${P.crab}"/><path d="M4 -6.6 h6" style="stroke:#FFF0E6" stroke-width=".9"/><circle cx="-1" cy="-7.4" r="1.3" style="fill:#9CC46A"/></g>`;
// a bundle of dried kombu, folded and tied
const kombu = (x, y, h, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[-5, -1.6, 1.8, 5.2].map((d, k) => `<path d="M${d} 0 q${k % 2 ? 2 : -2} ${h*.5} ${d*.4} ${h}" fill="none" style="stroke:${k % 2 ? P.kombu : "#3E4A36"}" stroke-width="4.4"/>`).join("")}<path d="M-6 ${h*.2} h12 M-6 ${h*.72} h12" style="stroke:#D8C79A" stroke-width="2"/><path d="M-4 ${h*.36} l2 4" style="stroke:#C9D2C0" stroke-width=".7" opacity=".5"/></g>`;
// a Yubari melon: smooth-netted green, a T-shaped stem; a slice with orange flesh
const melon = (x, y, r = 9) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" style="fill:${P.melon}"/>${[-.5, 0, .5].map(t => `<path d="M${f1(x - r*.9)} ${f1(y + t*r)} q${r*.9} ${-r*.3} ${f1(r*1.8)} 0 M${f1(x + t*r)} ${f1(y - r*.9)} q${-r*.3} ${r*.9} 0 ${f1(r*1.8)}" fill="none" style="stroke:#DCE8C2" stroke-width=".7"/>`).join("")}<path d="M${x} ${f1(y - r)} v-4 M${x - 3} ${f1(y - r - 4)} h6" style="stroke:#6E8A3A" stroke-width="1.6"/>`;
const melonSlice = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-10 0 q10 -14 20 0z" style="fill:${P.melonF}"/><path d="M-10 0 q10 -14 20 0" fill="none" style="stroke:#E8F0C8" stroke-width="1.4"/><path d="M-11 1 q11 -16 22 0" fill="none" style="stroke:${P.melon2}" stroke-width="2"/><path d="M-4 -3 q4 -4 8 0" fill="none" style="stroke:#F8C68A" stroke-width="1"/></g>`;
// a white polystyrene fish box heaped with crushed ice
const fishBox = (x, y, w, inner = "") => sk(`<rect x="${x}" y="${y}" width="${w}" height="22" rx="2" style="fill:#F4F4F0"/><path d="M${x} ${y + 6} h${w}" style="stroke:#D8D8D2" stroke-width="1"/><path d="M${x + 2} ${y} q${w/2} -8 ${w - 4} 0z" style="fill:${P.ice}"/>${inner}`, `<rect x="${x}" y="${y}" width="${w}" height="22" rx="2"/>`);
const salmonFish = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-18 0 q16 -8 32 -1 l6 -5 v12 l-6 -5 q-16 7 -32 -1z" style="fill:#B8C4CC"/><path d="M-16 1 q14 4 30 0" fill="none" style="stroke:#E8ECEE" stroke-width="2"/><path d="M-6 -4 q8 -2 16 0" fill="none" style="stroke:#8A9AA6" stroke-width="1"/><circle cx="-13" cy="-1.4" r="1.2" style="fill:#2A2420"/></g>`;
function hallRoom(){
  // the hall: plaster walls on a tongue-and-groove dado, a timber beam, the lanterns along it
  const wall = g(`<rect y="30" width="520" height="170" style="fill:${P.plaster}"/><rect y="134" width="520" height="66" style="fill:#B08A5E"/>${Array.from({length: 33}, (_, k) => `<path d="M${k*16 + 8} 134 v66" style="stroke:#8E6A44" stroke-width="1.2"/>`).join("")}<rect y="130" width="520" height="6" style="fill:${P.timber}"/>`)
    + rafters(30)
    // the painted sign over the stalls
    + g(sk(`<rect x="172" y="40" width="176" height="26" rx="3" style="fill:${P.navy}"/><rect x="176" y="44" width="168" height="18" rx="2" fill="none" style="stroke:#F6E3B4" stroke-width="1"/>`, `<rect x="172" y="40" width="176" height="26" rx="3"/>`) + txt(260, 58, "MORNING MARKET", 12, "#F6E3B4", 700))
    // the noren into the back, indigo with white waves (seigaiha), split in three
    + g(sk(`<path d="M196 76 h128" style="stroke:${P.timber2}" stroke-width="4" stroke-linecap="round"/>${[0, 1, 2].map(k => `<rect x="${198 + k*42}" y="78" width="40" height="46" style="fill:${P.navy}"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<path d="M${200 + k*42 + c*13} ${92 + r*12} a6 6 0 0 1 12 0" fill="none" style="stroke:#E8EEF2" stroke-width="1"/>`).join("")).join("")}`).join("")}`, `<rect x="198" y="78" width="124" height="46"/>`))
    // the kaisendon chalkboard over the bar on the left
    + g(sk(`<rect x="20" y="44" width="120" height="82" rx="2" style="fill:#2F3A34"/><rect x="20" y="44" width="120" height="82" rx="2" fill="none" style="stroke:${P.timber}" stroke-width="4"/>`, `<rect x="20" y="44" width="120" height="82" rx="2"/>`)
      + txt(80, 60, "KAISENDON", 9.6, "#F3D98A", 700) + ["Uni and ikura", "King crab", "Scallop and salmon", "Build your own bowl"].map((t, i) => txt(80, 75 + i*12, t, 7.8, i === 3 ? "#B9E08A" : "#E8EEE6")).join("")
      + `<circle cx="128" cy="115" r="4" style="fill:${P.uni}"/><circle cx="34" cy="115" r="3" style="fill:${P.ikura}"/>`)
    // a calendar with a red crab on it, and the clock
    + g(sk(`<rect x="150" y="80" width="34" height="46" style="fill:#FFFDF6"/><rect x="150" y="80" width="34" height="8" style="fill:${P.red}"/>${Array.from({length: 20}, (_, k) => `<rect x="${153 + (k % 5)*6}" y="${106 + Math.floor(k/5)*5}" width="4.4" height="3.4" style="fill:${k === 13 ? P.red : "#E4DED2"}"/>`).join("")}`, `<rect x="150" y="80" width="34" height="46"/>`) + kingCrab(167, 97, .38, P.crab, P.crab2)
      + sk(`<circle cx="362" cy="56" r="13" style="fill:#FFFDF6"/><path d="M362 56 v-8 M362 56 l6 3" style="stroke:${P.ink}" stroke-width="1.6"/>`, `<circle cx="362" cy="56" r="13"/>`))
    // the kombu bundles on hooks, and a shelf of white chocolate biscuit boxes
    + g(sk(`<path d="M384 80 h120" style="stroke:${P.timber2}" stroke-width="4" stroke-linecap="round"/>`, `<path d="M384 80 h120"/>`) + [396, 418, 440, 462, 484].map((x, k) => kombu(x, 82, 34 + (k % 2)*6, 1)).join("")
      + sk(`<rect x="380" y="152" width="124" height="5" style="fill:${P.timber}"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${386 + k*23}" y="${132 - (k % 2)*4}" width="20" height="${20 + (k % 2)*4}" rx="1" style="fill:#FFFDF6"/><rect x="${386 + k*23}" y="${138 - (k % 2)*4}" width="20" height="5" style="fill:#3E6EA8"/><circle cx="${396 + k*23}" cy="${147}" r="2" style="fill:#E8C26A"/>`).join("")}`, `<rect x="380" y="152" width="124" height="5"/>`))
    + chochin(150, 168, .9, 30) + chochin(370, 168, .9, 30) + chochin(30, 168, .7, 30) + chochin(490, 168, .7, 30);
  // the stalls: a sloped bed of crushed ice on a timber counter, wooden trays of sea urchin, bowls of roe, scallops, crab legs, price cards
  const card = (x, y, t) => `<rect x="${x - 9}" y="${y - 7}" width="18" height="9" rx="1" style="fill:#FFFDF6;stroke:#C8372D" stroke-width=".6"/>` + txt(x, y, t, 5.6, P.red, 700);
  const stalls = spot("hk_hall", 262, 384, "The market stalls", hovE(262, 366, 110, 14),
    sk(`<rect x="152" y="298" width="220" height="46" style="fill:${P.timber}"/>${[0, 1, 2, 3].map(k => `<rect x="${160 + k*53}" y="304" width="46" height="34" rx="2" style="fill:${P.timber2}"/>`).join("")}<rect x="146" y="292" width="232" height="8" rx="2" style="fill:${P.timberL}"/>
      <path d="M154 292 l10 -30 h196 l10 30z" style="fill:${P.ice}"/>${Array.from({length: 26}, (_, k) => `<path d="M${f1(160 + R(k)*200)} ${f1(266 + R(k*3)*24)} l3 -1.4" style="stroke:${P.ice2}" stroke-width="1.6"/>`).join("")}<path d="M154 292 l10 -30 h196 l10 30" fill="none" style="stroke:#A9C8D0" stroke-width="1.4"/>`,
      `<rect x="152" y="298" width="220" height="46"/><path d="M154 292 l10 -30 h196 l10 30z"/>`)
    + uniTray(184, 282, 1) + uniTray(214, 284, 1) + uniTray(199, 270, .9)
    + ikura(244, 284, 1) + ikura(266, 282, 1, "#FFFDF6") + ikura(256, 270, .9)
    + scallop(292, 286) + scallop(306, 284) + scallop(299, 274, .9) + scallop(316, 272, .8)
    + crabLeg(326, 286, 40, -28) + crabLeg(334, 288, 36, -36) + crabLeg(320, 282, 34, -20, .9)
    + card(184, 300, "UNI") + card(255, 300, "IKURA") + card(300, 300, "HOTATE") + card(346, 300, "KANI")
    + lab(262, 366, "Market stalls", "#F6E3B4", 10));
  // the kaisendon bar: a short counter, bowls made up, the round rice tub, soy and wasabi, stools along the front
  const don = spot("hkdon", 86, 408, "The kaisendon bar: build your bowl", hovE(86, 394, 62, 12),
    sk(`<rect x="22" y="292" width="124" height="48" style="fill:${P.timber}"/><path d="M28 300 h112 M28 318 h112" style="stroke:${P.timber2}" stroke-width="1.2"/><rect x="18" y="284" width="132" height="9" rx="2" style="fill:${P.timberL}"/>
      <ellipse cx="44" cy="276" rx="18" ry="5" style="fill:#C9A26A"/><path d="M26 276 v8 q18 6 36 0 v-8" style="fill:#B8925A"/><path d="M26 279 q18 6 36 0" fill="none" style="stroke:#8A6A3A" stroke-width="1.2"/><ellipse cx="44" cy="276" rx="15" ry="3.6" style="fill:${P.rice}"/><path d="M50 274 l12 -12" style="stroke:#D9C08A" stroke-width="2.4"/>
      <rect x="128" y="268" width="7" height="16" rx="2" style="fill:#3A2A20"/><rect x="129" y="264" width="5" height="5" style="fill:${P.red}"/><path d="M118 284 h10 l-2 -4 h-6z" style="fill:#7FA35A"/>`,
      `<rect x="22" y="292" width="124" height="48"/><rect x="18" y="284" width="132" height="9" rx="2"/>`)
    + donBowl(78, 282, 1.05) + donBowl(108, 284, .95, "#8A3A2A")
    + `<path d="M64 286 l26 -4 M66 289 l26 -4" style="stroke:#D9C08A" stroke-width="1.3"/>`
    + g(stool(40, 380, P.timberL) + stool(86, 380, P.timberL) + stool(132, 380, P.timberL))
    + lab(86, 394, "Kaisendon bar", "#F6E3B4", 9));
  // the crab tank: a glass tank of live king crab on a steel stand, the pump bubbling
  const tank = spot("hktank", 442, 384, "The tank of live king crab", hovE(442, 368, 52, 11),
    sk(`<rect x="384" y="318" width="116" height="34" style="fill:${P.steel2}"/><path d="M390 352 v4 M494 352 v4" style="stroke:#5A6066" stroke-width="4"/><rect x="380" y="314" width="124" height="6" style="fill:${P.steel}"/>
      <rect x="386" y="238" width="112" height="76" style="fill:${P.water}" opacity=".9"/><rect x="386" y="238" width="112" height="14" style="fill:#B8DCE6" opacity=".7"/><path d="M386 300 q28 -6 56 0 q28 6 56 0 v14 h-112z" style="fill:#C9B68A"/>
      <rect x="386" y="238" width="112" height="76" fill="none" style="stroke:#5A6066" stroke-width="3"/><path d="M392 246 v22" style="stroke:#FFFFFF" stroke-width="2.4" opacity=".6"/><path d="M490 232 v40" style="stroke:#3A4046" stroke-width="2.4"/>`,
      `<rect x="386" y="238" width="112" height="76"/><rect x="380" y="314" width="124" height="38"/>`)
    + kingCrab(418, 292, .82) + kingCrab(466, 298, .7, "#7E3228", "#5A2420")
    + Array.from({length: 7}, (_, k) => `<circle cx="${f1(488 - (k % 2)*3)}" cy="${270 - k*4}" r="${f1(1 + R(k)*1.2)}" fill="none" style="stroke:#FFFFFF" stroke-width=".8"/>`).join("")
    + g(sk(`<rect x="406" y="324" width="72" height="18" rx="2" style="fill:#FFFDF6"/>`, `<rect x="406" y="324" width="72" height="18" rx="2"/>`) + txt(442, 336, "LIVE KING CRAB", 6.4, P.red, 700))
    + lab(442, 368, "Crab tank", "#CFE6EE", 9));
  // the front: fish boxes on ice (left), a crate of kombu; crates of Yubari melons, corn and potatoes (right), the market cat asleep
  const frontL = g(fishBox(24, 574, 64, salmonFish(56, 570, .9)) + fishBox(92, 574, 62, [0, 1, 2, 3].map(k => scallop(104 + k*12, 572, .8)).join(""))
    + fishBox(30, 548, 58, salmonFish(60, 546, .8)) + sk(`<path d="M128 574 h22 v-26 h-22z" style="fill:#3E7AB0"/><path d="M126 548 h26" style="stroke:#2E5A8A" stroke-width="3"/>`, `<path d="M128 574 h22 v-26 h-22z"/>`)
    + `<path d="M132 548 q7 -10 14 0" fill="none" style="stroke:#8E9AA2" stroke-width="2"/>` + Array.from({length: 4}, (_, k) => `<ellipse cx="${134 + k*4}" cy="547" rx="3" ry="2" style="fill:#2F2B28"/>`).join(""));
  const barrel = g(sk(`<path d="M28 500 q-4 -30 4 -50 h40 q8 20 4 50z" style="fill:#A87A4A"/><path d="M28 462 h48 M27 488 h50" style="stroke:#5E5A56" stroke-width="2.4"/>`, `<path d="M28 500 q-4 -30 4 -50 h40 q8 20 4 50z"/>`)
    + [36, 48, 60, 70].map((x, k) => kombu(x, 432 - (k % 2)*4, 24, .8)).join("") + sk(`<rect x="34" y="472" width="36" height="12" rx="1" style="fill:#FFFDF6"/>`, `<rect x="34" y="472" width="36" height="12" rx="1"/>`) + txt(52, 481, "KOMBU", 6.4, P.ink, 700));
  const crate = (x, y, w, h) => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#C9A26A"/>${Array.from({length: Math.floor(h/8)}, (_, k) => `<path d="M${x} ${y + 4 + k*8} h${w}" style="stroke:#9A7A4A" stroke-width="1"/>`).join("")}`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
  const frontR = g(crate(354, 566, 70, 30) + melon(368, 560) + melon(388, 562) + melon(408, 560) + melon(378, 548, 8) + melon(398, 548, 8)
    + crate(428, 566, 72, 30) + Array.from({length: 5}, (_, k) => `<path d="M${434 + k*12} 566 l8 -18" style="stroke:#F3D34A" stroke-width="7" stroke-linecap="round"/><path d="M${436 + k*12} 562 l-4 -12" style="stroke:#8FB85A" stroke-width="2"/>`).join("")
    + crate(440, 538, 58, 22) + Array.from({length: 7}, (_, k) => `<ellipse cx="${448 + (k % 4)*13}" cy="${538 - Math.floor(k/4)*5}" rx="6" ry="4.4" style="fill:#B8925A"/>`).join("")
    // the market cat, a ginger and white one, asleep on the potato crate
    + `<ellipse cx="482" cy="530" rx="12" ry="6.4" style="fill:#E8A05A"/><circle cx="472" cy="528" r="5" style="fill:#E8A05A"/><path d="M469 524 l1 -4 l3 3 M473 523 l2 -4 l2 4" style="fill:#E8A05A"/><path d="M470 529 q2 1 4 0" fill="none" style="stroke:${P.ink}" stroke-width=".7"/><path d="M492 532 q6 0 4 -6" fill="none" style="stroke:#E8A05A" stroke-width="3" stroke-linecap="round"/><path d="M478 530 q4 3 10 0" fill="none" style="stroke:#FFFDF6" stroke-width="2"/>`
    + sk(`<rect x="356" y="584" width="46" height="10" rx="1" style="fill:#FFFDF6"/>`, ``) + txt(379, 592, "YUBARI MELON", 5.4, "#3E7A3A", 700));
  const soup = g(sk(`<rect x="440" y="456" width="60" height="8" rx="2" style="fill:${P.timberL}"/><path d="M446 464 v32 M494 464 v32" style="stroke:${P.timber2}" stroke-width="4"/><path d="M450 456 q-2 -20 10 -22 h16 q12 2 10 22z" style="fill:#5A5E66"/><ellipse cx="468" cy="434" rx="15" ry="3.4" style="fill:#C9884A"/><path d="M466 432 l12 -14" style="stroke:${P.timber}" stroke-width="2"/>
      ${[0, 1, 2].map(k => `<path d="M${484 + (k % 2)*6} ${456 - Math.floor(k/2)*6} l1 -6 h6 l1 6z" style="fill:#FFFDF6"/>`).join("")}<rect x="446" y="474" width="48" height="16" rx="1" style="fill:#FFFDF6"/>`, `<rect x="440" y="456" width="60" height="8" rx="2"/><path d="M450 456 q-2 -20 10 -22 h16 q12 2 10 22z"/>`)
    + `<path d="M460 428 q-4 -8 0 -14 M472 428 q4 -8 0 -14" fill="none" style="stroke:#FFFFFF" stroke-width="1.4" opacity=".8"/>` + txt(470, 482, "CRAB MISO", 5.6, P.red, 700) + txt(470, 488.6, "free, help yourself", 4.4, P.ink));
  return tiles(200, ["#A7ADA8", "#9FA6A1", "#AEB3AE", "#989F9A"], "#838A85", 56, 42) + skirt(200) + wall + stalls + don + tank + barrel + soup + frontL + frontR + step("#7E8580") + exit(P.navy);
}

/* ---------- Kenta's glassworks ---------- */
// a glass float (ukidama) in its rope net
const float = (x, y, r, col) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" style="fill:${col}" opacity=".88"/><ellipse cx="${f1(x - r*.35)}" cy="${f1(y - r*.35)}" rx="${f1(r*.28)}" ry="${f1(r*.18)}" style="fill:#FFFFFF" opacity=".7"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${r}" ry="${f1(r*.34)}" fill="none" style="stroke:#C9A26A" stroke-width=".9"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r*.34)}" ry="${r}" fill="none" style="stroke:#C9A26A" stroke-width=".9"/><path d="M${x} ${f1(y - r)} v-3" style="stroke:#C9A26A" stroke-width="1.2"/>`;
const GL = ["#7EC4D6", "#8ED0A8", "#E8B24A", "#5E8EC6", "#C98AB8", "#B8DCE6"];
// a piece of glassware on a shelf: a cup, a bowl, a vase or a little bottle
const glassware = (x, y, kind, col) => kind === 0 ? `<path d="M${x - 5} ${y - 14} h10 l-1.6 14 h-6.8z" style="fill:${col}" opacity=".85"/><path d="M${x - 3} ${y - 12} v8" style="stroke:#FFFFFF" stroke-width="1" opacity=".7"/>`
  : kind === 1 ? `<path d="M${x - 9} ${y - 8} q9 12 18 0z" style="fill:${col}" opacity=".85"/><path d="M${x - 9} ${y - 8} h18" style="stroke:#FFFFFF" stroke-width=".8" opacity=".8"/>`
  : kind === 2 ? `<path d="M${x - 3} ${y - 22} h6 q0 6 3 10 q3 6 0 12 h-12 q-3 -6 0 -12 q3 -4 3 -10z" style="fill:${col}" opacity=".85"/><path d="M${x - 4} ${y - 10} v6" style="stroke:#FFFFFF" stroke-width="1" opacity=".7"/>`
  : `<circle cx="${x}" cy="${y - 6}" r="6" style="fill:${col}" opacity=".85"/><rect x="${x - 1.6}" y="${y - 16}" width="3.2" height="5" style="fill:${col}"/><circle cx="${x - 2}" cy="${y - 8}" r="1.4" style="fill:#FFFFFF" opacity=".7"/>`;
// a music box: a little wooden case, the lid open, the brass cylinder and steel comb showing
const musicBox = (x, y, w, col = "#8A5A3A", lid = "#C9483A") => `<path d="M${x - w/2} ${y - 12} l3 -14 h${w - 6} l3 14z" style="fill:${lid}"/><path d="M${x - w/2 + 4} ${y - 14} l2 -9 h${w - 12} l2 9z" style="fill:#E8D8B0"/><rect x="${x - w/2}" y="${y - 12}" width="${w}" height="12" rx="1" style="fill:${col}"/><rect x="${x - w/2 + 3}" y="${y - 11}" width="${w - 6}" height="5" style="fill:#3A2A20"/><rect x="${x - w/2 + 5}" y="${y - 10.6}" width="${w*.5}" height="3.4" rx="1.6" style="fill:#E0B252"/>${Array.from({length: 5}, (_, k) => `<path d="M${f1(x + w*.12 + k*2)} ${y - 10.4} v3.2" style="stroke:${P.steel}" stroke-width=".9"/>`).join("")}<path d="M${x - w/2} ${y - 3} h${w}" style="stroke:#E8C27A" stroke-width=".8"/>`;
function glassRoom(){
  // an old Otaru stone warehouse: soft stone walls, heavy timber trusses, an arched window with its iron shutters folded back onto the canal
  const canal = clip(196, 62, 76, 70, `<rect x="196" y="62" width="76" height="70" style="fill:${skyCol()}"/>${stoneWall(196, 86, 76, 24)}<path d="M196 86 l10 -12 h24 l10 12 M234 86 l8 -10 h20 l8 10" style="fill:#5A5E66"/>${SEASON === "winter" ? `<path d="M196 86 l10 -12 h24 l10 12 M234 86 l8 -10 h20 l8 10" fill="none" style="stroke:#FFFFFF" stroke-width="2.4"/>` : ""}<rect x="196" y="110" width="76" height="22" style="fill:#5E8E9A"/>${[0, 1, 2].map(k => `<path d="M${200 + k*24} ${118 + (k % 2)*6} q5 -3 10 0" fill="none" style="stroke:#9CC4CE" stroke-width="1.2"/>`).join("")}<path d="M258 112 v-30" style="stroke:#2F2B28" stroke-width="2"/><circle cx="258" cy="80" r="3" style="fill:${P.glowL}"/>${drift(196, 62, 76, 70)}`);
  const wall = g(stoneWall(0, 30, 520, 170))
    + g(`<rect width="520" height="30" style="fill:${P.timber2}"/>${[90, 260, 430].map(x => `<path d="M${x - 90} 30 L${x} 4 L${x + 90} 30" fill="none" style="stroke:${P.timber}" stroke-width="7"/><path d="M${x} 4 v26" style="stroke:${P.timber}" stroke-width="6"/>`).join("")}<rect y="26" width="520" height="10" style="fill:${P.timber}"/>`)
    // the arched window
    + g(sk(`<path d="M190 136 v-70 q44 -28 88 0 v70z" style="fill:#4A4440"/>`, `<path d="M190 136 v-70 q44 -28 88 0 v70z"/>`) + canal + sk(`<path d="M196 132 v-62 q38 -22 76 0 v62" fill="none" style="stroke:#4A4440" stroke-width="2"/><path d="M234 54 v78 M196 98 h76" style="stroke:#4A4440" stroke-width="2.4"/>${[[166, 1], [280, -1]].map(([x]) => `<rect x="${x}" y="66" width="22" height="68" style="fill:#3E4246"/>${[78, 96, 114].map(y => `<circle cx="${x + 6}" cy="${y}" r="1.4" style="fill:#8A9096"/><circle cx="${x + 16}" cy="${y}" r="1.4" style="fill:#8A9096"/>`).join("")}`).join("")}<rect x="184" y="134" width="100" height="6" style="fill:${P.stone3}"/>`, `<rect x="166" y="66" width="22" height="68"/><rect x="280" y="66" width="22" height="68"/>`))
    // the sign: KENTA GLASS, painted on a board
    + g(sk(`<rect x="20" y="42" width="130" height="22" rx="3" style="fill:${P.timber2}"/>`, `<rect x="20" y="42" width="130" height="22" rx="3"/>`) + txt(85, 58, "KENTA GLASS", 11, "#F3D98A", 700))
    // shelves of glass behind the counter on the right, catching the light
    + g(sk(`${[100, 140, 180].map(y => `<rect x="314" y="${y}" width="190" height="5" style="fill:${P.timber}"/>`).join("")}<path d="M316 62 v124 M502 62 v124" style="stroke:${P.timber}" stroke-width="4"/>`, `<rect x="314" y="100" width="190" height="5"/><rect x="314" y="140" width="190" height="5"/><rect x="314" y="180" width="190" height="5"/>`)
      + [100, 140, 180].map((y, r) => Array.from({length: 9}, (_, k) => glassware(328 + k*21, y, (k + r*2) % 4, GL[(k + r) % 6])).join("")).join(""))
    // glass floats in nets hung on the wall on the left
    + g(`<path d="M24 78 q60 20 130 0" fill="none" style="stroke:#C9A26A" stroke-width="1.6"/>` + [[40, 96, 11, 0], [66, 104, 13, 1], [94, 106, 12, 3], [122, 100, 11, 2], [146, 92, 9, 5], [54, 124, 9, 3], [82, 130, 10, 0], [110, 128, 9, 4]].map(([x, y, r, c]) => float(x, y, r, GL[c])).join(""))
    + oilLamp(120, 160, "#E8B24A", 36) + oilLamp(380, 70, "#7EC4D6", 36) + oilLamp(470, 70, "#C98AB8", 36);
  // the furnace: a brick glory hole glowing orange, the blowpipes on their rack, the steel marver, a water bucket, the bench
  const blow = spot("hkblow", 98, 404, "The furnace: blow your own glass float", hovE(98, 388, 72, 12),
    lampGlow(70, 262, 60) + sk(`<path d="M22 340 v-110 q0 -24 48 -26 q48 2 48 26 v110z" style="fill:${P.brick}"/>${[244, 262, 280, 298, 316].map((y, r) => `<path d="M22 ${y} h96" style="stroke:${P.brick2}" stroke-width="1"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${26 + k*22 + (r % 2)*11} ${y} v18" style="stroke:${P.brick2}" stroke-width="1"/>`).join("")}`).join("")}
      <circle cx="70" cy="262" r="20" style="fill:#3A1E14"/><circle cx="70" cy="262" r="15" style="fill:#FF8A2A"/><circle cx="70" cy="262" r="9" style="fill:${P.glowL}"/><path d="M52 262 a18 18 0 0 1 36 0" fill="none" style="stroke:#5A5E66" stroke-width="5"/>
      <path d="M54 206 v-32 h32 v32" style="fill:#5A5E66"/><path d="M60 174 v-24 M80 174 v-24" style="stroke:#5A5E66" stroke-width="5"/>
      <rect x="126" y="300" width="38" height="8" rx="1" style="fill:${P.steel}"/><path d="M130 308 v32 M160 308 v32" style="stroke:${P.steel2}" stroke-width="3.4"/>
      <path d="M128 236 h38" style="stroke:${P.timber}" stroke-width="5" stroke-linecap="round"/>${[134, 142, 150, 158].map((x, k) => `<path d="M${x} 236 l${-4 + k} 70" style="stroke:#6E7378" stroke-width="2.4"/>`).join("")}
      <path d="M90 300 l40 -26" style="stroke:#6E7378" stroke-width="3"/><circle cx="88" cy="301" r="7" style="fill:#FF9A3A"/><circle cx="88" cy="301" r="4" style="fill:${P.glowL}"/>`,
      `<path d="M22 340 v-110 q0 -24 48 -26 q48 2 48 26 v110z"/><rect x="126" y="300" width="38" height="8" rx="1"/>`)
    + g(sk(`<path d="M140 362 l-4 -22 h28 l-4 22z" style="fill:#8E9AA2"/><ellipse cx="150" cy="340" rx="14" ry="3.4" style="fill:#5E9AAE"/>`, `<path d="M140 362 l-4 -22 h28 l-4 22z"/>`))
    + lab(98, 388, "Blow a glass float", "#FFE2B8", 9));
  // the shop: a glass-topped counter, bowls and cups and little vases on it, a basket of floats, wind chimes on a rail
  const shop = spot("hk_glass", 350, 384, "Kenta's glass shop", hovE(350, 366, 110, 14),
    sk(`<rect x="232" y="306" width="236" height="38" style="fill:${P.timber}"/>${[0, 1, 2, 3].map(k => `<rect x="${242 + k*56}" y="312" width="48" height="26" rx="2" style="fill:${P.timber2}"/>`).join("")}
      <rect x="232" y="276" width="236" height="30" style="fill:#E8F4F2" opacity=".55"/><rect x="236" y="294" width="228" height="10" style="fill:#3A3430"/><rect x="232" y="276" width="236" height="30" fill="none" style="stroke:${P.timberL}" stroke-width="3"/><rect x="228" y="270" width="244" height="7" rx="1" style="fill:${P.timber2}"/>
      <path d="M244 280 l16 0" style="stroke:#FFFFFF" stroke-width="2" opacity=".7"/>
      <path d="M418 270 l-4 -16 h40 l-4 16z" style="fill:#C9A26A"/>${Array.from({length: 5}, (_, k) => `<path d="M${417 + k*8} 256 l-2 13" style="stroke:#8A6A3A" stroke-width=".8"/>`).join("")}`,
      `<rect x="232" y="270" width="236" height="74"/><path d="M418 270 l-4 -16 h40 l-4 16z"/>`)
    + [[252, 0], [272, 2], [292, 1], [316, 3], [338, 0], [360, 2], [382, 1]].map(([x, kd], k) => glassware(x, 270, kd, GL[(k*2) % 6])).join("")
    + [[426, 252, 7, 0], [440, 250, 8, 3], [454, 252, 7, 1], [433, 242, 6, 2], [447, 241, 6, 4]].map(([x, y, r, c]) => float(x, y, r, GL[c])).join("")
    + [254, 274, 294, 314, 334, 354].map((x, k) => `<circle cx="${x}" cy="299" r="3.4" style="fill:${GL[k % 6]}" opacity=".9"/>`).join("")
    + lab(350, 366, "Glass shop", "#CFE6EE", 10));
  // the music boxes: a tiered stand of little boxes, lids open, a carousel one on top
  const boxes = spot("hkmusicboxes", 452, 526, "The shelf of music boxes", hovE(452, 512, 50, 11),
    sk(`<path d="M404 494 h96 v-10 h-96z M412 484 v-34 h80 v34 M420 450 v-28 h64 v28" style="fill:${P.timber}"/><path d="M404 484 h96 M412 450 h80 M420 422 h64" style="stroke:${P.timber2}" stroke-width="3"/>`, `<path d="M404 494 h96 v-10 h-96z M412 484 v-34 h80 v34 M420 450 v-28 h64 v28"/>`)
    + musicBox(428, 484, 26) + musicBox(458, 484, 26, "#5A3A2A", "#3E6EA8") + musicBox(486, 484, 22, "#A87A4A", "#E8D8B0")
    + musicBox(434, 450, 24, "#6E4A30", "#7FA35A") + musicBox(468, 450, 26, "#8A5A3A", "#C98AB8")
    + sk(`<path d="M452 422 v-16" style="stroke:#E0B252" stroke-width="2"/><path d="M436 406 q16 -14 32 0z" style="fill:${P.red}"/><path d="M436 406 h32" style="stroke:#E0B252" stroke-width="2"/><rect x="438" y="406" width="28" height="4" style="fill:#E8D8B0"/>${[442, 452, 462].map(x => `<path d="M${x} 410 v8" style="stroke:#E0B252" stroke-width="1.2"/><ellipse cx="${x}" cy="416" rx="3" ry="2" style="fill:#FFFDF6"/>`).join("")}<rect x="434" y="418" width="36" height="4" style="fill:#5A3A2A"/>`, `<path d="M436 406 q16 -14 32 0z"/>`)
    + `<path d="M412 400 q4 -6 8 -4 M486 398 q4 -4 8 0" fill="none" style="stroke:#8A6A9A" stroke-width="1.2"/><circle cx="420" cy="392" r="1.6" style="fill:#8A6A9A"/><circle cx="494" cy="392" r="1.6" style="fill:#8A6A9A"/>`
    + lab(452, 512, "Music boxes", "#F0D8E8", 9));
  // the front: a heap of old fishing floats in a net (left), a crate packed with straw and wrapped glass (right), a stack of cullet jars
  const heap = g(sk(`<path d="M20 596 q4 -60 64 -64 q64 4 66 64z" style="fill:#7A6A4E" opacity=".25"/>`, ``)
    + [[40, 584, 16, 0], [74, 586, 18, 3], [110, 586, 16, 1], [138, 588, 12, 5], [56, 556, 14, 2], [90, 554, 15, 0], [122, 560, 12, 4], [72, 530, 12, 1], [104, 530, 11, 3]].map(([x, y, r, c]) => float(x, y, r, GL[c])).join("")
    + `<path d="M24 596 q30 -80 120 -6" fill="none" style="stroke:#C9A26A" stroke-width="1.2" stroke-dasharray="3 3"/>`);
  const crate = g(sk(`<rect x="370" y="556" width="74" height="40" style="fill:#C9A26A"/>${[566, 576, 586].map(y => `<path d="M370 ${y} h74" style="stroke:#9A7A4A" stroke-width="1"/>`).join("")}<path d="M372 556 q36 -14 70 0" style="fill:#E8D08A"/>${Array.from({length: 12}, (_, k) => `<path d="M${376 + k*5.6} 554 l${(k % 3) - 1} -6" style="stroke:#D9B860" stroke-width="1"/>`).join("")}`, `<rect x="370" y="556" width="74" height="40"/>`)
    + glassware(392, 552, 2, GL[0]) + glassware(420, 552, 2, GL[2])
    + sk(`${[0, 1, 2].map(k => `<rect x="${454 + k*15}" y="${566 - (k % 2)*4}" width="13" height="${30 + (k % 2)*4}" rx="2" style="fill:#E8F1F0" opacity=".9"/>${Array.from({length: 5}, (_, j) => `<circle cx="${457 + k*15 + (j % 2)*5}" cy="${572 + j*5}" r="2" style="fill:${GL[(j + k) % 6]}"/>`).join("")}`).join("")}`, `<rect x="454" y="562" width="43" height="34"/>`));
  const benchL = g(sk(`<rect x="22" y="440" width="70" height="8" rx="2" style="fill:${P.timber}"/><path d="M28 448 v20 M86 448 v20" style="stroke:${P.timber2}" stroke-width="4"/>${[0, 1, 2].map(k => `<path d="M${30 + k*20} 440 l${-2 + k} -28" style="stroke:#6E7378" stroke-width="2.4"/>`).join("")}<path d="M36 430 h52" style="stroke:#C9A26A" stroke-width="1.4"/>`, `<rect x="22" y="440" width="70" height="8" rx="2"/>`)
    + `<circle cx="84" cy="436" r="5" style="fill:#5E8EC6" opacity=".85"/>`);
  return boards(200, ["#7A5A42", "#6E5038", "#86644A"], "#4A3426") + skirt(200, P.stone3) + wall + blow + shop + boxes + benchL + heap + crate + step(P.stone3) + exit(P.timber2);
}

/* ---------- Mrs Sato's ryokan ---------- */
// a stone bath in the garden: rocks round hot water, steam rising, a bamboo spout
const rotenburo = (x, y, w) => `<path d="M${x - w/2} ${y} q${w/2} 16 ${w} 0 q-6 -16 ${-w/2} -16 q${-w/2 + 6} 0 ${-w/2} 16z" style="fill:#6A8E98"/><ellipse cx="${x}" cy="${y - 4}" rx="${w*.42}" ry="8" style="fill:#9CC8CC"/>`
  + Array.from({length: 9}, (_, k) => { const a = Math.PI*(k/8); return `<ellipse cx="${f1(x - Math.cos(a)*w*.48)}" cy="${f1(y - 4 - Math.sin(a)*12 + (k % 2)*2)}" rx="${7 + (k % 3)*2}" ry="5" style="fill:${k % 2 ? "#7E7A72" : "#948F84"}"/>`; }).join("")
  + `<path d="M${x + w*.38} ${y - 26} l-14 8" style="stroke:#7FA35A" stroke-width="4" stroke-linecap="round"/><path d="M${x + w*.3} ${y - 21} q-2 6 -1 12" fill="none" style="stroke:#CFE8EE" stroke-width="1.6"/>`
  + `<path d="M${x - 16} ${y - 10} q-6 -12 2 -22 q8 -10 0 -22 M${x + 4} ${y - 10} q6 -12 -2 -22 q-8 -10 2 -20 M${x + 22} ${y - 10} q-4 -10 2 -18" fill="none" style="stroke:#FFFFFF" stroke-width="3" opacity=".55" stroke-linecap="round"/>`
  + (SEASON === "winter" ? Array.from({length: 7}, (_, k) => `<ellipse cx="${f1(x - w*.46 + k*w*.15)}" cy="${f1(y - 10 - (k % 2)*4 - Math.sin(Math.PI*k/6)*10)}" rx="6" ry="2.4" style="fill:#FFFFFF"/>`).join("") : "");
// a stone lantern (toro)
const toro = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-22" width="8" height="22" style="fill:#9A958A"/><rect x="-9" y="-30" width="18" height="8" style="fill:#A8A396"/><rect x="-6" y="-28" width="12" height="5" style="fill:#F3D98A"/><path d="M-13 -30 l13 -9 l13 9z" style="fill:#8E897E"/><circle cx="0" cy="-41" r="2.4" style="fill:#8E897E"/>${SEASON === "winter" ? `<path d="M-13 -31 l13 -9 l13 9 q-13 -4 -26 0z" style="fill:#FFFFFF"/>` : ""}</g>`;
// the garden beyond the screens: a raked gravel bed, a pine, a maple or cherry, rocks and moss, the lantern; deep snow in winter
const ryoGarden = (x, y, w, h, bath = false) => clip(x, y, w, h, `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${skyCol()}"/>
  <path d="M${x} ${y + h*.36} q${w*.3} -14 ${w*.6} -4 t${w*.6} 2 V${y + h} H${x}z" style="fill:${SEASON === "winter" ? "#E8EEF2" : "#5E7E5A"}"/>
  <rect x="${x}" y="${y + h*.52}" width="${w}" height="${h*.48}" style="fill:${SEASON === "winter" ? "#F6F9FB" : bath ? "#B8B0A0" : "#D8D2C2"}"/>
  ${!bath && SEASON !== "winter" ? Array.from({length: 5}, (_, k) => `<path d="M${x} ${f1(y + h*.6 + k*6)} h${w}" style="stroke:#C4BCAA" stroke-width="1"/>`).join("") : ""}
  ${vTree(x + w*.18, y + h*.66, h*.62, bath ? "birch" : "maple")}${vTree(x + w*.84, y + h*.62, h*.5, "cherry")}
  <path d="M${x + w*.5} ${y + h*.6} q-16 -10 -6 -26 q-14 -2 -12 -12 q10 -6 20 2 q8 -12 22 -4 q4 10 -8 14 q12 8 0 20z" style="fill:#3E6A44"/><path d="M${x + w*.52} ${y + h*.6} v-18" style="stroke:#5E4634" stroke-width="3"/>
  ${SEASON === "winter" ? `<path d="M${x + w*.4} ${y + h*.36} q10 -6 20 -2 M${x + w*.46} ${y + h*.26} q8 -4 16 0" fill="none" style="stroke:#FFFFFF" stroke-width="3"/>` : ""}
  ${bath ? rotenburo(x + w*.52, y + h*.92, w*.6) : toro(x + w*.66, y + h*.84, 1.1) + `<ellipse cx="${x + w*.36}" cy="${y + h*.82}" rx="12" ry="6" style="fill:#8E897E"/><ellipse cx="${x + w*.36}" cy="${y + h*.79}" rx="8" ry="3" style="fill:${SEASON === "winter" ? "#FFFFFF" : "#6E9A5A"}"/>`}
  ${drift(x, y, w, h)}`);
// folded yukata, indigo with white patterns, in a stack; a bag of bath salts
const yukata = (x, y, col, pat, w = 30) => `<rect x="${x - w/2}" y="${y - 7}" width="${w}" height="7" rx="1.4" style="fill:${col}"/>${Array.from({length: Math.floor(w/7)}, (_, k) => `<circle cx="${x - w/2 + 4 + k*7}" cy="${y - 3.6}" r="1.3" style="fill:${pat}"/>`).join("")}<path d="M${x - w/2 + 2} ${y - 1} h${w - 4}" style="stroke:${P.ink}" stroke-width=".4" opacity=".3"/>`;
const saltJar = (x, y, col) => `<rect x="${x - 5}" y="${y - 12}" width="10" height="12" rx="2" style="fill:#E8F1F0" opacity=".9"/><rect x="${x - 4}" y="${y - 8}" width="8" height="7.4" style="fill:${col}"/><rect x="${x - 5.6}" y="${y - 14}" width="11.2" height="3" rx="1" style="fill:${P.timber}"/>`;
function ryokanRoom(){
  // pale clay walls framed in cedar, shoji, a nageshi rail; the garden through the open screens on the left, the bath on the right
  const wall = g(`<rect y="30" width="520" height="170" style="fill:#E6DCC4"/><rect y="0" width="520" height="30" style="fill:#C9B48E"/>${Array.from({length: 26}, (_, k) => `<path d="M${k*20 + 10} 0 v30" style="stroke:#B09A72" stroke-width="1.2"/>`).join("")}<rect y="26" width="520" height="8" style="fill:${P.timber}"/><rect y="56" width="520" height="7" style="fill:${P.timber}"/>`)
    // the ranma: a carved transom of openwork clouds and flying cranes over the screens
    + g(`<rect y="34" width="520" height="22" style="fill:#9A7452"/>${Array.from({length: 13}, (_, k) => `<path d="M${k*40 + 6} 50 q4 -10 12 -6 q6 -8 14 -2 q8 0 6 8z" style="fill:#F1E6CC" opacity=".85"/>`).join("")}${[130, 390].map(x => `<path d="M${x - 14} 44 q7 -6 14 0 q7 -6 14 0 q-7 2 -14 2 q-7 0 -14 -2z" style="fill:#3A2A20"/><circle cx="${x + 15}" cy="43" r="1.4" style="fill:#C8372D"/>`).join("")}`)
    // the garden through the open screens (left), its sliding screens pushed back
    + g(ryoGarden(18, 64, 150, 136)) + g(shoji(4, 64, 18, 136, 1, 6) + sk(`<path d="M18 64 v136 M168 64 v136" style="stroke:${P.timber}" stroke-width="5"/>`, `<path d="M18 64 v136 M168 64 v136"/>`))
    // the tokonoma behind the desk: a hanging scroll of Mount Yotei in ink, a flower arrangement, the alcove's polished post
    + g(sk(`<rect x="184" y="64" width="152" height="136" style="fill:#EFE6D0"/><rect x="184" y="64" width="152" height="136" fill="none" style="stroke:${P.timber}" stroke-width="3"/><path d="M190 64 v136" style="stroke:#8A6A48" stroke-width="7"/><path d="M190 80 q-2 30 0 60" fill="none" style="stroke:#A8865E" stroke-width="1.4"/>
      <rect x="236" y="70" width="48" height="104" style="fill:#F8F4E8"/><rect x="236" y="70" width="48" height="10" style="fill:#7A8A6A"/><rect x="236" y="164" width="48" height="10" style="fill:#7A8A6A"/><path d="M234 174 h52" style="stroke:#3A2A20" stroke-width="3" stroke-linecap="round"/>
      <path d="M242 140 q8 -20 14 -30 h8 q6 10 14 30" fill="none" style="stroke:#3A3430" stroke-width="1.6"/><path d="M256 110 h8 l-2 6 l-2 -3 l-2 4z" style="fill:#3A3430"/><path d="M244 150 q16 -4 32 0" fill="none" style="stroke:#6A6460" stroke-width="1"/><circle cx="276" cy="92" r="4" style="fill:#C8372D"/>`,
      `<rect x="184" y="64" width="152" height="136"/><rect x="236" y="70" width="48" height="104"/>`)
      + sk(`<path d="M204 196 l4 -14 h14 l4 14z" style="fill:#5A4A3A"/><path d="M214 182 q-6 -24 -14 -30 M216 182 q2 -26 10 -34 M215 182 q-2 -18 4 -26" fill="none" style="stroke:#5E7E44" stroke-width="1.6"/>${[[200, 152, "#E86A8A"], [226, 148, "#FFFDF6"], [219, 156, "#E8B23A"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" style="fill:${c}"/>`).join("")}<path d="M300 196 h28 l-2 -6 h-24z" style="fill:${P.timber2}"/><rect x="306" y="178" width="16" height="12" rx="2" style="fill:#C9A26A"/><path d="M310 178 q4 -6 8 0" fill="none" style="stroke:#8A6A3A" stroke-width="1.4"/>`, `<path d="M204 196 l4 -14 h14 l4 14z"/>`))
    // the bath through the screens on the right, a noren (for the bath) hung across the top
    + g(ryoGarden(352, 64, 150, 136, true)) + g(shoji(500, 64, 20, 136, 1, 6) + sk(`<path d="M352 64 v136 M502 64 v136" style="stroke:${P.timber}" stroke-width="5"/>`, `<path d="M352 64 v136 M502 64 v136"/>`))
    + g(sk(`<path d="M354 66 h146" style="stroke:${P.timber2}" stroke-width="3"/>${[0, 1].map(k => `<rect x="${356 + k*72}" y="66" width="70" height="30" style="fill:${k ? "#C8372D" : P.navy}"/><path d="M${376 + k*72} 86 q8 -14 16 0 q4 -8 10 -2" fill="none" style="stroke:#FFFDF6" stroke-width="2.4"/>`).join("")}`, `<rect x="356" y="66" width="142" height="30"/>`))
    // shoji either side of the tokonoma, and the ceiling lamps
    + g(shoji(168, 64, 16, 136, 1, 6) + shoji(336, 64, 16, 136, 1, 6));
  // the front desk: a long low counter of dark wood, the brass bell, the guest book and brush, folded yukata and bath salts to buy
  const desk = spot("hk_ryokan", 262, 384, "Mrs Sato's front desk", hovE(262, 366, 104, 14),
    sk(`<rect x="170" y="290" width="184" height="54" style="fill:${P.timber2}"/>${[0, 1, 2, 3].map(k => `<rect x="${178 + k*43}" y="298" width="38" height="38" style="fill:${P.timber}"/><path d="M${197 + k*43} 300 v34" style="stroke:${P.timber2}" stroke-width="1"/>`).join("")}<rect x="164" y="282" width="196" height="9" rx="2" style="fill:#8A6244"/>
      <rect x="230" y="270" width="36" height="12" rx="1" style="fill:#F8F4E8"/><path d="M248 270 v12" style="stroke:#C9B48E" stroke-width="1"/>${[0, 1, 2].map(k => `<path d="M${234 + k*4} 274 v5 M${252 + k*4} 274 v5" style="stroke:#3A3430" stroke-width=".7"/>`).join("")}<path d="M268 280 l10 -14" style="stroke:#3A2A20" stroke-width="1.6"/>
      <path d="M200 282 q0 -12 8 -12 q8 0 8 12z" style="fill:#D9AE4E"/><circle cx="208" cy="268" r="2" style="fill:#B8862A"/><ellipse cx="208" cy="282" rx="10" ry="2" style="fill:#8A6244"/>`,
      `<rect x="170" y="290" width="184" height="54"/><rect x="164" y="282" width="196" height="9" rx="2"/>`)
    + yukata(306, 282, P.navy, "#FFFDF6") + yukata(306, 275, "#E8EEF2", "#3E6EA8") + yukata(306, 268, "#C8483A", "#F6E3B4") + yukata(338, 282, "#5E7E9A", "#FFFDF6", 26) + yukata(338, 275, "#E6A8B8", "#FFFDF6", 26)
    + saltJar(180, 282, "#B8DCE6") + saltJar(192, 282, "#E8C8D8")
    + lab(262, 366, "Front desk", "#F6E3B4", 10));
  // the garden view: a strip of polished veranda in front of the open screens
  const garden = spot("hkgarden", 96, 296, "The garden view", hovE(96, 280, 62, 11),
    g(sk(`<path d="M18 200 h150 l8 52 h-166z" style="fill:#B8925E"/>${[214, 228, 242].map(y => `<path d="M${18 - (y - 200)*.15} ${y} h${150 + (y - 200)*.3}" style="stroke:#9A7A4A" stroke-width="1"/>`).join("")}<path d="M60 236 l14 -2" style="stroke:#FFFFFF" stroke-width="2" opacity=".35"/>`, `<path d="M18 200 h150 l8 52 h-166z"/>`))
    + lab(96, 280, "Garden view", "#D8EAD0", 9));
  // the outdoor bath: stepping stones out through the screens, a wooden bucket and stool, a folded towel
  const bath = spot("hkbath", 428, 300, "The outdoor bath: do the onsen properly", hovE(428, 282, 64, 11),
    g(sk(`<path d="M352 200 h150 l6 50 h-162z" style="fill:#9A9488"/>${[[380, 222], [414, 230], [450, 220], [480, 234]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" style="fill:#B8B2A4"/>`).join("")}
      <path d="M368 252 l-3 -16 h22 l-3 16z" style="fill:#D9B98A"/><path d="M366 240 h20 M366 246 h20" style="stroke:#8A6A3A" stroke-width="1.6"/><path d="M466 252 l-2 -10 h22 l-2 10z" style="fill:#D9B98A"/><rect x="462" y="238" width="30" height="5" rx="1" style="fill:#C9A26A"/><rect x="470" y="232" width="14" height="6" rx="1" style="fill:#FFFDF6"/>`,
      `<path d="M352 200 h150 l6 50 h-162z"/>`))
    + lab(428, 282, "Outdoor bath", "#CFE6EE", 9));
  // the left: a low table with tea for two on zabuton cushions; the right: a tansu chest with yukata, an andon lamp
  const tea = g(sk(`<rect x="34" y="484" width="66" height="22" rx="4" style="fill:#7E8E9E"/><rect x="104" y="484" width="66" height="22" rx="4" style="fill:#7E8E9E"/>${[[67, 495], [137, 495]].map(([x, y]) => `<path d="M${x - 24} ${y} h48" style="stroke:#5E6E7E" stroke-width="1"/>`).join("")}
      <rect x="40" y="430" width="124" height="12" rx="3" style="fill:${P.timber2}"/><path d="M48 442 v28 M156 442 v28" style="stroke:#3A2A20" stroke-width="6"/><path d="M44 432 h116" style="stroke:#A87E58" stroke-width="1.4"/>`,
      `<rect x="40" y="430" width="124" height="12" rx="3"/><rect x="34" y="484" width="66" height="22" rx="4"/><rect x="104" y="484" width="66" height="22" rx="4"/>`)
    + sk(`<path d="M86 430 q-2 -14 12 -16 q14 2 12 16z" style="fill:#3A3430"/><path d="M110 422 l8 -4" style="stroke:#3A3430" stroke-width="2.4"/><path d="M92 414 q6 -6 12 0" fill="none" style="stroke:#8A6A3A" stroke-width="2"/>${[62, 138].map(x => `<path d="M${x - 5} 430 l1 -8 h8 l1 8z" style="fill:#7FA35A"/>`).join("")}<ellipse cx="126" cy="429" rx="9" ry="2.4" style="fill:#C8483A"/>`, `<path d="M86 430 q-2 -14 12 -16 q14 2 12 16z"/>`)
    + `<ellipse cx="122" cy="426" rx="3" ry="2" style="fill:#F3E2C4"/><ellipse cx="129" cy="426" rx="3" ry="2" style="fill:#9CC46A"/><path d="M62 420 q-3 -6 0 -10 M138 420 q3 -6 0 -10" fill="none" style="stroke:#FFFFFF" stroke-width="1" opacity=".7"/>`);
  const tansu = g(sk(`<rect x="404" y="420" width="96" height="72" style="fill:#7A4A2E"/>${[0, 1, 2].map(r => `<rect x="408" y="${424 + r*22}" width="88" height="20" style="fill:#8A5A3A"/><rect x="${444}" y="${432 + r*22}" width="16" height="4" rx="1" style="fill:#2A2420"/>`).join("")}${[408, 492].map(x => `<rect x="${x - 4}" y="420" width="8" height="72" style="fill:#3A2A20" opacity=".4"/>`).join("")}`, `<rect x="404" y="420" width="96" height="72"/>`)
    + yukata(430, 420, P.navy, "#FFFDF6", 34) + yukata(430, 413, "#E8EEF2", "#3E6EA8", 34) + yukata(474, 420, "#5E7E9A", "#FFFDF6", 32) + yukata(474, 413, "#E6A8B8", "#FFFDF6", 32) + yukata(474, 406, "#C8483A", "#F6E3B4", 30)
    + sk(`<path d="M488 400 v-20" style="stroke:#2A2420" stroke-width="2"/>`, ``));
  const andon = lampGlow(470, 552, 34) + g(sk(`<rect x="456" y="526" width="28" height="40" style="fill:#FFF3D6"/><path d="M456 539 h28 M456 552 h28 M470 526 v40" style="stroke:#8A6A48" stroke-width="1.4"/><rect x="456" y="526" width="28" height="40" fill="none" style="stroke:#5A3A26" stroke-width="2.6"/><path d="M458 566 v26 M482 566 v26" style="stroke:#5A3A26" stroke-width="3"/>`, `<rect x="456" y="526" width="28" height="40"/>`));
  // the front: a pine bonsai on a stand (left), slippers lined up by the step, a folded futon and blanket (right)
  const front = g(sk(`<rect x="26" y="566" width="80" height="10" rx="2" style="fill:${P.timber2}"/><path d="M32 576 v18 M100 576 v18" style="stroke:#3A2A20" stroke-width="4"/>`, `<rect x="26" y="566" width="80" height="10" rx="2"/>`))
    + pot(66, 566, "pine", "#4A5A6A")
    + g(sk(`${[0, 1, 2, 3].map(k => `<path d="M${132 + k*16} 600 q-1 -10 5 -12 q6 2 5 12z" style="fill:${["#C8483A", P.navy, "#7FA35A", "#C9A26A"][k]}"/><path d="M${133 + k*16} 594 h10" style="stroke:#FFFDF6" stroke-width="1"/>`).join("")}`, ``))
    + g(sk(`<rect x="370" y="578" width="74" height="16" rx="5" style="fill:#F3E7CE"/><rect x="372" y="562" width="70" height="16" rx="5" style="fill:#E8C8C8"/><path d="M380 570 h54" style="stroke:#D0A8A8" stroke-width="1"/><rect x="376" y="550" width="62" height="12" rx="4" style="fill:#8EA8C6"/><path d="M384 556 h46" style="stroke:#FFFDF6" stroke-width="1" stroke-dasharray="3 3"/>`, `<rect x="370" y="550" width="74" height="44"/>`));
  return tatami(200) + skirt(200, P.timber) + wall + garden + bath + desk + tea + tansu + andon + front + step() + exit("#5A3A26");
}

/* ---------- the Niseko ski lodge ---------- */
// skis standing in a rack, with curled tips; a snowboard
const ski = (x, y, h, col, tip = "#2F2B28") => `<path d="M${x - 2.6} ${y} v${-h + 8} q0 -9 2.6 -10 q2.6 1 2.6 10 v${h - 8}z" style="fill:${col}"/><path d="M${x} ${y - h + 10} v${h - 14}" style="stroke:${tip}" stroke-width="1" opacity=".5"/>`;
const board = (x, y, h, col, band = "#FFFDF6") => `<rect x="${x - 7}" y="${y - h}" width="14" height="${h}" rx="7" style="fill:${col}"/><path d="M${x - 7} ${y - h*.5} h14" style="stroke:${band}" stroke-width="3"/><rect x="${x - 5}" y="${y - h*.7}" width="10" height="5" rx="1" style="fill:#2F2B28"/><rect x="${x - 5}" y="${y - h*.32}" width="10" height="5" rx="1" style="fill:#2F2B28"/>`;
// a mug of hot chocolate with a marshmallow and steam
const mug = (x, y, col = "#C8483A") => `<rect x="${x - 6}" y="${y - 12}" width="12" height="12" rx="2" style="fill:${col}"/><path d="M${x + 6} ${y - 9} q5 0 5 4 q0 4 -5 4" fill="none" style="stroke:${col}" stroke-width="2"/><ellipse cx="${x}" cy="${y - 12}" rx="5.4" ry="1.8" style="fill:#7A4A2E"/><rect x="${x - 2}" y="${y - 15}" width="4" height="3" rx="1" style="fill:#FFF3F0"/><path d="M${x - 2} ${y - 17} q-2 -4 1 -8 M${x + 2} ${y - 17} q2 -4 -1 -8" fill="none" style="stroke:#FFFFFF" stroke-width="1" opacity=".75"/>`;
// a ski boot
const boot = (x, y, col) => `<path d="M${x - 6} ${y} v-18 h10 l1 10 l6 4 v4z" style="fill:${col}"/><path d="M${x - 6} ${y - 12} h11 M${x - 6} ${y - 6} h12" style="stroke:#2F2B28" stroke-width="1"/><rect x="${x - 7}" y="${y - 2}" width="19" height="3" rx="1" style="fill:#2F2B28"/>`;
function lodgeRoom(){
  // log walls under a pitched timber ceiling, a big window onto Mount Yotei and the birches
  const view = clip(176, 50, 168, 112, `<rect x="176" y="50" width="168" height="112" style="fill:${skyCol()}"/>${yotei(262, 136, 170, 66)}
    <path d="M176 128 q40 -10 84 -2 q44 8 84 -4 V162 H176z" style="fill:${SEASON === "winter" ? "#F6F9FB" : SEASON === "autumn" ? "#9A8A4E" : SEASON === "spring" ? "#9AAE7A" : "#6E9A4E"}"/>
    ${[[190, 162, 34, "birch"], [206, 162, 26, "birch"], [318, 162, 30, "birch"], [334, 162, 38, "maple"]].map(([x, y, h, k]) => vTree(x, y, h, k)).join("")}
    ${SEASON === "winter" ? `<path d="M232 162 l40 -30" style="stroke:#3A3430" stroke-width="1"/>${[240, 256].map((x, k) => `<rect x="${x - 3}" y="${158 - (x - 232)*.75 + 2}" width="6" height="5" style="fill:#C8372D"/>`).join("")}` : ""}${drift(176, 50, 168, 112)}`);
  const wall = g(logWall(0, 30, 520, 170))
    + g(`<path d="M0 0 H520 V30 H0z" style="fill:${P.timber2}"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${k*86 + 6} 0 v30" style="stroke:${P.timber}" stroke-width="10"/>`).join("")}<rect y="24" width="520" height="12" style="fill:${P.timber}"/>`)
    + g(sk(`<rect x="168" y="42" width="184" height="128" style="fill:${P.timber}"/>`, `<rect x="168" y="42" width="184" height="128"/>`) + view + sk(`<path d="M262 50 v112 M176 106 h168" style="stroke:${P.timber}" stroke-width="5"/>${SEASON === "winter" ? `<path d="M176 160 q20 -6 40 0 q20 -6 40 0 q20 -6 40 0 q20 -6 48 0 v4 h-168z" style="fill:#FFFFFF"/>` : ""}<rect x="164" y="166" width="192" height="8" rx="1" style="fill:${P.timberL}"/>`, `<rect x="164" y="166" width="192" height="8"/>`))
    // ski-hire sign
    + g(sk(`<rect x="186" y="178" width="148" height="20" rx="3" style="fill:${P.red}"/>`, `<rect x="186" y="178" width="148" height="20" rx="3"/>`) + txt(260, 192, "SKI HIRE AND LESSONS", 9.4, "#FFFDF6", 700))
    // old wooden skis crossed on the wall (right), a pair of snowshoes, a framed photo of the mountain
    + g(sk(`<path d="M392 54 l92 100 M484 54 l-92 100" style="stroke:#A8743E" stroke-width="7" stroke-linecap="round"/><path d="M392 54 l92 100 M484 54 l-92 100" style="stroke:#6E4A26" stroke-width="1.2"/><ellipse cx="402" cy="128" rx="10" ry="20" style="fill:none;stroke:#5A3A26" stroke-width="3"/><ellipse cx="474" cy="128" rx="10" ry="20" style="fill:none;stroke:#5A3A26" stroke-width="3"/>${[402, 474].map(x => `<path d="M${x - 9} 124 h18 M${x - 8} 134 h16 M${x} 108 v40" style="stroke:#8A6A48" stroke-width="1"/>`).join("")}`, `<path d="M392 54 l92 100 M484 54 l-92 100"/>`))
    + g(sk(`<rect x="404" y="160" width="64" height="30" style="fill:#F3E7CE"/><rect x="408" y="164" width="56" height="22" style="fill:#7E92A8"/><path d="M408 186 l20 -14 l12 8 l24 -16 v22z" style="fill:#FFFFFF"/>`, `<rect x="404" y="160" width="64" height="30"/>`))
    + [372, 500].map(x => g(lampGlow(x, 64, 30) + sk(`<path d="M${x} 30 v20" style="stroke:#2A2420" stroke-width="1.4"/><path d="M${x - 14} 64 l6 -14 h16 l6 14z" style="fill:#5A4A3A"/><ellipse cx="${x}" cy="64" rx="14" ry="3" style="fill:${P.glowL}"/>`, `<path d="M${x - 14} 64 l6 -14 h16 l6 14z"/>`))).join("");
  // the fireplace: a chimney breast of river stones up the left wall, the fire burning, logs stacked, a kettle, a sheepskin rug
  const stones = (x, y, w, h, n, seed) => Array.from({length: n}, (_, k) => `<ellipse cx="${f1(x + R(k + seed)*w)}" cy="${f1(y + R(k*3 + seed)*h)}" rx="${f1(6 + R(k*5 + seed)*7)}" ry="${f1(4 + R(k*7 + seed)*4)}" style="fill:${["#9A958C", "#8A857C", "#AAA59A", "#7E7A72"][k % 4]};stroke:#6A665E" stroke-width=".8"/>`).join("");
  const fire = spot("hkfire", 102, 392, "Sit by the fire with a hot chocolate", hovE(102, 376, 66, 12),
    lampGlow(80, 296, 64) + sk(`<rect x="20" y="40" width="120" height="300" style="fill:#8E897E"/>`, `<rect x="20" y="40" width="120" height="300"/>`)
    + g(stones(22, 44, 116, 290, 70, 3))
    + sk(`<rect x="14" y="230" width="132" height="12" rx="2" style="fill:${P.timber}"/><path d="M40 330 v-62 q40 -26 80 0 v62z" style="fill:#2A1E18"/><path d="M14 330 h146 v14 h-146z" style="fill:#7E7A72"/>
      <path d="M56 324 l24 -10 l24 10" style="stroke:#6E4A26" stroke-width="6" stroke-linecap="round"/><path d="M58 322 q4 -26 14 -34 q-2 14 8 18 q2 -18 12 -24 q-2 16 6 24 q8 -6 6 -14 q8 14 0 30z" style="fill:#FF8A2A"/><path d="M66 322 q4 -14 10 -18 q0 10 6 12 q2 -10 8 -12 q0 10 4 18z" style="fill:${P.glowL}"/>
`, `<path d="M40 330 v-62 q40 -26 80 0 v62z"/><rect x="14" y="230" width="132" height="12" rx="2"/>`)
    + g(sk(`${[0, 1, 2, 3, 4, 5].map(k => `<circle cx="${150 + (k % 3)*11}" cy="${330 - Math.floor(k/3)*11}" r="5.4" style="fill:#B8885A;stroke:#6E4A26" stroke-width="1.4"/><circle cx="${150 + (k % 3)*11}" cy="${330 - Math.floor(k/3)*11}" r="2.2" fill="none" style="stroke:#8A5A34" stroke-width=".8"/>`).join("")}`, ``))
    + g(sk(`<path d="M26 230 q-2 -12 8 -14 h20 q10 2 8 14z" style="fill:#3A3430"/><path d="M60 222 l8 -6" style="stroke:#3A3430" stroke-width="2.4"/>`, ``) + mug(96, 230, "#C8483A") + mug(118, 230, "#3E6EA8"))
    + g(`<path d="M40 380 q-6 -16 10 -24 q34 -10 66 -2 q18 6 10 22 q-40 12 -86 4z" style="fill:#F3EEE2"/>${Array.from({length: 12}, (_, k) => `<path d="M${44 + k*7} ${368 + (k % 2)*3} q2 -3 4 0" fill="none" style="stroke:#D8D0C0" stroke-width="1"/>`).join("")}`)
    + lab(102, 376, "By the fire", "#FFE2B8", 9));
  // the desk: helmets, goggles, a ski boot, a stack of lesson cards, mugs; skis and boards in a rack behind
  const desk = spot("hk_lodge", 262, 384, "Ski hire and lessons", hovE(262, 366, 104, 14),
    sk(`<rect x="184" y="292" width="156" height="52" style="fill:${P.timber}"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${196 + k*33} 296 v44" style="stroke:${P.timber2}" stroke-width="1.6"/>`).join("")}<rect x="178" y="284" width="168" height="10" rx="2" style="fill:${P.timberL}"/>
      <path d="M190 284 q0 -16 14 -16 q14 0 14 16z" style="fill:#3E6EA8"/><rect x="192" y="274" width="24" height="5" rx="2" style="fill:#F3B23A"/><path d="M226 284 q0 -14 12 -14 q12 0 12 14z" style="fill:#C8483A"/><rect x="228" y="275" width="20" height="4" rx="2" style="fill:#7EC4D6"/>
      <rect x="298" y="276" width="26" height="8" rx="1" style="fill:#FFFDF6"/><rect x="300" y="270" width="22" height="6" rx="1" style="fill:#F3E7CE"/>`,
      `<rect x="184" y="292" width="156" height="52"/><rect x="178" y="284" width="168" height="10" rx="2"/>`)
    + boot(264, 284, "#E8E2D4") + boot(280, 284, "#3E6EA8") + mug(334, 284, "#7FA35A")
    + txt(311, 282, "LESSONS", 4.6, P.ink, 700)
    + lab(262, 366, "Ski hire desk", "#F6E3B4", 10));
  // the trail map on its easel: the mountain with green, red and black runs, the lifts
  const map = spot("hktrailmap", 446, 378, "The trail map", hovE(446, 362, 50, 11),
    sk(`<path d="M406 342 l8 -100 M486 342 l-8 -100 M446 342 v-30" style="stroke:${P.timber2}" stroke-width="5"/><rect x="398" y="232" width="96" height="80" rx="2" style="fill:#FFFDF6"/><rect x="398" y="232" width="96" height="80" rx="2" fill="none" style="stroke:${P.timber}" stroke-width="4"/>
      <path d="M404 304 L432 252 L446 246 L476 270 L488 304z" style="fill:#E8EEF4"/><path d="M432 252 L446 246 L456 254 l-8 6 l-6 -4 l-6 6z" style="fill:#FFFFFF"/>
      <path d="M440 254 q-6 20 -22 46 M448 252 q2 24 -6 48 M456 258 q10 18 20 42" fill="none" style="stroke:#3E9A4A" stroke-width="2"/><path d="M444 250 q12 20 4 50" fill="none" style="stroke:#C8372D" stroke-width="2"/><path d="M452 252 q18 14 26 32" fill="none" style="stroke:#2F2B28" stroke-width="2"/>
      <path d="M426 300 L446 250 M466 300 L470 266" style="stroke:#5A5E66" stroke-width="1" stroke-dasharray="3 2"/>`, `<rect x="398" y="232" width="96" height="80" rx="2"/>`)
    + lab(446, 362, "Trail map", "#F6E3B4", 9));
  // left wall: the boot dryers, a row of boots upside down on warm pegs; right front: the ski rack; a bench with beanies and gloves
  const dryers = g(sk(`<rect x="22" y="548" width="132" height="44" style="fill:#5A5E66"/>${Array.from({length: 6}, (_, k) => `<path d="M${34 + k*22} 548 v-14" style="stroke:#8A9096" stroke-width="3"/>`).join("")}<path d="M28 560 h120 M28 572 h120 M28 584 h120" style="stroke:#3A3E44" stroke-width="2"/>`, `<rect x="22" y="548" width="132" height="44"/>`)
    + Array.from({length: 6}, (_, k) => `<g transform="rotate(180 ${34 + k*22} 530)">${boot(34 + k*22, 524, ["#3E6EA8", "#E8E2D4", "#C8483A", "#2F2B28", "#7FA35A", "#F3B23A"][k])}</g>`).join("")
    + `<path d="M40 524 q-2 -8 1 -12 M84 524 q2 -8 -1 -12 M128 524 q-2 -8 1 -12" fill="none" style="stroke:#FFFFFF" stroke-width="1" opacity=".6"/>`);
  const skiRack = g(sk(`<rect x="404" y="476" width="96" height="10" style="fill:${P.timber}"/><path d="M408 486 v24 M496 486 v24" style="stroke:${P.timber2}" stroke-width="5"/><rect x="404" y="420" width="96" height="6" style="fill:${P.timber}"/>`, `<rect x="404" y="476" width="96" height="10"/>`)
    + [[414, "#C8483A"], [422, "#C8483A"], [436, "#3E6EA8"], [444, "#3E6EA8"], [458, "#F3B23A"], [466, "#F3B23A"]].map(([x, c]) => ski(x, 478, 88, c)).join("") + board(482, 478, 84, "#7FA35A") + board(496, 478, 76, "#2F2B28", "#E86A8A"));
  const bench = g(sk(`<rect x="364" y="560" width="132" height="10" rx="2" style="fill:${P.timberL}"/><path d="M372 570 v22 M488 570 v22" style="stroke:${P.timber2}" stroke-width="5"/>`, `<rect x="364" y="560" width="132" height="10" rx="2"/>`)
    + `<path d="M378 560 q0 -14 12 -14 q12 0 12 14z" style="fill:#C8483A"/><circle cx="390" cy="545" r="4" style="fill:#FFFDF6"/><path d="M412 560 q0 -12 11 -12 q11 0 11 12z" style="fill:#3E6EA8"/><circle cx="423" cy="547" r="3.6" style="fill:#FFFDF6"/><path d="M380 556 h20 M414 556 h18" style="stroke:#FFFDF6" stroke-width="2" opacity=".7"/>`
    + `<path d="M446 560 q-2 -10 6 -10 h6 l2 -4 l3 4 v10z M466 560 q-2 -10 6 -10 h6 l2 -4 l3 4 v10z" style="fill:#2F2B28"/>` + mug(486, 560, "#F3B23A"));
  const chairL = g(sk(`<path d="M24 470 v-46 q0 -12 14 -12 h32 q14 0 14 12 v46z" style="fill:#8A3A2E"/><rect x="20" y="446" width="68" height="26" rx="6" style="fill:#A84A3A"/><path d="M28 470 v12 M80 470 v12" style="stroke:${P.timber2}" stroke-width="4"/>${[0, 1, 2, 3].map(k => `<path d="M${30 + k*14} 424 v20" style="stroke:#C9A26A" stroke-width="1" opacity=".5"/>`).join("")}`, `<path d="M24 470 v-46 q0 -12 14 -12 h32 q14 0 14 12 v46z"/>`)
    + `<path d="M52 446 l18 -8 l8 30 l-18 6z" style="fill:#C8D8B8"/><path d="M56 450 l14 -6 M58 458 l14 -6" style="stroke:#7FA35A" stroke-width="2"/>`);
  return boards(200, ["#C9965E", "#BE8C56", "#D2A068"], "#8E6236", 28) + skirt(200, P.timber2) + wall + fire + desk + map + chairL + skiRack + dryers + bench + step() + exit(P.red);
}

/* ---------- the flower farm café and shop ---------- */
// the six stripe colours: red poppies, purple lupins, blue salvia, orange marigolds, pink cosmos, white baby's breath
const STRIPES = ["#D9433A", "#8A5AB8", "#3E6EC8", "#F39A2A", "#EE8AB0", "#FFFDF6"];
const seedPacket = (x, y, col) => `<rect x="${x - 6}" y="${y - 16}" width="12" height="16" rx="1" style="fill:#FFFDF6;stroke:#C9BFAF" stroke-width=".6"/><circle cx="${x}" cy="${y - 10}" r="3.6" style="fill:${col}"/><circle cx="${x}" cy="${y - 10}" r="1.2" style="fill:${col === "#FFFDF6" ? "#E8D8A0" : "#3A2A20"}" opacity=".7"/><path d="M${x - 3.4} ${y - 4} q1.6 -2 3.4 -1 q1.8 -1 3.4 1" fill="none" style="stroke:#6E9A3E" stroke-width=".9"/><rect x="${x - 6}" y="${y - 3}" width="12" height="3" style="fill:${col}" opacity=".6"/>`;
// a soft-serve cone: Hokkaido milk, a tall white swirl
const softServe = (x, y, s = 1, col = "#FFFDF6") => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-5 -10 l5 14 l5 -14z" style="fill:#D9A35A"/><path d="M-4 -8 l8 0 M-3 -5 l6 0" style="stroke:#B8803A" stroke-width=".6"/><path d="M-7 -10 q-2 -6 4 -7 q-4 -6 3 -8 q-1 -5 4 -6 q1 4 -1 6 q6 1 3 7 q6 2 1 8z" style="fill:${col};stroke:#E8E0D2" stroke-width=".6"/></g>`;
// a bunch of dried flowers hung upside down from the beam
const driedBunch = (x, y, col, n = 6) => `<path d="M${x} ${y - 8} v8" style="stroke:#8A6A3A" stroke-width="1"/><path d="M${x - 2} ${y} h4" style="stroke:#C9A26A" stroke-width="3"/>${Array.from({length: n}, (_, k) => { const dx = (k - (n - 1)/2)*3; return `<path d="M${x} ${y + 2} l${f1(dx)} 22" style="stroke:#8A9A5A" stroke-width=".9"/><circle cx="${f1(x + dx*1.04)}" cy="${y + 25 + (k % 2)*2}" r="2.6" style="fill:${col}"/>`; }).join("")}`;
// the farm through the window: the rolling hill in rainbow stripes (summer), sakura and young green, gold stubble, or snow with cranes
const crane = (x, y, s = 1, flip = 1) => `<g transform="translate(${x} ${y}) scale(${s*flip} ${s})"><path d="M-6 0 q-2 -10 6 -12 q8 0 10 8 q-6 6 -16 4z" style="fill:#FFFFFF"/><path d="M-6 -2 q-6 2 -8 6 q4 0 8 -2z" style="fill:#2F2B28"/><path d="M4 -10 q2 -8 0 -14" fill="none" style="stroke:#2F2B28" stroke-width="2"/><circle cx="0" cy="-25" r="2.4" style="fill:#FFFFFF"/><circle cx="0" cy="-26.6" r="1.2" style="fill:#D9433A"/><path d="M1.6 -25 l4 1" style="stroke:#8A7A5A" stroke-width="1"/><path d="M-1 0 v8 M2 0 v8" style="stroke:#2F2B28" stroke-width=".9"/></g>`;
const farmView = (x, y, w, h) => { const S = SEASON; const hill = (k, col) => `<path d="M${x - 10} ${f1(y + h*(.44 + k*.075))} q${w*.3} ${-14 + k*2} ${w*.6} -2 t${w*.62} ${4 - k} V${y + h} H${x - 10}z" style="fill:${col}"/>`;
  const bands = S === "summer" ? STRIPES.map((c, k) => hill(k, c)).join("") + hill(6, "#7FB257")
    : S === "winter" ? hill(0, "#FFFFFF") + hill(3, "#F2F6FA") + crane(x + w*.47, y + h*.86, 1, 1) + crane(x + w*.6, y + h*.82, 1, -1)
    : S === "autumn" ? [0, 1, 2, 3, 4, 5].map(k => hill(k, k % 2 ? "#C9A35A" : "#B88E4A")).join("")
    : S === "spring" ? [0, 1, 2, 3, 4, 5].map(k => hill(k, k % 2 ? "#8E6E4A" : "#A0805A")).join("") + `<ellipse cx="${x + w*.3}" cy="${y + h*.7}" rx="20" ry="4" style="fill:#F6F9FB"/>`
    : [0, 1, 2, 3, 4, 5].map(k => hill(k, k % 2 ? "#9CC46A" : "#8AB45E")).join("");
  return clip(x, y, w, h, `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${skyCol()}"/><path d="M${x} ${y + h*.44} l${w*.2} -18 l${w*.18} 10 l${w*.22} -22 l${w*.4} 22 V${y + h} H${x}z" style="fill:#A8B8C6"/>${S === "winter" || S === "spring" ? `<path d="M${x + w*.6} ${y + h*.44 - 12} l-6 6 l6 -2 l6 2z" style="fill:#FFFFFF"/>` : ""}${bands}${vTree(x + w*.92, y + h*.56, h*.3, "cherry")}${drift(x, y, w, h)}`); };
function cafeRoom(){
  // whitewashed boards, a big window onto the farm, a beam hung with dried flowers
  const wall = g(`<rect y="30" width="520" height="170" style="fill:#F4EFE4"/>${Array.from({length: 27}, (_, k) => `<path d="M${k*20} 30 v170" style="stroke:#E2DACB" stroke-width="1.4"/>`).join("")}<rect y="0" width="520" height="30" style="fill:#E8E0D0"/><rect y="24" width="520" height="12" style="fill:${P.pine2}"/>`)
    + g(sk(`<rect x="300" y="48" width="204" height="124" style="fill:${P.pine2}"/>`, `<rect x="300" y="48" width="204" height="124"/>`) + farmView(306, 54, 192, 112) + sk(`<path d="M370 54 v112 M434 54 v112" style="stroke:${P.pine2}" stroke-width="5"/><rect x="296" y="168" width="212" height="8" rx="1" style="fill:${P.pine}"/>`, `<rect x="296" y="168" width="212" height="8"/>`))
    + g(`<rect x="296" y="160" width="0" height="0"/>` + [[320, "#EE8AB0"], [352, "#F39A2A"], [384, "#FFFDF6"], [420, "#8A5AB8"], [452, "#D9433A"], [484, "#3E6EC8"]].map(([x, c]) => `<path d="M${x - 6} 168 l2 -10 h8 l2 10z" style="fill:#C9A26A"/><circle cx="${x - 2}" cy="155" r="2.6" style="fill:${c}"/><circle cx="${x + 2}" cy="153" r="2.6" style="fill:${c}"/><circle cx="${x}" cy="150" r="2.6" style="fill:${c}"/>`).join(""))
    // the menu board
    + g(sk(`<rect x="22" y="74" width="122" height="100" rx="3" style="fill:#3A4A3A"/><rect x="22" y="74" width="122" height="100" rx="3" fill="none" style="stroke:${P.pine2}" stroke-width="4"/>`, `<rect x="22" y="74" width="122" height="100" rx="3"/>`)
      + txt(83, 90, "FARM CAFE", 9.6, "#F3D98A", 700) + ["Milk soft-serve", "Melon soft-serve", "Yubari melon slice", "Butter potato", "Sweetcorn soup", "Nama chocolate"].map((t, i) => txt(83, 104 + i*11.4, t, 7.6, i === 2 ? "#F8C68A" : "#E8EEE6")).join(""))
    // the farm's sign and a framed photo of the stripes
    + g(sk(`<rect x="158" y="74" width="128" height="22" rx="3" style="fill:#FFFDF6"/>${STRIPES.map((c, k) => `<rect x="${162 + k*20}" y="90" width="20" height="3" style="fill:${c}"/>`).join("")}`, `<rect x="158" y="74" width="128" height="22" rx="3"/>`) + txt(222, 88, "HANA FARM", 10, "#3E7A3A", 700))
    + g(sk(`<rect x="195" y="108" width="54" height="40" style="fill:#FFFDF6"/>${STRIPES.map((c, k) => `<path d="M199 ${116 + k*5} q23 -4 46 0" style="stroke:${c}" stroke-width="4.4"/>`).join("")}<rect x="195" y="108" width="54" height="40" fill="none" style="stroke:${P.pine2}" stroke-width="3"/>`, `<rect x="195" y="108" width="54" height="40"/>`))
    // dried flower bunches hung from the beam all along
    + g([30, 56, 82, 108, 160, 186, 212, 238, 264, 330, 362, 400, 436, 470, 498].map((x, k) => driedBunch(x, 38, ["#D9433A", "#8A5AB8", "#F39A2A", "#FFFDF6", "#EE8AB0", "#C9A35A", "#3E6EC8"][k % 7], 5 + (k % 3))).join(""))
    + g(lampGlow(152, 180, 24) + lampGlow(270, 180, 24) + sk(`${[152, 270].map(x => `<path d="M${x} 36 v132" style="stroke:#3A3430" stroke-width="1"/><path d="M${x - 10} 180 q0 -12 10 -12 q10 0 10 12z" style="fill:#FFFDF6"/>`).join("")}`, ``));
  // the counter: the soft-serve machine, a glass case of melon slices, cones in a holder, boxes of nama chocolate, the magnets
  const counter = spot("hk_cafe", 262, 384, "The café counter", hovE(262, 366, 104, 14),
    sk(`<rect x="170" y="292" width="184" height="52" style="fill:#FFFDF6"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="M${178 + k*24} 294 v48" style="stroke:#E2DACB" stroke-width="1.4"/>`).join("")}<rect x="164" y="284" width="196" height="10" rx="2" style="fill:${P.pine}"/><rect x="170" y="332" width="184" height="12" style="fill:${P.pine2}"/>
      <rect x="178" y="236" width="44" height="48" rx="4" style="fill:${P.steel}"/><rect x="182" y="242" width="36" height="14" rx="2" style="fill:#FFFDF6"/><path d="M190 256 v10 M210 256 v10" style="stroke:${P.steel2}" stroke-width="5"/><path d="M186 266 h8 M206 266 h8" style="stroke:#5A6066" stroke-width="2"/><path d="M196 236 v-6 h8 v6" style="fill:${P.steel2}"/>
      <rect x="232" y="256" width="60" height="28" rx="2" style="fill:#E8F4F2" opacity=".7"/><rect x="232" y="256" width="60" height="28" rx="2" fill="none" style="stroke:${P.pine2}" stroke-width="2.4"/>
      <rect x="300" y="276" width="22" height="8" rx="1" style="fill:#5A3A26"/><rect x="326" y="276" width="22" height="8" rx="1" style="fill:#5A3A26"/><rect x="303" y="270" width="16" height="6" rx="1" style="fill:#F3E7CE"/>`,
      `<rect x="170" y="292" width="184" height="52"/><rect x="164" y="284" width="196" height="10" rx="2"/><rect x="178" y="236" width="44" height="48" rx="4"/><rect x="232" y="256" width="60" height="28" rx="2"/>`)
    + txt(200, 252, "MILK", 7, "#3E6EA8", 700) + softServe(200, 282, .9)
    + melonSlice(246, 278, .9) + melonSlice(266, 278, .9) + melonSlice(256, 268, .8) + melonSlice(278, 268, .7)
    + `<rect x="336" y="262" width="14" height="14" rx="2" style="fill:#C9A26A"/>` + softServe(339, 266, .55, "#F3D9A0") + softServe(347, 266, .55, "#C8E6A0")
    + lab(262, 366, "Café counter", "#F6E3B4", 10));
  // the seed rack: a tall stand with rows of packets in the farm's colours (poppy, lupin, salvia, marigold, cosmos, baby's breath)
  const seeds = spot("hkseeds", 76, 388, "The seed rack: seeds to grow at home", hovE(76, 372, 56, 11),
    sk(`<rect x="30" y="226" width="92" height="118" rx="2" style="fill:${P.pine2}"/><rect x="34" y="230" width="84" height="110" style="fill:#F3EBDC"/><path d="M30 344 l-6 8 h104 l-6 -8" style="fill:${P.pine3}"/>${[258, 286, 314, 340].map(y => `<path d="M34 ${y} h84" style="stroke:${P.pine2}" stroke-width="2.4"/>`).join("")}<rect x="40" y="208" width="72" height="20" rx="3" style="fill:#3E7A3A"/>`,
      `<rect x="30" y="226" width="92" height="118" rx="2"/><rect x="40" y="208" width="72" height="20" rx="3"/>`)
    + txt(76, 222, "SEEDS", 9, "#FFFDF6", 700)
    + [258, 286, 314, 340].map((y, r) => Array.from({length: 6}, (_, k) => seedPacket(43 + k*13.2, y - 2, STRIPES[(k + r) % 6])).join("")).join("")
    + lab(76, 372, "Seed rack", "#E8F0C8", 9));
  // the pressed-flower wall: a panel of little frames, jars of pressed petals on the shelf below
  const pressed = spot("hkpressed", 446, 388, "The pressed-flower wall", hovE(446, 372, 56, 11),
    sk(`<rect x="398" y="214" width="98" height="104" rx="2" style="fill:#E8DFCE"/><rect x="394" y="318" width="106" height="8" rx="1" style="fill:${P.pine2}"/><path d="M402 326 v20 M492 326 v20" style="stroke:${P.pine3}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map(k => { const x = 404 + (k % 3)*30, y = 222 + Math.floor(k/3)*46; return `<rect x="${x}" y="${y}" width="26" height="38" style="fill:#FFFDF6;stroke:${P.pine3}" stroke-width="2"/>`; }).join("")}`,
      `<rect x="398" y="214" width="98" height="104" rx="2"/><rect x="394" y="318" width="106" height="8" rx="1"/>`)
    + [0, 1, 2, 3, 4, 5].map(k => { const x = 417 + (k % 3)*30, y = 241 + Math.floor(k/3)*46, c = STRIPES[k]; return `<path d="M${x} ${y + 12} q-2 -10 0 -18" fill="none" style="stroke:#7FA35A" stroke-width="1"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - 9}" rx="2" ry="4" transform="rotate(${a} ${x} ${y - 6})" style="fill:${c === "#FFFDF6" ? "#E8E0F0" : c}" opacity=".85"/>`).join("")}<ellipse cx="${x + 4}" cy="${y + 4}" rx="3" ry="1.4" transform="rotate(-30 ${x + 4} ${y + 4})" style="fill:#8AB45E"/>`; }).join("")
    + [410, 428, 446, 464, 482].map((x, k) => `<rect x="${x - 6}" y="302" width="12" height="16" rx="2" style="fill:#E8F1F0" opacity=".9"/>${[0, 1, 2].map(j => `<circle cx="${x - 2 + (j % 2)*4}" cy="${306 + j*4}" r="1.8" style="fill:${STRIPES[(k + j) % 6]}"/>`).join("")}<rect x="${x - 6.6}" y="299" width="13.2" height="3.4" rx="1" style="fill:${P.pine3}"/>`).join("")
    + lab(446, 372, "Pressed flowers", "#F0D8E8", 9));
  // café tables at the front: soft-serve and melon on the left, coffee and a jar of cosmos on the right; buckets of fresh flowers
  const table = (x, extra) => g(sk(`<ellipse cx="${x}" cy="496" rx="44" ry="11" style="fill:#FFFDF6"/><path d="M${x} 506 v40 M${x - 18} 548 h36" style="stroke:${P.pine3}" stroke-width="4"/>`, `<ellipse cx="${x}" cy="496" rx="44" ry="11"/>`) + chair(x - 58, 548, P.pine2, "#EE8AB0") + chair(x + 58, 548, P.pine2, "#8EA8C6") + extra);
  const front = table(100, softServe(86, 494, 1.1) + melonSlice(112, 496, 1) + `<path d="M120 494 l6 -3" style="stroke:#C9A26A" stroke-width="1"/>`)
    + table(420, `<rect x="400" y="484" width="10" height="10" rx="2" style="fill:#FFFDF6;stroke:#C9BFAF" stroke-width=".6"/><ellipse cx="405" cy="484" rx="4" ry="1.4" style="fill:#7A4A2E"/><rect x="428" y="478" width="10" height="16" rx="2" style="fill:#E8F1F0" opacity=".9"/>${[[430, 470, "#EE8AB0"], [436, 468, "#FFFDF6"], [433, 464, "#EE8AB0"], [440, 472, "#D9433A"]].map(([a, b, c]) => `<path d="M433 478 L${a} ${b + 3}" style="stroke:#7FA35A" stroke-width=".8"/><circle cx="${a}" cy="${b}" r="2.6" style="fill:${c}"/>`).join("")}`)
    + g(sk(`<path d="M24 596 l4 -26 h28 l4 26z" style="fill:#8EA8C6"/><path d="M62 596 l4 -24 h26 l4 24z" style="fill:#C9A26A"/><path d="M430 596 l4 -26 h28 l4 26z" style="fill:#C9A26A"/><path d="M468 596 l4 -24 h26 l4 24z" style="fill:#8EA8C6"/>`, `<path d="M24 596 l4 -26 h28 l4 26z"/><path d="M468 596 l4 -24 h26 l4 24z"/>`)
      + [[42, 570, 0], [79, 572, 3], [448, 570, 4], [485, 572, 1]].map(([x, y, c]) => Array.from({length: 7}, (_, k) => { const dx = (k - 3)*4, dy = -10 - (k % 3)*5; return `<path d="M${x} ${y} L${x + dx} ${y + dy}" style="stroke:#6E9A3E" stroke-width="1"/><circle cx="${x + dx}" cy="${y + dy}" r="3" style="fill:${STRIPES[(c + (k % 2)*2) % 6]}"/>`; }).join("")).join(""))
    + g(sk(`<rect x="150" y="572" width="44" height="22" rx="2" style="fill:#FFFDF6"/>`, `<rect x="150" y="572" width="44" height="22" rx="2"/>`) + melon(160, 568, 7) + melon(176, 568, 7) + melon(168, 558, 6) + txt(172, 588, "MELON", 6, "#3E7A3A", 700))
    + g(sk(`<rect x="326" y="574" width="40" height="20" rx="2" style="fill:#C9A26A"/>${[0, 1, 2].map(k => `<path d="M${332 + k*12} 574 q-2 -20 4 -26" fill="none" style="stroke:#C9A35A" stroke-width="3"/><circle cx="${336 + k*12}" cy="${548 - (k % 2)*3}" r="4" style="fill:${["#D9433A", "#8A5AB8", "#F39A2A"][k]}" opacity=".85"/>`).join("")}`, `<rect x="326" y="574" width="40" height="20" rx="2"/>`));
  return boards(200, ["#E6CFA2", "#DEC598", "#EBD6AC"], "#C2A474") + skirt(200, P.pine2) + wall + counter + seeds + pressed + front + step(P.pine2) + exit("#3E7A3A");
}

export function hokkaidoRoomArt(scene, day){
  CID = 0; SEASON = roomSeason(day || dayKey());
  return scene === "hk_hall" ? hallRoom() : scene === "hk_glass" ? glassRoom() : scene === "hk_ryokan" ? ryokanRoom() : scene === "hk_lodge" ? lodgeRoom() : cafeRoom();
}
