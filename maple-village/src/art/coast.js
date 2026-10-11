// Bellbird Valley's Coast Road (round 148): twelve screens inspired by the Great Ocean Road. The sea on every stop:
// deep blue-green water with white surf lines, honey-gold limestone cliffs, pale sand, wind-bent heath, Norfolk
// pines along the esplanade, weatherboard shops with striped awnings. Calm on purpose: detail round the edges, a
// clear middle. The places are in data/coast.js. (Helpers shared with the Vines: art/bellbird-vines.js.)
import { dayKey, sgHM } from "../util.js";
import { sk } from "./scenes.js";
import { lampDefs } from "./village-extras.js";
import { BBC as V, bbLab as lab, bbPlace as place, bbGate as gate, bbGum as gum, bbShed as shed, bbTrack as track, bbFence as fence, bbVan as myVan, bbKombi as kombi, bbCaravan as caravan, bbChair as chair, bbTable as table, bbKoala as koala, bbFlowers as flowers } from "./bellbird-vines.js";

const C = {sea: "#4F93B4", sea2: "#6FAFC8", sea3: "#3E7E9E", foam: "#FFFDF6", sand: "#EAD7A8", sand2: "#DEC690", cliff: "#D9A85E", cliff2: "#C08A48", heath: "#9DAA78", heath2: "#B5B98A",
  grass: "#C9D19A", grass2: "#BCC48A", pine: "#4E6E52", fern: "#5E8A4E", fern2: "#7AA25E", ash: "#E2DCCB", ink: "#2F2B28", red: "#C8432F"};
const g = s => `<g pointer-events="none">${s}</g>`;
const evening = () => sgHM() >= 18*60;
// the sea: a band (any shape) with white surf lines and a glint or two
const sea = (d, foam = []) => g(sk(`<path d="${d}" style="fill:${C.sea}"/>`, ``) + foam.map(([x, y, w]) => `<path d="M${x} ${y} q${w/4} -5 ${w/2} 0 t${w/2} 0" fill="none" stroke="${C.foam}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`).join(""));
const surfLine = (y, x1 = 0, x2 = 520) => g(`<path d="M${x1} ${y} ${Array.from({length: Math.ceil((x2 - x1)/40)}, (_, i) => `q10 -6 20 0 t20 0`).join(" ")}" fill="none" stroke="${C.foam}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`);
const ground = col => `<rect width="520" height="640" style="fill:${col || C.grass}"/><g filter="url(#wash)" opacity=".5"><ellipse cx="140" cy="460" rx="160" ry="90" style="fill:${C.grass2}"/><ellipse cx="400" cy="560" rx="140" ry="70" style="fill:${C.heath2}"/></g>`;
const norfolk = (x, y, s = 1) => g(sk(`<path d="M${x} ${y} v${-90*s}" style="stroke:#6B5444" stroke-width="${3*s}"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${x - (28 - i*4)*s} ${y - (20 + i*13)*s} q${(28 - i*4)*s} ${-8*s} ${(56 - i*8)*s} 0" style="fill:none;stroke:${C.pine}" stroke-width="${6*s}" stroke-linecap="round"/>`).join("")}`, ``));
const heathBush = (x, y, s = 1, f = "#B9A2DC") => g(`<ellipse cx="${x}" cy="${y}" rx="${16*s}" ry="${9*s}" style="fill:${C.heath}"/><ellipse cx="${x + 8*s}" cy="${y - 4*s}" rx="${10*s}" ry="${7*s}" style="fill:${C.heath2}"/>${[[-6, -4], [4, -8], [10, -2]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${1.8*s}" fill="${f}"/>`).join("")}`);
const gull = (x, y) => g(`<path d="M${x - 6} ${y} q3 -4 6 0 q3 -4 6 0" fill="none" stroke="${C.ink}" stroke-width="1.2"/>`);
const gullStand = (x, y) => g(sk(`<ellipse cx="${x}" cy="${y - 6}" rx="6" ry="4" style="fill:#FFFDF6"/><circle cx="${x + 5}" cy="${y - 10}" r="2.6" style="fill:#FFFDF6"/><path d="M${x + 7} ${y - 10} l3 1" style="stroke:#E8A83A" stroke-width="1.4"/><path d="M${x - 5} ${y - 7} q4 -2 8 0" style="fill:#B9BEC4"/>`, `<ellipse cx="${x}" cy="${y - 6}" rx="6" ry="4"/>`) + `<path d="M${x - 1} ${y - 2} v3 M${x + 2} ${y - 2} v3" stroke="#E8A83A" stroke-width="1"/>`);
const surfboard = (x, y, col, rot = 0) => g(sk(`<ellipse cx="${x}" cy="${y}" rx="5" ry="22" transform="rotate(${rot} ${x} ${y})" style="fill:${col}"/><path d="M${x} ${y - 18} v36" transform="rotate(${rot} ${x} ${y})" style="stroke:#FFFDF6" stroke-width="1"/>`, `<ellipse cx="${x}" cy="${y}" rx="5" ry="22" transform="rotate(${rot} ${x} ${y})"/>`));
const awning = (x, y, w, a, b = "#FFFDF6") => g(sk(`<path d="M${x} ${y} h${w} l-6 14 h${-w + 12}z" style="fill:${a}"/>${Array.from({length: Math.floor(w/14)}, (_, i) => i % 2 ? `<path d="M${x + i*14} ${y} h14 l-1 14 h-14z" style="fill:${b}"/>` : "").join("")}`, `<path d="M${x} ${y} h${w} l-6 14 h${-w + 12}z"/>`));
const boat = (x, y, hull, cab = "#FFFDF6", s = 1) => g(sk(`<path d="M${x - 30*s} ${y - 8*s} h${60*s} l${-8*s} ${14*s} h${-44*s}z" style="fill:${hull}"/><rect x="${x - 6*s}" y="${y - 24*s}" width="${18*s}" height="${16*s}" style="fill:${cab}"/><rect x="${x - 2*s}" y="${y - 20*s}" width="${6*s}" height="${5*s}" style="fill:#9CC4D0"/>`, `<path d="M${x - 30*s} ${y - 8*s} h${60*s} l${-8*s} ${14*s} h${-44*s}z"/>`) + `<path d="M${x - 34*s} ${y + 8*s} q${10*s} -3 ${20*s} 0 M${x + 14*s} ${y + 9*s} q${10*s} -3 ${20*s} 0" fill="none" stroke="${C.foam}" stroke-width="1.2" opacity=".7"/>`);
const crayPots = (x, y) => g(sk([0, 1, 2].map(i => `<path d="M${x + i*16 - 7} ${y - (i % 2)*10} q7 -14 14 0z" style="fill:#C9A86A"/>`).join(""), ``) + [0, 1, 2].map(i => `<path d="M${x + i*16 - 5} ${y - 4 - (i % 2)*10} h10 M${x + i*16} ${y - 10 - (i % 2)*10} v8" stroke="#8A6A42" stroke-width=".8"/>`).join(""));
const treeFern = (x, y, s = 1) => g(sk(`<path d="M${x} ${y} q${-2*s} ${-30*s} ${1*s} ${-52*s}" style="fill:none;stroke:#5A4636" stroke-width="${5*s}"/>`, ``) + [-70, -40, -12, 14, 42, 70, 100, 130].map((a, i) => { const r = a*Math.PI/180, ex = x + Math.sin(r)*34*s, ey = y - 52*s - Math.cos(r)*18*s + (Math.abs(a) > 60 ? 10*s : 0);
  return `<path d="M${x} ${y - 52*s} Q${(x + ex)/2} ${y - 66*s} ${ex} ${ey}" fill="none" stroke="${i % 2 ? C.fern : C.fern2}" stroke-width="${5*s}" stroke-linecap="round"/>`; }).join(""));
const ashTree = (x, y, s = 1) => g(sk(`<path d="M${x - 4*s} ${y} q${-1*s} ${-80*s} ${2*s} ${-150*s} l${4*s} 0 q${2*s} ${70*s} ${4*s} ${150*s}z" style="fill:${C.ash}"/>`, `<path d="M${x - 4*s} ${y} q${-1*s} ${-80*s} ${2*s} ${-150*s}"/>`) + [[-14, -150, 22], [10, -160, 24], [0, -176, 20]].map(([dx, dy, r]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*.6*s}" style="fill:#6E8E62" opacity=".95"/>`).join(""));
const stack = (x, y, w, h) => g(sk(`<path d="M${x - w/2} ${y} q${-4} ${-h*.5} ${w*.08} ${-h*.85} q${w*.2} ${-h*.18} ${w*.42} ${-h*.15} q${w*.34} ${h*.06} ${w*.42} ${h*.3} q${w*.06} ${h*.36} ${w*.16} ${h*.7}z" style="fill:${C.cliff}"/><path d="M${x - w*.3} ${y - h*.3} h${w*.5} M${x - w*.34} ${y - h*.55} h${w*.56}" style="stroke:${C.cliff2}" stroke-width="2" opacity=".6"/>`, `<path d="M${x - w/2} ${y} q${-4} ${-h*.5} ${w*.08} ${-h*.85}"/>`) + `<path d="M${x - w/2 - 8} ${y + 2} q${w/2} 6 ${w + 16} 0" fill="none" stroke="${C.foam}" stroke-width="3" opacity=".9"/>`);
const parrot = (x, y, flip = 1) => g(`<ellipse cx="${x}" cy="${y}" rx="4" ry="6" fill="#3E8A4E" stroke="${C.ink}" stroke-width=".6"/><circle cx="${x + flip*2}" cy="${y - 6}" r="3" fill="#C8432F" stroke="${C.ink}" stroke-width=".6"/><path d="M${x} ${y + 5} l${-flip*2} 7" stroke="#2E6A3E" stroke-width="2"/>`);
const pelican = (x, y) => g(sk(`<ellipse cx="${x}" cy="${y - 8}" rx="9" ry="6" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 12} q4 -10 2 -12" style="fill:none;stroke:#FFFDF6" stroke-width="3"/><path d="M${x + 8} ${y - 24} l10 4 l-10 1z" style="fill:#F3C969"/>`, `<ellipse cx="${x}" cy="${y - 8}" rx="9" ry="6"/>`) + `<path d="M${x - 2} ${y - 2} v4 M${x + 2} ${y - 2} v4" stroke="#E8A83A" stroke-width="1"/>`);
const lighthouse = (x, y) => g(sk(`<path d="M${x - 20} ${y} L${x - 13} ${y - 170} H${x + 13} L${x + 20} ${y}z" style="fill:#FFFDF6"/><rect x="${x - 17}" y="${y - 196}" width="34" height="26" style="fill:#F3E7B0"/><path d="M${x - 22} ${y - 196} h44 l-6 -16 h-32z" style="fill:${C.red}"/><circle cx="${x}" cy="${y - 216}" r="4" style="fill:${C.red}"/><rect x="${x - 24}" y="${y - 172}" width="48" height="5" style="fill:#5A4636"/><rect x="${x - 7}" y="${y - 26}" width="14" height="26" rx="6" style="fill:#3E7A5A"/><rect x="${x - 4}" y="${y - 120}" width="8" height="12" rx="3" style="fill:#9CC4D0"/><rect x="${x - 4}" y="${y - 70}" width="8" height="12" rx="3" style="fill:#9CC4D0"/>`,
  `<path d="M${x - 20} ${y} L${x - 13} ${y - 170} H${x + 13} L${x + 20} ${y}z"/><rect x="${x - 17}" y="${y - 196}" width="34" height="26"/>`) + (evening() ? `<path d="M${x} ${y - 184} L${x - 120} ${y - 206} L${x - 120} ${y - 166}z" fill="#FFF3B0" opacity=".35"/>` : ""));
const cottage = (x, y, w, h, wall, roof = "#B9BEC4", o = {}) => shed(x, y, w, h, {wall, roof, ...o});

/* ---------- Breakwater: the surf beach (cw_beach) and the main street (cw_street) ---------- */
function beachScreen(){
  const water = sea("M0 0 H520 V150 Q400 172 260 160 Q120 150 0 168z", [[60, 60, 60], [300, 40, 80], [180, 100, 70]]) + surfLine(132, 0, 520) + surfLine(150, 40, 480);
  const sand = g(`<path d="M0 168 Q120 150 260 160 Q400 172 520 150 V350 Q380 336 260 346 Q120 356 0 340z" style="fill:${C.sand}"/><path d="M0 172 Q120 156 260 166 Q400 178 520 156" fill="none" stroke="${C.sand2}" stroke-width="5" opacity=".7"/>`);
  const dunes = g(`<path d="M0 340 Q120 330 260 344 Q380 332 520 346 V380 H0z" style="fill:${C.heath2}"/>${Array.from({length: 16}, (_, i) => `<path d="M${16 + i*32} 352 q-3 -10 -8 -14 M${20 + i*32} 352 q0 -12 3 -16" fill="none" stroke="#7E8A5A" stroke-width="1.4"/>`).join("")}`);
  const surf = place("bvsurf", 280, 250, 50, 12, "The surf", surfboard(250, 236, "#E8566C", -70) + surfboard(300, 246, "#F3C969", -75) + `<g pointer-events="none"><circle cx="210" cy="120" r="3" fill="${C.ink}"/><path d="M200 126 h20" stroke="${C.ink}" stroke-width="2"/><circle cx="360" cy="108" r="3" fill="${C.ink}"/><path d="M352 114 h18" stroke="#F3C969" stroke-width="3"/></g>`, "The surf", 280, 276, "#C3DDF3");
  const flags = place("bvflags", 150, 260, 30, 10, "The flags", g(`<path d="M120 256 v-40 M180 256 v-40" stroke="#6B5444" stroke-width="2"/><path d="M120 216 h16 v10 h-16z M180 216 h16 v10 h-16z" fill="#E8566C"/><path d="M120 221 h16 v5 h-16z M180 221 h16 v5 h-16z" fill="#F3D34A"/>`) + sk(`<rect x="60" y="210" width="10" height="40" style="fill:#FFFDF6"/><rect x="54" y="200" width="22" height="10" style="fill:#E8566C"/>`, `<rect x="54" y="200" width="22" height="50"/>`), "Flags", 150, 282, "#F6D3DC");
  const shop = place("bvsurfshop", 400, 446, 44, 10, "Swell Surf Shop", cottage(330, 362, 140, 84, "#9FD3C2", "#5A6A7A", {sign: "SWELL SURF", wins: [24, 116], door: "#E8566C"}) + surfboard(320, 420, "#F3C969", 8) + surfboard(478, 420, "#4F9CC4", -8) + surfboard(488, 424, "#E8566C", -12), "Surf shop", 400, 468, "#C3E8DA");
  const path = track("M130 640 Q140 560 200 500 Q300 440 504 500", 30) + track("M200 500 Q190 420 200 360", 18);
  return lampDefs + ground() + water + sand + dunes + path + norfolk(40, 470, 1) + norfolk(250, 600, .9) + norfolk(470, 600, 1.1) + flags + surf + shop + gull(120, 60) + gull(400, 80)
    + flowers([[300, 400, "#F3C969"], [60, 420, "#FFFDF6"]]) + myVan("bvvan_breakwater", 130, 560) + gate("bvToStreet", 504, 500, "Main street", 466, 536, "East to the main street");
}
function streetScreen(){
  const road = track("M0 400 H520", 40) + track("M140 400 V250 M390 400 V250", 18);
  const water = g(`<path d="M0 500 H520 V640 H0z" style="fill:${C.sand}"/>`) + sea("M0 548 Q260 530 520 548 V640 H0z", [[80, 590, 60], [320, 600, 80]]) + surfLine(556, 0, 520) + g(`<path d="M0 498 H520" stroke="#B9A88A" stroke-width="6"/>${Array.from({length: 14}, (_, i) => `<rect x="${10 + i*38}" y="486" width="4" height="14" fill="#B9A88A"/>`).join("")}`);
  const chippy = place("bvchippy", 140, 230, 46, 10, "The Golden Gull", cottage(70, 130, 140, 96, "#F3E7B0", "#3E6B8C", {sign: "THE GOLDEN GULL", wins: [26, 114], door: "#3E6B8C"}) + awning(66, 186, 148, "#3E6B8C"), "Fish and chips", 140, 252, "#C3DDF3");
  const bakery = place("bvbakery", 390, 230, 46, 10, "Crumb & Co.", cottage(320, 130, 140, 96, "#F4C7CF", "#8A5A3A", {sign: "CRUMB & CO.", wins: [26, 114], door: "#8A5A3A"}) + awning(316, 186, 148, "#C8432F"), "Bakery", 390, 252, "#F6D3DC");
  const bench = place("bvbench", 260, 430, 34, 9, "The bench under the pines", sk(`<rect x="232" y="412" width="56" height="6" rx="2" style="fill:#B98A5E"/><rect x="232" y="402" width="56" height="5" rx="2" style="fill:#B98A5E"/><path d="M238 418 v10 M282 418 v10" style="stroke:#6B5444" stroke-width="2"/>`, `<rect x="232" y="402" width="56" height="16"/>`) + gullStand(300, 432) + gullStand(222, 440), "Bench", 260, 452, "#F6E3B4");
  return lampDefs + ground() + water + road + norfolk(30, 330, 1.1) + norfolk(490, 330, 1.1) + norfolk(250, 340, .9) + chippy + bakery + bench + gull(200, 520) + gull(430, 510)
    + gate("bvToBeach", 16, 400, "The beach", 60, 368, "West, back to the beach");
}

/* ---------- Lighthouse Point: the lighthouse (cl_light) and the cliff walk (cl_cliff) ---------- */
function lightScreen(){
  const water = sea("M0 0 H520 V96 Q380 110 260 100 Q120 92 0 110z", [[60, 40, 70], [260, 30, 90], [420, 60, 60]]);
  const head = g(`<path d="M0 110 Q120 92 260 100 Q380 110 520 96 V150 H0z" style="fill:${C.cliff}"/><path d="M0 128 Q200 118 520 124" fill="none" stroke="${C.cliff2}" stroke-width="3" opacity=".6"/>`) + ground();
  const lh = place("bvlighthouse", 380, 258, 30, 10, "The lighthouse", lighthouse(380, 252), "Lighthouse", 380, 280, "#F6D3DC");
  const tea = place("bvtearoom", 130, 248, 44, 10, "The keeper's cottage", cottage(60, 156, 140, 90, "#F3EEE2", C.red, {sign: "DEVONSHIRE TEAS", wins: [26, 114], door: "#3E7A5A"}) + fence(56, 210, 266), "Keeper's cottage", 130, 270, "#FBE0B8");
  const path = track("M150 640 Q150 560 220 500 Q300 440 380 270 M220 500 Q160 400 130 260 M220 500 Q280 560 300 640", 22);
  return lampDefs + head.replace('<rect width="520" height="640"', '<rect y="140" width="520" height="500"') + water + path + heathBush(40, 330) + heathBush(470, 360, 1.2, "#F3D34A") + heathBush(260, 360, .9) + heathBush(470, 520, 1, "#F3D34A") + heathBush(40, 520, 1.1)
    + tea + lh + gull(200, 40) + gull(300, 60) + flowers([[300, 420, "#B9A2DC"], [80, 420, "#F3D34A"], [420, 440, "#FFFDF6"]]) + myVan("bvvan_lighthouse", 150, 560) + gate("bvToCliff", 300, 612, "Cliff walk", 360, 590, "Down to the cliff walk");
}
function cliffScreen(){
  const water = sea("M380 0 Q360 160 372 320 Q360 480 384 640 H520 V0z", [[440, 80, 50], [420, 240, 60], [450, 400, 50], [430, 560, 60]]);
  const edge = g(`<path d="M372 0 Q352 160 364 320 Q352 480 376 640" fill="none" stroke="${C.cliff}" stroke-width="16"/><path d="M380 0 Q360 160 372 320 Q360 480 384 640" fill="none" stroke="${C.cliff2}" stroke-width="5"/>`);
  const whales = place("bvwhales", 320, 330, 34, 10, "The whale lookout", sk(`<path d="M330 280 v44 M350 280 v44" style="stroke:#8A6A52" stroke-width="3"/><path d="M326 286 h28 M326 300 h28" style="stroke:#8A6A52" stroke-width="3"/>`, ``) + sk(`<rect x="280" y="292" width="34" height="22" rx="2" style="fill:#FFFDF6"/><path d="M286 306 q6 -8 14 -2 q4 -2 6 2" style="fill:none;stroke:#3E6B8C" stroke-width="1.6"/>`, `<rect x="280" y="292" width="34" height="22" rx="2"/>`) + g(`<path d="M450 210 q8 -10 20 -6 q-10 6 -20 6z" fill="#3E5A6E"/><path d="M456 200 l2 -8 M460 200 l3 -7" stroke="#FFFDF6" stroke-width="1.2"/>`), "Whale lookout", 320, 352, "#C3DDF3");
  const shop = place("bvgiftshop", 120, 278, 44, 10, "The gift shop", cottage(60, 186, 120, 88, "#F3EEE2", "#3E6B8C", {sign: "GIFT SHOP", wins: [24, 96], door: "#C8432F"}), "Gift shop", 120, 300, "#C3DDF3");
  const path = track("M240 0 Q250 120 300 300 Q260 440 220 640", 20) + track("M270 220 Q200 260 120 290", 14);
  const heath = place("bvheath", 200, 480, 40, 10, "The heath", heathBush(170, 470, 1.3) + heathBush(230, 486, 1.1, "#F3D34A") + heathBush(150, 520, 1), "The heath", 200, 504, "#DCEBC8");
  return lampDefs + ground() + water + edge + path + heathBush(60, 420) + heathBush(320, 560, 1.2, "#F3D34A") + heathBush(60, 600, 1.1) + heathBush(300, 200, .9) + shop + whales + heath + gull(440, 140) + gull(470, 480)
    + gate("bvToLight", 240, 26, "Lighthouse", 300, 48, "Up to the lighthouse");
}

/* ---------- Fern Gully: the tree ferns (cg_ferns) and the hidden cove (cg_cove) ---------- */
function fernsScreen(){
  const floor = `<rect width="520" height="640" style="fill:#7FA068"/><g filter="url(#wash)" opacity=".6"><ellipse cx="160" cy="420" rx="170" ry="100" style="fill:#6E9058"/><ellipse cx="400" cy="560" rx="150" ry="70" style="fill:#8AAE70"/></g>`;
  const creek = g(sk(`<path d="M300 140 Q240 260 280 380 Q320 480 270 640 H330 Q370 480 330 380 Q290 260 340 140z" style="fill:#6E9AA8"/>`, ``) + [[290, 300], [300, 420], [300, 560]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#5A7A5A"/>`).join(""));
  const canopy = g(`<path d="M0 0 H520 V120 Q400 150 260 128 Q120 150 0 120z" style="fill:#4E7A48"/>`) + ashTree(40, 240, 1) + ashTree(480, 250, 1.1) + ashTree(250, 150, .7);
  const walk = place("bvtreetop", 300, 330, 40, 10, "The treetop walk", sk(`<path d="M120 70 L420 46" style="stroke:#7A7F86" stroke-width="8"/><path d="M120 62 L420 38" style="stroke:#9AA0A8" stroke-width="2"/>${[160, 240, 320, 400].map(x => `<path d="M${x} ${74 - (x - 120)*.08} V320" style="stroke:#7A7F86" stroke-width="3"/>`).join("")}`, ``), "Treetop walk", 300, 352, "#DCEBC8");
  const hut = place("bvrangerhut", 120, 252, 40, 10, "The ranger's hut", shed(64, 166, 112, 82, {wall: "#8A6A52", roof: "#4E6A4A", sign: "RANGER", door: "#5E8A4E", wins: [24]}), "Ranger's hut", 120, 274, "#DCEBC8");
  const cafe = place("bvmushcafe", 410, 252, 44, 10, "The Toadstool café", shed(350, 166, 120, 82, {wall: "#F3E7C8", roof: C.red, sign: "TOADSTOOL CAFÉ", door: C.red, wins: [24, 96]}) + g(`<ellipse cx="482" cy="236" rx="10" ry="6" fill="${C.red}"/><circle cx="478" cy="234" r="1.6" fill="#FFFDF6"/><rect x="479" y="236" width="6" height="10" fill="#FFFDF6"/>`), "Toadstool café", 410, 274, "#F6D3DC");
  const brook = place("bvcreek", 270, 470, 30, 9, "The creek", "", "The creek", 220, 492, "#C3DDF3");
  const ferns = treeFern(60, 400, 1.1) + treeFern(200, 330, .9) + treeFern(460, 380, 1.2) + treeFern(420, 520, 1) + treeFern(60, 600, 1.1) + treeFern(240, 560, .8);
  return lampDefs + floor + creek + canopy + walk + ferns + hut + cafe + brook + myVan("bvvan_gully", 150, 560) + gate("bvToCove", 300, 612, "Hidden cove", 360, 590, "Down to the hidden cove");
}
function coveScreen(){
  const cliffTop = g(sk(`<path d="M0 0 H520 V110 Q460 126 420 118 Q380 140 330 124 Q260 140 200 120 Q140 132 100 126 Q60 250 0 250z" style="fill:${C.cliff}"/><path d="M0 0 H520 V60 H0z" style="fill:#4E7A48"/>`, ``) + treeFern(40, 60, .6) + treeFern(480, 56, .6) + treeFern(300, 50, .5));
  const falls = place("bvfalls", 150, 300, 40, 12, "The waterfall", g(`<path d="M120 60 Q126 160 132 250" stroke="#CFE8F0" stroke-width="16" fill="none" opacity=".9"/><path d="M126 70 v170 M134 80 v160" stroke="#FFFFFF" stroke-width="2" opacity=".7"/><ellipse cx="140" cy="272" rx="40" ry="14" fill="#8CC3D6"/><ellipse cx="140" cy="268" rx="28" ry="8" fill="#FFFFFF" opacity=".4"/>`), "Waterfall", 150, 322, "#C3DDF3");
  const sand = g(`<path d="M0 250 Q60 250 100 126 Q200 150 330 136 Q420 150 520 120 V440 Q260 424 0 444z" style="fill:${C.sand}"/><path d="M150 280 Q200 340 230 440" stroke="#8CC3D6" stroke-width="10" fill="none" opacity=".7"/>`);
  const water = sea("M0 444 Q260 424 520 440 V640 H0z", [[60, 520, 60], [280, 540, 90], [420, 600, 70]]) + surfLine(452, 0, 520) + surfLine(470, 30, 500);
  const grotto = place("bvgrotto", 400, 240, 40, 10, "The glow-worm grotto", sk(`<path d="M330 236 Q340 150 400 140 Q460 150 470 236z" style="fill:#5A4636"/><path d="M350 236 Q356 176 400 168 Q444 176 450 236z" style="fill:#2A2420"/>`, `<path d="M330 236 Q340 150 400 140 Q460 150 470 236z"/>`) + g([[380, 190], [404, 182], [420, 196], [392, 206]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#9FF0D8" class="twinkle"/>`).join("")), "Glow-worm grotto", 400, 262, "#C3E8DA");
  return lampDefs + `<rect width="520" height="640" style="fill:${C.sand}"/>` + sand + cliffTop + water + falls + grotto + g(`<ellipse cx="300" cy="320" rx="16" ry="8" fill="#9A8E80"/><ellipse cx="460" cy="380" rx="20" ry="10" fill="#9A8E80"/><ellipse cx="80" cy="400" rx="14" ry="7" fill="#9A8E80"/>`) + gull(300, 500)
    + gate("bvToFerns", 270, 26, "The ferns", 330, 48, "Up to the tree ferns");
}

/* ---------- Fisher's Harbour: the wharf (ch_wharf) and the cottages (ch_cottages) ---------- */
function wharfScreen(){
  const water = sea("M0 370 H520 V640 H0z", [[60, 440, 60], [400, 460, 60], [120, 560, 80], [440, 590, 60]]);
  const wharf = g(sk(`<rect x="280" y="360" width="60" height="250" style="fill:#B98A5E"/>${Array.from({length: 12}, (_, i) => `<path d="M280 ${372 + i*20} h60" style="stroke:#8A6A52" stroke-width="1.2"/>`).join("")}${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${i % 2 ? 336 : 276}" y="${380 + Math.floor(i/2)*80}" width="8" height="16" rx="2" style="fill:#6B5444"/>`).join("")}`, `<rect x="280" y="360" width="60" height="250"/>`));
  const land = g(`<path d="M0 230 H520 V372 H0z" style="fill:#D9CBB0"/><path d="M0 372 H520" stroke="#8A7A62" stroke-width="5"/>`);
  const coop = place("bvcoop", 250, 232, 50, 10, "The co-op", shed(180, 136, 140, 92, {wall: "#B9BEC4", roof: "#8A9098", sign: "FISHERMEN'S CO-OP", door: "#3E6B8C", wins: [26, 114]}), "Co-op", 250, 254, "#C3DDF3");
  const boats = place("bvboats", 310, 560, 40, 10, "The cray boats", boat(220, 470, "#3E6B8C") + boat(410, 520, C.red) + boat(220, 590, "#F3D34A", "#FFFDF6", .9) + crayPots(296, 600), "Cray boats", 310, 586, "#C3DDF3");
  const gulls = place("bvgulls", 420, 330, 30, 9, "The gulls", gullStand(400, 336) + gullStand(424, 330) + gullStand(446, 338), "Gulls", 420, 354, "#F6E3B4");
  const shedRow = shed(30, 150, 120, 78, {wall: "#C9785A", roof: "#8A9098", door: "#5A3A2E"}) + shed(370, 150, 120, 78, {wall: "#9FC3D9", roof: "#8A9098", door: "#3E6B8C"});
  return lampDefs + `<rect width="520" height="640" style="fill:#D9CBB0"/>` + g(`<path d="M0 0 H520 V140 H0z" style="fill:#C9D19A"/><path d="M0 60 Q120 30 260 50 T520 40 V140 H0z" style="fill:#9DAA78"/>`) + land + water + wharf + shedRow + coop + boats + gulls + crayPots(440, 300) + gull(100, 420) + gull(480, 410)
    + myVan("bvvan_harbour", 110, 330) + gate("bvToCottages", 504, 320, "Cottages", 466, 288, "East to the cottages");
}
function cottagesScreen(){
  const water = g(`<path d="M0 470 H520 V640 H0z" style="fill:${C.sand}"/>`) + sea("M0 520 Q260 500 520 520 V640 H0z", [[80, 570, 60], [340, 590, 80]]);
  const road = track("M0 320 H520", 30);
  const cottages = [[262, "#F4C7CF"], [318, "#C3E8DA"], [496, "#F3E7B0"]].map(([x, col]) => g(sk(`<rect x="${x - 26}" y="196" width="52" height="40" style="fill:${col}"/><path d="M${x - 30} 198 l30 -22 l30 22z" style="fill:#8A9098"/><rect x="${x - 6}" y="214" width="12" height="22" style="fill:#5A4636"/>`, `<rect x="${x - 26}" y="196" width="52" height="40"/>`)));
  const pub = place("bvpub", 140, 230, 46, 10, "The Anchor Hotel", shed(70, 110, 140, 118, {wall: "#F3E3C3", roof: "#5A6A7A", sign: "THE ANCHOR HOTEL", wins: [26, 70, 114], door: "#3E5A3A", veranda: true}) + g(`<path d="M60 236 l8 -16 M68 220 l-8 0 M60 228 q4 10 10 0" stroke="#5A4636" stroke-width="2" fill="none"/>`), "The pub", 140, 252, "#FBE0B8");
  const smoke = place("bvsmokehouse", 400, 230, 44, 10, "The smokehouse", sk(`<rect x="340" y="142" width="120" height="86" style="fill:#B9AE9E"/><path d="M334 146 l66 -30 l66 30z" style="fill:#7A6A5A"/><rect x="430" y="96" width="14" height="36" style="fill:#8A7A6A"/><rect x="390" y="190" width="22" height="38" style="fill:#5A4636"/>`, `<rect x="340" y="142" width="120" height="86"/>`) + g(`<path d="M437 92 q-10 -14 2 -24 q12 -10 0 -22" fill="none" stroke="#D9D2C8" stroke-width="6" stroke-linecap="round" opacity=".7"/>`), "Smokehouse", 400, 252, "#F6E3B4");
  const shore = place("bvbayshore", 260, 460, 40, 10, "The little beach", g(`<path d="M150 486 l40 -6 l-6 14 h-30z" fill="#E8566C" stroke="${C.ink}" stroke-width=".8"/><path d="M330 492 l44 -6 l-6 14 h-34z" fill="#9FC3D9" stroke="${C.ink}" stroke-width=".8"/>`), "Little beach", 260, 484, "#C3DDF3");
  return lampDefs + ground("#D9CBB0") + water + road + cottages + pub + smoke + shore + norfolk(500, 440, .8) + gullStand(220, 470) + gull(300, 560)
    + gate("bvToWharf", 16, 320, "The wharf", 60, 288, "West, back to the wharf");
}

/* ---------- The Sisters: the lookout (cs_lookout) and the beach (cs_beach) ---------- */
function lookoutScreen(){
  const water = sea("M0 420 H520 V640 H0z", [[40, 480, 60], [300, 500, 80], [420, 600, 60]]) + stack(110, 560, 70, 110) + stack(230, 620, 90, 150) + stack(380, 580, 60, 90) + stack(470, 630, 50, 70);
  const cliff = g(`<path d="M0 410 Q260 396 520 412 V440 Q260 426 0 440z" style="fill:${C.cliff}"/>`);
  const walk = track("M130 320 Q200 340 300 380", 16) + g(sk(`<path d="M250 360 h100 v50 h-100z" style="fill:#B98A5E"/>`, `<path d="M250 360 h100 v50 h-100z"/>`) + `<path d="M250 410 h100 M250 360 v50 M350 360 v50" stroke="#6B5444" stroke-width="3"/>`);
  const plat = place("bvplatform", 300, 400, 40, 10, "The lookout platform", "", "Lookout", 300, 426, "#F6E3B4");
  const kiosk = place("bvkiosk", 400, 232, 42, 10, "The kiosk", shed(340, 140, 120, 88, {wall: "#F3E7C8", roof: "#3E6B8C", sign: "KIOSK", wins: [24, 96]}) + awning(336, 190, 128, "#3E6B8C"), "Kiosk", 400, 254, "#C3DDF3");
  const steps = g(Array.from({length: 7}, (_, i) => `<rect x="${456 + i*2}" y="${330 + i*12}" width="30" height="5" fill="#B98A5E" stroke="#6B5444" stroke-width=".6"/>`).join(""));
  return lampDefs + ground() + cliff + water + walk + steps + heathBush(40, 360) + heathBush(200, 300, 1.1, "#F3D34A") + heathBush(480, 300) + heathBush(60, 250, .9) + kiosk + plat + gull(180, 470) + gull(330, 450)
    + myVan("bvvan_sisters", 130, 310) + gate("bvToSand", 474, 400, "Beach steps", 420, 380, "Down the steps to the beach");
}
function sistersBeachScreen(){
  const cliff = g(sk(`<path d="M0 0 H520 V150 Q400 170 260 160 Q120 176 0 160z" style="fill:${C.cliff}"/><path d="M0 0 H520 V40 H0z" style="fill:${C.heath}"/>`, ``) + `<path d="M0 80 Q260 70 520 86 M0 120 Q260 110 520 126" stroke="${C.cliff2}" stroke-width="3" fill="none" opacity=".6"/>`) + g(Array.from({length: 8}, (_, i) => `<rect x="${440 + i*2}" y="${40 + i*18}" width="30" height="5" fill="#B98A5E" stroke="#6B5444" stroke-width=".6"/>`).join(""));
  const water = sea("M0 430 Q260 414 520 430 V640 H0z", [[60, 500, 60], [260, 520, 80], [420, 580, 60]]) + surfLine(440, 0, 520) + stack(400, 540, 90, 160) + stack(500, 600, 60, 100) + stack(70, 620, 50, 80);
  const club = place("bvslsc", 130, 252, 44, 10, "The surf club", shed(70, 166, 120, 82, {wall: "#F3E7C8", roof: C.red, sign: "SURF CLUB", wins: [24, 96], door: "#E8C33A"}) + g(`<path d="M196 230 v-40" stroke="#6B5444" stroke-width="2"/><path d="M196 190 h14 v10 h-14z" fill="#E8566C"/><path d="M196 195 h14 v5 h-14z" fill="#F3D34A"/>`), "Surf club", 130, 274, "#F6D3DC");
  const hide = place("bvhide", 400, 296, 40, 10, "The penguin hide", sk(`<path d="M350 296 V250 h100 v46z" style="fill:#9A8A6E"/><path d="M344 252 l56 -14 l56 14z" style="fill:#6B5A44"/><rect x="364" y="262" width="72" height="10" style="fill:#2A2420"/>`, `<path d="M350 296 V250 h100 v46z"/>`), "Penguin hide", 400, 318, "#DCEBC8");
  const shore = place("bvpenguins", 250, 412, 40, 10, "The penguin shore", g(`<path d="M200 404 h100" stroke="#B9A88A" stroke-width="2" stroke-dasharray="6 4"/>${[[220, 396], [236, 398], [260, 394]].map(([x, y]) => `<path d="M${x} ${y} l2 -3 M${x + 2} ${y} l2 -3" stroke="#B9A88A" stroke-width="1"/>`).join("")}`), "Penguin shore", 250, 434, "#C3DDF3");
  return lampDefs + `<rect width="520" height="640" style="fill:${C.sand}"/>` + cliff + g(`<path d="M0 230 Q120 214 260 226 Q380 214 520 228 V250 H0z" style="fill:${C.heath2}"/>`) + water + club + hide + shore + gull(140, 480) + gull(300, 470)
    + gate("bvToLookout", 470, 196, "Lookout", 420, 214, "Up the steps to the lookout");
}

/* ---------- Koala Cove: the caravan park (cc_park) and the river mouth (cc_mouth) ---------- */
function parkScreen(){
  const water = sea("M300 0 H520 V70 Q420 84 300 64z", [[360, 30, 50], [440, 50, 50]]);
  const road = track("M150 640 Q160 560 230 520 Q320 480 504 480", 30) + track("M230 520 Q200 400 130 260 M320 480 Q380 380 390 260", 18);
  const store = place("bvparkstore", 130, 252, 42, 10, "The park store", shed(70, 166, 120, 82, {wall: "#F3E7C8", roof: "#3E6B8C", sign: "PARK STORE", wins: [24, 96], door: "#3E6B8C"}) + parrot(90, 158, 1), "Park store", 130, 274, "#C3DDF3");
  const laundry = place("bvlaundry", 390, 252, 44, 10, "The laundry café", shed(330, 166, 120, 82, {wall: "#C3E8DA", roof: "#8A9098", sign: "LAUNDRY CAFÉ", wins: [24, 96], door: "#E8566C"}) + g(`<path d="M454 180 h50" stroke="#8A7A62" stroke-width="1"/>${[460, 474, 488].map((x, i) => `<rect x="${x}" y="181" width="10" height="12" fill="${["#F4C7CF", "#9FC3D9", "#F3E7B0"][i]}"/>`).join("")}`), "Laundry café", 390, 274, "#C3E8DA");
  const parrots = place("bvparrots", 270, 400, 34, 10, "The king parrots", g(`<path d="M246 400 h48" stroke="#8A6A52" stroke-width="3"/>`) + parrot(252, 392) + parrot(270, 390, -1) + parrot(288, 393), "King parrots", 270, 424, "#F6D3DC");
  const koalas = place("bvkoalas", 460, 420, 30, 10, "The koala gums", gum(460, 420, 1.4, 1) + koala(452, 344) + gum(500, 560, 1.1, 0) + koala(496, 506), "Koala gums", 452, 372, "#DCEBC8");
  const vans = kombi(70, 400, "#FFFDF6", "#E8566C") + caravan(80, 470, "#3E6B8C") + g(sk(`<rect x="370" y="330" width="80" height="34" rx="16" style="fill:#D9DDE0"/><path d="M370 348 h80" style="stroke:#B9BEC4" stroke-width="2"/><circle cx="392" cy="366" r="6" style="fill:#2F2B28"/>`, `<rect x="370" y="330" width="80" height="34" rx="16"/>`));
  return lampDefs + ground() + water + road + gum(40, 300, 1.1, 0) + gum(240, 180, 1, 2) + gum(30, 600, 1, 1) + vans + store + laundry + parrots + koalas + chair(130, 410, "#3E6B8C") + chair(150, 412, "#E8566C")
    + myVan("bvvan_cove", 150, 560) + gate("bvToMouth", 504, 480, "River mouth", 466, 448, "East to the river mouth");
}
function mouthScreen(){
  const river = g(sk(`<path d="M0 240 Q120 230 180 300 Q240 380 300 470 H200 Q160 400 110 330 Q60 280 0 300z" style="fill:#7FA8A0"/>`, ``));
  const sand = g(`<path d="M0 300 Q60 280 110 330 Q160 400 200 470 H520 V230 Q360 240 200 236 Q120 232 0 240z" style="fill:${C.sand}"/>`);
  const water = sea("M0 470 H520 V640 H0z", [[60, 520, 60], [300, 540, 90], [440, 590, 60]]) + surfLine(478, 0, 520) + surfLine(496, 40, 480);
  const hall = place("bvrechall", 400, 252, 46, 10, "The rec hall", shed(330, 156, 140, 92, {wall: "#E6E2DA", roof: "#8A9098", sign: "REC HALL", wins: [26, 114], door: "#3E6B8C"}), "Rec hall", 400, 274, "#C3DDF3");
  const nippers = place("bvnippers", 330, 440, 40, 10, "Nippers", g(`<path d="M300 436 v-34 M362 436 v-34" stroke="#6B5444" stroke-width="2"/><path d="M300 402 h14 v10 h-14z M362 402 h14 v10 h-14z" fill="#E8566C"/><path d="M300 407 h14 v5 h-14z M362 407 h14 v5 h-14z" fill="#F3D34A"/>${[310, 324, 338, 352].map((x, i) => `<circle cx="${x}" cy="${428 - (i % 2)*4}" r="3" fill="${i % 2 ? "#F3D34A" : "#E8566C"}"/>`).join("")}`), "Nippers", 330, 462, "#F6D3DC");
  const mouth = place("bvrivermouth", 240, 340, 36, 10, "The river mouth", pelican(220, 330) + pelican(260, 346), "River mouth", 240, 364, "#C3DDF3");
  return lampDefs + `<rect width="520" height="640" style="fill:${C.grass}"/>` + g(`<path d="M0 0 H520 V240 H0z" style="fill:${C.grass}"/>`) + gum(60, 200, 1.1, 0) + gum(200, 190, 1, 1) + sand + river + water + hall + nippers + mouth + gull(140, 520) + gull(380, 520)
    + gate("bvToPark", 16, 480, "The park", 60, 448, "West, back to the park");
}

const SCREENS = {cw_beach: beachScreen, cw_street: streetScreen, cl_light: lightScreen, cl_cliff: cliffScreen, cg_ferns: fernsScreen, cg_cove: coveScreen,
  ch_wharf: wharfScreen, ch_cottages: cottagesScreen, cs_lookout: lookoutScreen, cs_beach: sistersBeachScreen, cc_park: parkScreen, cc_mouth: mouthScreen};
export const coastArt = scene => (SCREENS[scene] || beachScreen)();
