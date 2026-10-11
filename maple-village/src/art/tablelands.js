// Bellbird Valley's Tablelands (round 157): twelve screens inspired by the Atherton Tablelands. The high country:
// deep rainforest greens and tree ferns, very green dairy grass, red earth on the tracks and in the macadamia rows,
// a round blue crater lake, old timber towns with tin verandahs, and mist lying in the hollows in the mornings.
// Calm on purpose: detail round the edges, a clear middle. The places are in data/tablelands.js. (Helpers shared
// with the Vines: art/bellbird-vines.js.)
import { sgHM } from "../util.js";
import { sk } from "./scenes.js";
import { lampDefs } from "./village-extras.js";
import { bbPlace as place, bbGate as gate, bbShed as shed, bbFence as fence, bbVan as myVan, bbChair as chair, bbTable as table, bbFlowers as flowers } from "./bellbird-vines.js";

const C = {rain: "#6E9A5A", rain2: "#5E8A4E", rain3: "#4A7240", canopy: "#3E6A3E", canopy2: "#557F48", grass: "#9CC47A", grass2: "#8AB86A", earth: "#B8644A", earth2: "#9A5038",
  lake: "#3E86AE", lake2: "#5E9EC4", rock: "#7A766A", rock2: "#5E5A50", mist: "#F2F6F4", ink: "#2F2B28", cream: "#F3EAD6", timber: "#B98A5E", timber2: "#8A6A52"};
const g = s => `<g pointer-events="none">${s}</g>`;
const morning = () => sgHM() < 10*60;
const sunny = () => { const h = sgHM(); return h >= 9*60 && h < 15*60; };
// mist lying in the hollows before ten
const mist = (pts = [[120, 200, 160], [380, 320, 180], [220, 520, 200]]) => morning() ? g(`<g filter="url(#wash)">${pts.map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w*.18}" fill="${C.mist}" opacity=".5"/>`).join("")}</g>`) : "";
const ground = (col = C.rain, col2 = C.rain2) => `<rect width="520" height="640" style="fill:${col}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="140" cy="460" rx="170" ry="90" style="fill:${col2}"/><ellipse cx="400" cy="560" rx="150" ry="70" style="fill:${col2}"/></g>`;
// a red earth track
const redTrack = (d, w = 26) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.earth2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.earth}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const boardwalk = (d, w = 26) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.timber2}" stroke-width="${w}" stroke-linecap="butt" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.timber}" stroke-width="${w - 6}" stroke-dasharray="3 9" stroke-linejoin="round"/></g>`;
// a rainforest tree: a pale trunk and a big cloudy canopy
const rfTree = (x, y, s = 1, i = 0) => g(sk(`<path d="M${x - 5*s} ${y} q${-2*s} ${-50*s} ${3*s} ${-90*s} l${6*s} 0 q${3*s} ${44*s} ${4*s} ${90*s}z" style="fill:#C9BFA8"/>`, `<path d="M${x - 5*s} ${y} q${-2*s} ${-50*s} ${3*s} ${-90*s}"/>`)
  + [[-26, -96, 30], [20, -104, 32], [-4, -126, 30], [30, -80, 22], [-34, -76, 20]].map(([dx, dy, r], k) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*.72*s}" style="fill:${(k + i) % 2 ? C.canopy : C.canopy2}"/>`).join("")
  + `<path d="M${x - 2*s} ${y - 60*s} q${-10*s} ${20*s} ${-6*s} ${50*s}" fill="none" stroke="#5E8A4E" stroke-width="${1.6*s}"/>`);
const treeFern = (x, y, s = 1) => g(sk(`<path d="M${x} ${y} q${-2*s} ${-26*s} ${1*s} ${-46*s}" style="fill:none;stroke:#5A4636" stroke-width="${5*s}"/>`, ``) + [-70, -40, -12, 14, 42, 70, 100, 130].map((a, i) => { const r = a*Math.PI/180, ex = x + Math.sin(r)*32*s, ey = y - 46*s - Math.cos(r)*16*s + (Math.abs(a) > 60 ? 10*s : 0);
  return `<path d="M${x} ${y - 46*s} Q${(x + ex)/2} ${y - 60*s} ${ex} ${ey}" fill="none" stroke="${i % 2 ? "#5E8A4E" : "#7AA25E"}" stroke-width="${5*s}" stroke-linecap="round"/>`; }).join(""));
const bush = (x, y, s = 1, col = C.rain3) => g(`<ellipse cx="${x}" cy="${y}" rx="${18*s}" ry="${10*s}" fill="${col}"/><ellipse cx="${x + 10*s}" cy="${y - 5*s}" rx="${11*s}" ry="${8*s}" fill="${C.canopy2}"/>`);
const cow = (x, y, flip = 1, brown) => g(sk(`<ellipse cx="${x}" cy="${y - 12}" rx="17" ry="10" style="fill:${brown ? "#B9824E" : "#FFFDF6"}"/>${brown ? "" : `<ellipse cx="${x - 5}" cy="${y - 15}" rx="6" ry="4" style="fill:#2F2B28"/><ellipse cx="${x + 8}" cy="${y - 9}" rx="4" ry="3" style="fill:#2F2B28"/>`}<ellipse cx="${x + flip*19}" cy="${y - 16}" rx="7" ry="6" style="fill:${brown ? "#A87444" : "#2F2B28"}"/><ellipse cx="${x + flip*23}" cy="${y - 13}" rx="3.4" ry="2.6" style="fill:#F4C7CF"/>`,
  `<ellipse cx="${x}" cy="${y - 12}" rx="17" ry="10"/>`) + `<path d="M${x - 11} ${y - 4} v6 M${x - 4} ${y - 3} v6 M${x + 5} ${y - 3} v6 M${x + 12} ${y - 4} v6" stroke="${C.ink}" stroke-width="1.6"/><path d="M${x - flip*17} ${y - 14} q${-flip*5} 4 ${-flip*4} 10" fill="none" stroke="${C.ink}" stroke-width="1"/>`);
const calf = (x, y, flip = 1) => g(sk(`<ellipse cx="${x}" cy="${y - 8}" rx="10" ry="6" style="fill:#FFFDF6"/><ellipse cx="${x - 3}" cy="${y - 10}" rx="4" ry="2.6" style="fill:#2F2B28"/><ellipse cx="${x + flip*11}" cy="${y - 12}" rx="5" ry="4.4" style="fill:#2F2B28"/>`, `<ellipse cx="${x}" cy="${y - 8}" rx="10" ry="6"/>`) + `<path d="M${x - 6} ${y - 3} v5 M${x + 6} ${y - 3} v5" stroke="${C.ink}" stroke-width="1.4"/>`);
const tin = (x, y, w, col = "#B9BEC4") => g(sk(`<path d="M${x - 6} ${y} h${w + 12} l-4 -12 h${-w - 4}z" style="fill:${col}"/>${Array.from({length: Math.floor(w/8)}, (_, i) => `<path d="M${x + i*8} ${y - 11} v10" style="stroke:#9AA0A8" stroke-width="1"/>`).join("")}`, `<path d="M${x - 6} ${y} h${w + 12} l-4 -12 h${-w - 4}z"/>`));
const awning = (x, y, w, a, b = "#FFFDF6") => g(sk(`<path d="M${x} ${y} h${w} l-6 14 h${-w + 12}z" style="fill:${a}"/>${Array.from({length: Math.floor(w/14)}, (_, i) => i % 2 ? `<path d="M${x + i*14} ${y} h14 l-1 14 h-14z" style="fill:${b}"/>` : "").join("")}`, `<path d="M${x} ${y} h${w} l-6 14 h${-w + 12}z"/>`));
const sacks = (x, y) => g(sk([0, 1, 2].map(i => `<path d="M${x + i*16 - 7} ${y - (i === 1 ? 10 : 0)} q-2 -16 7 -18 q9 2 7 18z" style="fill:#D9C49A"/>`).join(""), ``));
const duck = (x, y, flip = 1) => g(`<ellipse cx="${x}" cy="${y}" rx="7" ry="4.4" fill="#9A8E70" stroke="${C.ink}" stroke-width=".6"/><circle cx="${x + flip*6}" cy="${y - 4}" r="3" fill="#3E6A4E" stroke="${C.ink}" stroke-width=".6"/><path d="M${x + flip*8.6} ${y - 4} l${flip*3} 1" stroke="#E8A83A" stroke-width="1.6"/>`);
const turtle = (x, y) => g(`<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" fill="#5E6A3E" opacity=".8"/><circle cx="${x + 6}" cy="${y - 1}" r="1.8" fill="#5E6A3E"/>`);
const kayak = (x, y, col, rot = 0) => g(sk(`<ellipse cx="${x}" cy="${y}" rx="22" ry="4.4" transform="rotate(${rot} ${x} ${y})" style="fill:${col}"/><ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" transform="rotate(${rot} ${x} ${y})" style="fill:#2F2B28"/>`, `<ellipse cx="${x}" cy="${y}" rx="22" ry="4.4" transform="rotate(${rot} ${x} ${y})"/>`));
const macTree = (x, y, s = 1, tarp) => g((tarp ? `<ellipse cx="${x}" cy="${y + 4}" rx="${40*s}" ry="${12*s}" fill="${tarp}" opacity=".9"/>${[[-16, 2], [10, 6], [22, -2], [-4, 8]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2*s}" fill="#8A6A42"/>`).join("")}` : `<ellipse cx="${x}" cy="${y + 4}" rx="${30*s}" ry="${7*s}" fill="#6F4A3A" opacity=".25"/>`)
  + sk(`<path d="M${x - 4*s} ${y} q${-1*s} ${-20*s} ${2*s} ${-34*s} l${4*s} 0 q${2*s} ${16*s} ${2*s} ${34*s}z" style="fill:#7A5A44"/>`, ``) + [[-20, -44, 24], [16, -48, 24], [-2, -64, 24], [26, -32, 16], [-28, -30, 15]].map(([dx, dy, r], k) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*.75*s}" fill="${k % 2 ? "#2E5A36" : "#3E6E42"}"/>`).join("")
  + [[-10, -40], [12, -52], [4, -30], [-22, -54]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2.2*s}" fill="#9CB86A"/>`).join(""));
const lantern = (x, y) => g(`<path d="M${x} ${y} v-34" stroke="#4A4A4A" stroke-width="2.4"/><rect x="${x - 5}" y="${y - 44}" width="10" height="12" rx="2" fill="#F3E3A0" stroke="#4A4A4A" stroke-width="1"/>`);
const dog = (x, y) => g(sk(`<ellipse cx="${x}" cy="${y}" rx="14" ry="6" style="fill:#C9A06A"/><circle cx="${x - 13}" cy="${y - 2}" r="5" style="fill:#C9A06A"/><path d="M${x - 17} ${y - 6} l-2 6" style="stroke:#8A6A42" stroke-width="3"/>`, `<ellipse cx="${x}" cy="${y}" rx="14" ry="6"/>`) + `<text x="${x + 6}" y="${y - 10}" font-size="8" fill="${C.ink}" opacity=".6">z</text>`);

/* ---------- Misty Falls: the top of the range (tf_top) and the swimming hole (tf_pool) ---------- */
function topScreen(){
  const view = g(`<rect width="520" height="170" fill="#E3EEF0"/><path d="M0 120 Q80 92 170 108 T340 98 T520 104 V170 H0z" fill="#B9D19A"/><path d="M0 140 Q120 118 240 132 T520 126 V170 H0z" fill="#9CC47A"/>
    ${[[60, 128, "#C9D88A"], [150, 132, "#A9C878"], [300, 124, "#D9D49A"], [420, 130, "#B5CF8A"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="40" height="10" fill="${c}" transform="rotate(-4 ${x} ${y})"/>`).join("")}
    <path d="M0 100 Q130 86 260 96 T520 92" fill="none" stroke="${C.mist}" stroke-width="10" opacity=".8"/><circle cx="440" cy="40" r="18" fill="#FFF6D6" opacity=".9"/>`);
  const rail = place("bvtview", 260, 230, 44, 10, "The lookout", g(sk(`<rect x="196" y="176" width="128" height="30" style="fill:${C.timber}"/>`, `<rect x="196" y="176" width="128" height="30"/>`) + `<path d="M196 176 v-22 M228 176 v-22 M260 176 v-22 M292 176 v-22 M324 176 v-22 M196 158 H324" stroke="${C.timber2}" stroke-width="3"/>`), "Lookout", 260, 252, "#C3DDF3");
  const cafe = place("bvtcafe", 110, 248, 46, 10, "The Range Café", shed(50, 166, 120, 84, {wall: "#F3E3C3", roof: "#5A6A4E", sign: "RANGE CAFÉ", wins: [24, 96], door: "#8A3A2E", veranda: true}) + g(`<rect x="152" y="120" width="10" height="30" fill="#8A7A6A"/><path d="M157 116 q-8 -12 2 -20 q10 -8 0 -18" fill="none" stroke="#D9D2C8" stroke-width="5" opacity=".7" stroke-linecap="round"/>`), "Range Café", 110, 272, "#FBE0B8");
  const ranger = place("bvtranger", 410, 248, 44, 10, "The ranger station", shed(350, 166, 120, 84, {wall: "#7FA068", roof: "#4E6A4A", sign: "RANGER", wins: [24, 96], door: "#5A4636"}) + g(`<ellipse cx="482" cy="236" rx="7" ry="9" fill="#2F2B28"/><circle cx="486" cy="224" r="4" fill="#3E7EA8"/><path d="M485 218 l3 -6 l3 6z" fill="#B9824E"/>`), "Ranger station", 410, 272, "#DCEBC8");
  const path = redTrack("M150 640 Q150 560 210 500 Q260 440 260 260", 26) + redTrack("M210 500 Q280 560 300 640", 20);
  const forest = rfTree(30, 420, 1, 0) + rfTree(490, 440, 1.1, 1) + rfTree(470, 620, .9, 0) + treeFern(60, 600, 1) + treeFern(380, 500, .9) + treeFern(30, 300, .8) + bush(340, 600, 1.1) + bush(420, 330, .9) + bush(100, 330, 1);
  return lampDefs + ground() + view + path + forest + rail + cafe + ranger + flowers([[300, 470, "#F4C7CF"], [180, 420, "#FFFDF6"], [420, 420, "#F3D34A"]]) + mist([[100, 150, 160], [380, 140, 170], [260, 440, 180]])
    + myVan("bvvan_falls", 150, 560) + gate("bvtToPool", 300, 612, "The falls", 360, 590, "Down the path to the falls");
}
function poolScreen(){
  const cliff = g(sk(`<path d="M0 0 H520 V150 Q440 170 380 160 Q320 176 260 168 Q200 176 140 160 Q80 170 0 154z" style="fill:${C.rock}"/>`, ``) + `<path d="M40 40 q30 -6 60 4 M300 60 q40 -8 80 2 M120 110 q50 -6 90 4 M380 110 q30 -4 60 4" stroke="${C.rock2}" stroke-width="3" fill="none" opacity=".6"/><path d="M0 0 H520 V28 Q260 46 0 30z" fill="${C.canopy}"/>`)
    + treeFern(60, 150, .7) + treeFern(460, 140, .7) + treeFern(170, 150, .5) + treeFern(370, 150, .5);
  const falls = g(`<path d="M246 24 Q250 100 244 190 H276 Q270 100 274 24z" fill="#E6F2F4" opacity=".95"/><path d="M252 30 v150 M260 26 v160 M268 30 v150" stroke="#FFFFFF" stroke-width="2" opacity=".8"/>`);
  const pool = place("bvtfalls", 260, 336, 46, 10, "The falls", g(sk(`<ellipse cx="260" cy="245" rx="120" ry="70" style="fill:#3E7E7E"/>`, `<ellipse cx="260" cy="245" rx="120" ry="70"/>`) + `<ellipse cx="260" cy="236" rx="90" ry="44" fill="#5E9E9A" opacity=".6"/><ellipse cx="260" cy="200" rx="34" ry="10" fill="#FFFFFF" opacity=".55"/><path d="M200 260 q20 -6 40 0 M290 280 q20 -6 40 0" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".6"/>`
    + (sunny() ? `<path d="M200 214 Q260 140 320 214" fill="none" stroke="#F4A0A0" stroke-width="3" opacity=".5"/><path d="M204 216 Q260 146 316 216" fill="none" stroke="#F3D34A" stroke-width="3" opacity=".5"/><path d="M208 218 Q260 152 312 218" fill="none" stroke="#9CC4D0" stroke-width="3" opacity=".5"/>` : "")), "The falls", 260, 358, "#C3DDF3");
  const rock = place("bvtrock", 420, 360, 36, 9, "The sunny rock", g(sk(`<ellipse cx="425" cy="322" rx="46" ry="20" style="fill:#9A9484"/><ellipse cx="418" cy="314" rx="30" ry="10" style="fill:#B0AA9A"/>`, `<ellipse cx="425" cy="322" rx="46" ry="20"/>`)), "Sunny rock", 420, 382, "#F6E3B4");
  const gallery = place("bvtgallery", 110, 502, 44, 10, "The Mistfall gallery", shed(50, 420, 120, 80, {wall: "#C9DCC0", roof: "#8A9098", sign: "GALLERY", wins: [24, 96], door: "#5E8A9A"}) + g(`<circle cx="44" cy="474" r="6" fill="#C9785A" stroke="${C.ink}" stroke-width=".8"/><path d="M44 480 v20" stroke="${C.timber2}" stroke-width="3"/>`), "Gallery", 110, 526, "#DCEBC8");
  const path = redTrack("M480 176 Q440 260 400 400 Q360 470 260 470 Q170 470 110 510", 22);
  return lampDefs + ground("#7FA868", "#6E9A5A") + cliff + falls + path + pool + rock + gallery + treeFern(470, 560, 1.1) + treeFern(300, 600, .9) + rfTree(40, 640, .9) + bush(220, 560, 1) + bush(480, 470, .8) + mist([[260, 330, 200], [100, 380, 140]])
    + gate("bvtToTop", 480, 176, "To the top", 430, 214, "Up the path to the top of the range");
}

/* ---------- Crater Lake: the shore (tk_shore) and the curtain fig (tk_fig) ---------- */
function shoreScreen(){
  const lake = g(`<path d="M0 0 H520 V70 Q260 30 0 70z" fill="${C.canopy}"/>${[40, 120, 200, 280, 360, 440, 500].map((x, i) => `<ellipse cx="${x}" cy="${44 + (i % 2)*10}" rx="40" ry="26" fill="${i % 2 ? C.canopy2 : C.canopy}"/>`).join("")}`)
    + g(sk(`<path d="M0 74 Q260 34 520 74 V300 Q260 336 0 300z" style="fill:${C.lake}"/>`, ``) + `<path d="M0 90 Q260 52 520 90" stroke="#2E6A5A" stroke-width="10" fill="none" opacity=".5"/><path d="M60 160 q30 -4 60 0 M300 140 q40 -4 80 0 M160 230 q30 -4 60 0 M380 220 q20 -4 50 0" stroke="${C.lake2}" stroke-width="3" fill="none"/>`)
    + kayak(170, 190, "#E8566C", -6) + kayak(380, 160, "#F3C969", 8) + turtle(120, 260) + turtle(330, 272) + turtle(450, 250);
  const jetty = place("bvtjetty", 260, 392, 34, 9, "The jetty", g(sk(`<rect x="244" y="230" width="32" height="160" style="fill:${C.timber}"/>${Array.from({length: 8}, (_, i) => `<path d="M244 ${244 + i*18} h32" style="stroke:${C.timber2}" stroke-width="1.2"/>`).join("")}<rect x="240" y="236" width="6" height="14" style="fill:#6B5444"/><rect x="274" y="236" width="6" height="14" style="fill:#6B5444"/>`, `<rect x="244" y="230" width="32" height="160"/>`)), "Jetty", 300, 412, "#C3DDF3");
  const lakeHouse = place("bvtlake", 105, 388, 44, 10, "The Lake House", shed(40, 306, 130, 80, {wall: "#F3EAD6", roof: "#3E6B5A", sign: "THE LAKE HOUSE", wins: [26, 104], door: "#8A3A2E", veranda: true}) + g(`<rect x="150" y="262" width="10" height="28" fill="#8A7A6A"/>`), "Lake House", 105, 412, "#FBE0B8");
  const boats = place("bvtboat", 420, 388, 44, 10, "The boat shed", shed(360, 306, 120, 80, {wall: "#C8432F", roof: "#8A9098", sign: "BOAT SHED", wins: [24, 96], door: "#5A3A2E"}) + kayak(486, 360, "#3E86AE", 80) + kayak(498, 364, "#F3C969", 84), "Boat shed", 420, 412, "#F6D3DC");
  const lawn = redTrack("M130 640 Q150 560 240 520 Q360 480 504 480", 24) + redTrack("M240 520 Q260 460 260 400", 16);
  return lampDefs + ground(C.grass, C.grass2) + lake + lawn + jetty + lakeHouse + boats + rfTree(30, 620, 1, 1) + rfTree(500, 640, .9, 0) + treeFern(320, 600, .8) + table(330, 470) + chair(380, 520, "#E8566C") + chair(400, 522, "#3E86AE")
    + flowers([[200, 470, "#FFFDF6"], [440, 560, "#F4C7CF"]]) + mist([[260, 150, 240], [120, 220, 140]]) + myVan("bvvan_crater", 130, 560) + gate("bvtToFig", 504, 480, "Curtain fig", 456, 448, "East along the boardwalk to the curtain fig");
}
function figScreen(){
  const floor = ground("#6E9058", "#5E8048");
  const canopy = g(`<path d="M0 0 H520 V110 Q400 140 260 120 Q120 140 0 110z" fill="${C.canopy}"/>${[60, 160, 360, 460].map((x, i) => `<ellipse cx="${x}" cy="${100 + (i % 2)*16}" rx="56" ry="36" fill="${i % 2 ? C.canopy2 : C.canopy}"/>`).join("")}`);
  const walk = boardwalk("M16 480 Q120 470 200 420 Q250 380 250 340 M200 420 Q320 400 405 260", 28);
  const fig = place("bvtfig", 250, 336, 50, 12, "The curtain fig", g(sk(`<path d="M196 320 Q190 200 214 120 H290 Q312 200 306 320z" style="fill:#9A8E78"/>`, `<path d="M196 320 Q190 200 214 120 H290 Q312 200 306 320z"/>`)
    + Array.from({length: 16}, (_, i) => `<path d="M${200 + i*7} ${130 + (i % 3)*6} Q${198 + i*7 + (i % 2 ? 3 : -3)} 230 ${202 + i*7} 318" stroke="${i % 2 ? "#7A6E5A" : "#B0A48A"}" stroke-width="2.4" fill="none"/>`).join("")
    + `<ellipse cx="250" cy="96" rx="96" ry="54" fill="${C.canopy2}"/><ellipse cx="210" cy="80" rx="50" ry="30" fill="${C.canopy}"/><ellipse cx="300" cy="78" rx="46" ry="28" fill="#4E7A48"/>`), "Curtain fig", 250, 360, "#DCEBC8");
  const roo = place("bvttreeroo", 100, 420, 32, 9, "The tree-kangaroo", rfTree(100, 400, .95, 1) + g(`<path d="M70 300 h70" stroke="#7A6A5A" stroke-width="5"/><ellipse cx="104" cy="290" rx="10" ry="12" fill="#7A5A3A" stroke="${C.ink}" stroke-width=".8"/><circle cx="104" cy="276" r="7" fill="#8A6A44" stroke="${C.ink}" stroke-width=".8"/><circle cx="100" cy="270" r="2.4" fill="#5A3A2A"/><circle cx="108" cy="270" r="2.4" fill="#5A3A2A"/><path d="M110 300 q6 20 2 40" stroke="#5A3A2A" stroke-width="4" fill="none" stroke-linecap="round"/>`), "Tree-kangaroo", 100, 444, "#F6E3B4");
  const turner = place("bvtturner", 405, 248, 44, 10, "The wood-turner's shop", shed(345, 166, 120, 84, {wall: "#B98A5E", roof: "#5A6A4E", sign: "WOOD-TURNER", wins: [24, 96], door: "#5A3A2E"}) + g(`<ellipse cx="342" cy="244" rx="10" ry="4" fill="#C9A06A" opacity=".7"/>`), "Wood-turner", 405, 272, "#FBE0B8");
  const ferns = treeFern(40, 640, 1) + treeFern(470, 420, 1.1) + treeFern(330, 600, .9) + treeFern(140, 600, .8) + bush(480, 560, 1.1) + bush(40, 300, .9);
  return lampDefs + floor + canopy + walk + fig + roo + turner + ferns + mist([[260, 470, 220]]) + gate("bvtToShore", 16, 480, "The lake", 60, 448, "West, back to the lake");
}

/* ---------- Willow Bend: the main street (tr_street) and the creek (tr_creek) ---------- */
function streetScreen(){
  const road = g(`<rect y="300" width="520" height="70" fill="#A8A498"/><path d="M0 335 H520" stroke="#F3EAD6" stroke-width="2" stroke-dasharray="14 12"/><rect y="282" width="520" height="18" fill="#D9CBB0"/><rect y="370" width="520" height="14" fill="#D9CBB0"/>`);
  const bake = place("bvtbakery", 110, 248, 46, 10, "The bakehouse", shed(50, 166, 120, 84, {wall: "#E3B8A0", roof: "#8A9098", sign: "BAKEHOUSE", wins: [24, 96], door: "#5A3A2E", veranda: true}) + g(`<rect x="66" y="120" width="12" height="34" fill="#A8574A"/>`), "Bakehouse", 110, 272, "#FBE0B8");
  const lolly = place("bvtlolly", 260, 248, 46, 10, "Jarrah's lolly shop", shed(200, 166, 120, 84, {wall: "#F4C7CF", roof: "#8A9098", sign: "LOLLIES", wins: [24, 96], door: "#E8566C"}) + awning(196, 196, 128, "#E8566C") + g([210, 222, 298, 310].map((x, i) => `<rect x="${x - 3}" y="${182 - (i % 2)*2}" width="6" height="9" rx="2" fill="${["#F3C969", "#9FD3C2", "#B9A2DC", "#E8566C"][i]}" stroke="${C.ink}" stroke-width=".5"/>`).join("")), "Lolly shop", 260, 272, "#F6D3DC");
  const books = place("bvtbooks", 410, 248, 46, 10, "The book barn", shed(350, 156, 120, 94, {wall: "#9A5A44", roof: "#7A766A", sign: "BOOK BARN", wins: [24, 96], door: "#3E3A2E", roofH: 28}), "Book barn", 410, 272, "#FBE0B8");
  const trough = place("bvttrough", 300, 470, 34, 9, "The old horse trough", g(sk(`<rect x="270" y="440" width="60" height="22" rx="3" style="fill:#9A9484"/>`, `<rect x="270" y="440" width="60" height="22" rx="3"/>`) + [282, 296, 310, 322].map((x, i) => `<circle cx="${x}" cy="${438 - (i % 2)*3}" r="5" fill="${i % 2 ? "#E8566C" : "#F4A0A0"}"/>`).join("") + `<path d="M276 440 q4 -6 10 -2 M312 440 q6 -6 12 -2" stroke="#5E8A4E" stroke-width="2" fill="none"/>`), "Horse trough", 300, 488, "#F6E3B4");
  const lamps = lantern(30, 300) + lantern(186, 300) + lantern(336, 300) + lantern(500, 300);
  return lampDefs + ground(C.grass, C.grass2) + road + bake + lolly + books + lamps + trough + dog(200, 290) + rfTree(40, 640, .9, 0) + rfTree(480, 640, 1, 1) + bush(360, 600) + flowers([[220, 470, "#F3D34A"], [420, 470, "#FFFDF6"]])
    + myVan("bvvan_town", 130, 560) + gate("bvtToCreek", 504, 400, "The creek", 456, 430, "East to the creek");
}
function creekScreen(){
  const creek = g(sk(`<path d="M228 0 Q236 160 230 320 Q226 480 234 640 H292 Q284 480 290 320 Q296 160 288 0z" style="fill:#6E9AA8"/>`, ``) + `<path d="M246 60 q6 20 0 40 M262 220 q-6 20 0 40 M250 500 q6 20 0 40" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".6"/>`
    + [[240, 120], [276, 260], [244, 560]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3" fill="#5A7A6A"/>`).join(""));
  const bridge = g(sk(`<rect x="190" y="382" width="140" height="36" style="fill:${C.timber}"/>${Array.from({length: 9}, (_, i) => `<path d="M${196 + i*15} 382 v36" style="stroke:${C.timber2}" stroke-width="1.2"/>`).join("")}`, `<rect x="190" y="382" width="140" height="36"/>`) + `<path d="M190 380 H330 M190 420 H330" stroke="${C.timber2}" stroke-width="4"/>${[190, 225, 260, 295, 330].map(x => `<path d="M${x} 380 v-12 M${x} 420 v-12" stroke="${C.timber2}" stroke-width="3"/>`).join("")}`);
  const plat = place("bvtplatypus", 180, 320, 36, 9, "The platypus platform", g(sk(`<rect x="140" y="270" width="88" height="36" style="fill:${C.timber}"/>`, `<rect x="140" y="270" width="88" height="36"/>`) + `<path d="M140 268 H228 M140 268 v-14 M184 268 v-14 M228 268 v-14 M140 254 H228" stroke="${C.timber2}" stroke-width="3"/>` + `<circle cx="262" cy="300" r="10" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".7" class="twinkle"/><circle cx="262" cy="300" r="5" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".6"/>`), "Platypus platform", 160, 344, "#C3DDF3");
  const park = place("bvtpark", 400, 520, 40, 10, "The picnic park", table(400, 474) + rfTree(460, 440, 1.1, 0) + g(sk(`<path d="M350 560 v-50 h40 v50" style="fill:none;stroke:#8A6A52" stroke-width="3"/><path d="M362 510 v30 M378 510 v30" style="stroke:#6B5444" stroke-width="1.2"/><rect x="358" y="538" width="24" height="5" style="fill:#E8566C"/>`, ``)) + duck(330, 560) + duck(310, 590, -1), "Picnic park", 410, 544, "#DCEBC8");
  const banks = rfTree(60, 240, 1, 1) + rfTree(460, 260, 1, 0) + rfTree(140, 200, .8, 0) + rfTree(380, 210, .8, 1) + treeFern(60, 600, .9) + treeFern(170, 520, .7) + bush(100, 440, 1) + bush(160, 620, .9);
  return lampDefs + ground(C.grass, C.grass2) + creek + bridge + banks + plat + park + mist([[260, 300, 200]]) + gate("bvtToMain", 16, 400, "Main street", 60, 368, "West, back to the main street");
}

/* ---------- Greenhill Dairy: the paddock (td_paddock) and the yard (td_yard) ---------- */
function paddockScreen(){
  const hills = g(`<rect width="520" height="160" fill="#E3EEF0"/><path d="M0 110 Q120 70 260 96 T520 84 V170 H0z" fill="#8AB86A"/><path d="M0 140 Q140 110 280 128 T520 120 V170 H0z" fill="#7AAE5A"/><ellipse cx="120" cy="40" rx="40" ry="12" fill="#FFFFFF"/><ellipse cx="380" cy="30" rx="50" ry="14" fill="#FFFFFF"/>`);
  const windmill = place("bvtwindmill", 80, 300, 30, 9, "The windmill", g(sk(`<path d="M70 290 L78 160 h4 L90 290z" style="fill:none;stroke:#8A9098" stroke-width="3"/><path d="M66 290 L80 160 L94 290 M70 240 h20 M74 200 h12" style="fill:none;stroke:#8A9098" stroke-width="1.4"/>`, ``) + `<g transform="translate(80 156)"><g class="tlspin">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M0 0 L26 -4 L26 4z" transform="rotate(${a})" fill="#D9DDE0" stroke="${C.ink}" stroke-width=".6"/>`).join("")}</g></g><path d="M80 156 l30 -4 l-4 12z" fill="#C8432F"/>`
    + sk(`<rect x="100" y="250" width="40" height="40" rx="4" style="fill:#B9BEC4"/>`, `<rect x="100" y="250" width="40" height="40" rx="4"/>`)), "Windmill", 80, 322, "#F6E3B4");
  const herd = place("bvtcows", 200, 330, 50, 12, "The herd", cow(170, 300, 1) + cow(230, 286, -1) + cow(260, 320, 1, true) + cow(140, 260, -1) + cow(300, 240, 1), "The herd", 200, 352, "#DCEBC8");
  const pen = place("bvtcalves", 390, 420, 40, 10, "The calf pen", g(sk(`<rect x="330" y="340" width="120" height="58" style="fill:#C9D9A0"/>`, ``)) + calf(360, 380, 1) + calf(400, 372, -1) + calf(430, 390, 1) + fence(330, 450, 400) + fence(330, 450, 346), "Calf pen", 390, 444, "#F6D3DC");
  const lane = redTrack("M260 640 Q260 560 250 480 Q240 420 260 370", 22);
  return lampDefs + ground(C.grass, C.grass2) + hills + lane + windmill + herd + pen + cow(460, 280, -1) + cow(420, 540, 1, true) + cow(120, 560, -1) + fence(0, 200, 620) + fence(320, 520, 620) + rfTree(500, 230, .8, 1) + mist([[200, 180, 200], [400, 470, 160]])
    + gate("bvtToYard", 260, 612, "The yard", 320, 590, "Down the lane to the yard");
}
function yardScreen(){
  const paddocks = g(`<path d="M0 0 H220 V140 H0z M300 0 H520 V140 H300z" fill="#8AB86A"/>`) + fence(0, 220, 140) + fence(300, 520, 140) + cow(80, 90, 1) + cow(150, 60, -1, true) + cow(400, 80, 1) + cow(470, 110, -1);
  const lane = redTrack("M260 0 Q262 120 260 200 Q250 320 230 420 Q200 520 130 580", 30);
  const milk = place("bvtmilk", 105, 248, 46, 10, "The milking shed", shed(40, 166, 130, 84, {wall: "#E6E2DA", roof: "#8A9098", sign: "MILKING SHED", wins: [26, 104], door: "#3E6B5A"}) + g(sk(`<rect x="176" y="190" width="28" height="56" rx="12" style="fill:#D9DDE0"/>`, `<rect x="176" y="190" width="28" height="56" rx="12"/>`)), "Milking shed", 105, 272, "#C3DDF3");
  const shop = place("bvtshop", 415, 248, 46, 10, "The farm shop", shed(350, 166, 130, 84, {wall: "#F3EAD6", roof: "#5A6A4E", sign: "FARM SHOP", wins: [26, 104], door: "#FFFDF6", veranda: true}) + g(`<ellipse cx="410" cy="236" rx="5" ry="4" fill="#2F2B28"/><ellipse cx="420" cy="244" rx="4" ry="3" fill="#2F2B28"/><rect x="486" y="214" width="12" height="22" rx="4" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".8"/><rect x="486" y="214" width="12" height="6" fill="#3E86AE"/>`), "Farm shop", 415, 272, "#FBE0B8");
  const cheese = place("bvtcheese", 410, 522, 44, 10, "The cheese room", shed(350, 440, 120, 80, {wall: "#FFFDF6", roof: "#B9BEC4", sign: "CHEESE ROOM", wins: [24, 96], door: "#E3B04B"}), "Cheese room", 410, 546, "#F6E3B4");
  return lampDefs + ground("#C9CFA0", "#B9C48A") + paddocks + lane + milk + shop + cheese + g(sk(`<rect x="40" y="300" width="20" height="30" rx="3" style="fill:#D9DDE0"/><rect x="62" y="306" width="18" height="24" rx="3" style="fill:#D9DDE0"/>`, ``)) + chair(470, 330, "#3E86AE") + table(300, 470)
    + flowers([[200, 330, "#F3D34A"], [320, 380, "#FFFDF6"]]) + mist([[110, 90, 120], [410, 90, 120]]) + myVan("bvvan_dairy", 130, 560) + gate("bvtToPaddock", 260, 26, "The paddock", 320, 50, "Up the lane to the paddock");
}

/* ---------- Nutwood Farm: the grove (tm_grove) and the cracking shed (tm_shed) ---------- */
function groveScreen(){
  const soil = ground("#C98A6A", "#B87A5A") + g(Array.from({length: 6}, (_, i) => `<path d="M0 ${280 + i*64} Q260 ${270 + i*64} 520 ${284 + i*64}" stroke="#A8664A" stroke-width="10" fill="none" opacity=".35"/>`).join(""));
  const backRow = [30, 110, 400, 480].map((x, i) => macTree(x, 200, .9)).join("") + macTree(160, 140, .8) + macTree(370, 140, .8);
  const pack = place("bvtpack", 265, 242, 44, 10, "The packing shed", shed(205, 160, 120, 76, {wall: "#D9CBB0", roof: "#8A9098", sign: "PACKING", wins: [24, 96], door: "#5A3A2E"}) + sacks(310, 236), "Packing shed", 265, 266, "#FBE0B8");
  const tree = place("bvttrees", 260, 430, 40, 10, "A macadamia tree", macTree(260, 400, 1.15, "#3E86AE"), "Shake a tree", 260, 452, "#DCEBC8");
  const tarps = place("bvttarps", 120, 560, 34, 9, "The tarps and buckets", g(sk(`<rect x="90" y="530" width="50" height="12" rx="6" style="fill:#5E9E5A"/><rect x="96" y="518" width="44" height="12" rx="6" style="fill:#3E86AE"/><path d="M150 540 h14 l-2 -16 h-10z" style="fill:#F3C969"/>`, ``) + `<path d="M160 548 l20 -10 M176 538 l14 0 M176 538 v10" stroke="#5A4636" stroke-width="2"/><circle cx="182" cy="552" r="5" fill="#2F2B28"/>`), "Tarps", 120, 584, "#F6E3B4");
  return lampDefs + soil + backRow + pack + macTree(90, 360, 1, "#5E9E5A") + macTree(430, 360, 1) + macTree(420, 560, 1, "#5E9E5A") + tree + tarps + macTree(30, 640, .9) + macTree(500, 640, .9)
    + gate("bvtToShed", 504, 420, "The shed", 456, 450, "East, back to the cracking shed");
}
function shedScreen(){
  const yard = ground("#C98A6A", "#B87A5A") + g(`<path d="M0 0 H520 V150 H0z" fill="#9CB86A"/>`) + [40, 140, 380, 480].map(x => macTree(x, 140, .8)).join("");
  const crack = place("bvtcrack", 115, 248, 46, 10, "The cracking shed", shed(50, 160, 130, 90, {wall: "#B9BEC4", roof: "#8A9098", sign: "CRACKING SHED", wins: [104], door: "#5A4636", doorX: 65}) + sacks(160, 274) + g(`<path d="M70 150 q-6 -10 2 -16" stroke="#D9D2C8" stroke-width="3" fill="none" opacity=".6"/>`), "Cracking shed", 115, 296, "#FBE0B8");
  const cafe = place("bvtnutcafe", 405, 248, 46, 10, "The Nutwood café", shed(340, 166, 130, 84, {wall: "#F3EAD6", roof: "#7A3A2E", sign: "NUTWOOD CAFÉ", wins: [26, 104], door: "#5E8A4E", veranda: true}), "Café", 405, 272, "#DCEBC8");
  const limes = place("bvtlimes", 250, 410, 44, 10, "The finger lime hedge", g(sk(`<rect x="180" y="360" width="140" height="34" rx="14" style="fill:#4E7A48"/>`, `<rect x="180" y="360" width="140" height="34" rx="14"/>`) + Array.from({length: 12}, (_, i) => `<ellipse cx="${190 + i*11}" cy="${372 + (i % 3)*7}" rx="4.4" ry="1.8" fill="${i % 3 === 1 ? "#C9A0C0" : "#9CC45A"}" stroke="${C.ink}" stroke-width=".4"/>`).join("")), "Finger limes", 250, 432, "#DCEBC8");
  const track = redTrack("M390 640 Q390 560 300 500 Q200 460 16 420", 24);
  return lampDefs + yard + track + crack + cafe + limes + table(320, 300) + chair(290, 310, "#E8566C") + chair(350, 312, "#F3C969") + macTree(40, 560, .9) + macTree(500, 470, .8)
    + myVan("bvvan_nuts", 390, 560) + gate("bvtToGrove", 16, 420, "The grove", 60, 452, "West into the macadamia grove");
}

/* ---------- Kingsreef: the station (tg_station) and the main street (tg_street) ---------- */
function stationScreen(){
  const hills = g(`<rect width="520" height="110" fill="#E3EEF0"/><path d="M0 90 Q120 60 260 80 T520 70 V110 H0z" fill="#9CB86A"/>`);
  const platform = g(`<rect y="100" width="520" height="100" fill="#C9C2B0"/><rect y="200" width="520" height="20" fill="#7A6A5A"/><path d="M0 204 H520 M0 216 H520" stroke="#4A4A4A" stroke-width="2"/>${Array.from({length: 26}, (_, i) => `<rect x="${i*20 + 4}" y="201" width="6" height="18" fill="#5A4636"/>`).join("")}<rect y="220" width="520" height="18" fill="#D9CBB0"/><path d="M0 238 H520" stroke="#8A7A62" stroke-width="3"/>`);
  const ticket = place("bvtticket", 100, 250, 40, 10, "The ticket office museum", g(sk(`<rect x="40" y="120" width="120" height="76" style="fill:#F3E7C8"/><path d="M32 124 l20 -24 h96 l20 24z" style="fill:#B8443A"/><rect x="88" y="160" width="22" height="36" style="fill:#3E5A3A"/><rect x="54" y="140" width="22" height="18" style="fill:#9CC4D0"/><rect x="122" y="140" width="22" height="18" style="fill:#9CC4D0"/><circle cx="100" cy="112" r="7" style="fill:#FFFDF6"/>`, `<rect x="40" y="120" width="120" height="76"/><circle cx="100" cy="112" r="7"/>`) + `<path d="M100 112 v-4 M100 112 h3" stroke="${C.ink}" stroke-width="1"/>`), "Ticket office", 100, 272, "#FBE0B8");
  const train = place("bvttrain", 330, 260, 50, 12, "The steam train", g(sk(`<rect x="186" y="150" width="70" height="44" rx="6" style="fill:#3E6A4E"/><rect x="230" y="130" width="34" height="64" rx="4" style="fill:#2E5A3E"/><rect x="198" y="128" width="12" height="24" style="fill:#2F2B28"/><circle cx="270" cy="178" r="4" style="fill:#E3B04B"/>${[290, 360, 430].map(x => `<rect x="${x}" y="138" width="64" height="56" rx="4" style="fill:#A8443A"/><rect x="${x + 8}" y="148" width="14" height="14" rx="2" style="fill:#F3E7C8"/><rect x="${x + 30}" y="148" width="14" height="14" rx="2" style="fill:#F3E7C8"/>`).join("")}`,
    `<rect x="186" y="150" width="70" height="44" rx="6"/><rect x="230" y="130" width="34" height="64" rx="4"/>`) + [196, 218, 244, 300, 340, 370, 410, 440, 480].map(x => `<circle cx="${x}" cy="198" r="7" fill="#2F2B28"/><circle cx="${x}" cy="198" r="2.4" fill="#C9C2B0"/>`).join("")
    + `<g class="steam"><circle cx="204" cy="112" r="10" fill="#FFFFFF" opacity=".8"/><circle cx="196" cy="94" r="12" fill="#FFFFFF" opacity=".6"/><circle cx="210" cy="74" r="14" fill="#FFFFFF" opacity=".4"/></g>`), "Steam train", 330, 284, "#F6D3DC");
  const path = redTrack("M130 640 Q140 560 200 500 Q250 440 260 300", 22) + redTrack("M200 500 Q250 560 260 640", 20);
  const cottages = [[420, "#F3E3C3"], [470, "#C9DCC0"]].map(([x, col]) => g(sk(`<rect x="${x - 22}" y="460" width="44" height="34" style="fill:${col}"/><path d="M${x - 26} 462 l26 -18 l26 18z" style="fill:#B8443A"/>`, `<rect x="${x - 22}" y="460" width="44" height="34"/>`))).join("");
  return lampDefs + ground(C.grass, C.grass2) + hills + platform + ticket + train + path + cottages + lantern(30, 236) + lantern(490, 236) + rfTree(40, 420, .8, 0) + bush(330, 600) + flowers([[360, 360, "#F3D34A"], [180, 400, "#F4C7CF"]])
    + myVan("bvvan_gold", 130, 560) + gate("bvtToMainSt", 260, 612, "Main street", 320, 590, "Down the hill to the main street");
}
function goldStreetScreen(){
  const road = g(`<rect y="290" width="520" height="140" fill="#D9B48A"/><path d="M0 340 Q260 330 520 344 M0 390 Q260 380 520 394" stroke="#C49A6E" stroke-width="3" fill="none" opacity=".5"/><path d="M230 0 H290 V290 H230z" fill="#D9B48A"/>`);
  const pub = place("bvtpub", 120, 248, 50, 10, "The Royal Hotel", shed(40, 130, 160, 106, {wall: "#E8D4B0", roof: "#8A3A2E", sign: "ROYAL HOTEL", wins: [26, 64, 96, 134], door: "#3E3A2E", veranda: true})
    + g(`<path d="M38 176 H202" stroke="#4A4A4A" stroke-width="3"/>${Array.from({length: 16}, (_, i) => `<path d="M${42 + i*10} 176 q5 6 10 0" stroke="#4A4A4A" stroke-width="1" fill="none"/>`).join("")}<path d="M30 270 h60 M36 270 v-14 M84 270 v-14" stroke="${C.timber2}" stroke-width="3"/>`), "Royal Hotel", 120, 272, "#FBE0B8");
  const antique = place("bvtantique", 405, 248, 46, 10, "Nugget & Co. antiques", shed(340, 150, 130, 86, {wall: "#C9B8D9", roof: "#5A6A7A", sign: "NUGGET & CO.", wins: [26, 104], door: "#5A3A2E"}) + g(`<path d="M454 226 l8 -14 l8 14z M462 212 v-8" stroke="${C.ink}" stroke-width="1" fill="#C9785A"/>`), "Antiques", 405, 272, "#F6D3DC");
  const creek = g(sk(`<path d="M0 548 Q260 530 520 550 V640 H0z" style="fill:#7FA8A0"/>`, ``) + [[80, 590], [200, 600], [330, 584], [450, 610]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="6" fill="#B0A48A"/>`).join(""));
  const pan = place("bvtpanning", 300, 520, 40, 10, "The gold creek", g(`<ellipse cx="320" cy="540" rx="14" ry="5" fill="#8A7A6A" stroke="${C.ink}" stroke-width=".8"/><circle cx="322" cy="539" r="1.4" fill="#F3C969" class="twinkle"/><rect x="250" y="490" width="34" height="22" rx="2" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".8"/><text x="267" y="504" text-anchor="middle" font-size="6" font-weight="700" fill="${C.ink}">GOLD</text><path d="M267 512 v16" stroke="${C.timber2}" stroke-width="2"/>`), "Gold panning", 300, 546, "#F6E3B4");
  return lampDefs + ground("#C9CFA0", "#B9C48A") + road + pub + antique + creek + pan + lantern(220, 290) + lantern(300, 290) + bush(40, 480) + bush(480, 470, 1.1) + rfTree(500, 120, .8, 1)
    + gate("bvtToStation", 260, 300, "The station", 330, 300, "Up the hill to the station");
}

const SCREENS = {tf_top: topScreen, tf_pool: poolScreen, tk_shore: shoreScreen, tk_fig: figScreen, tr_street: streetScreen, tr_creek: creekScreen,
  td_paddock: paddockScreen, td_yard: yardScreen, tm_grove: groveScreen, tm_shed: shedScreen, tg_station: stationScreen, tg_street: goldStreetScreen};
export const tablelandsArt = scene => (SCREENS[scene] || topScreen)();
