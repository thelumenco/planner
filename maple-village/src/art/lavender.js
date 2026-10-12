// Bellbird Valley's Lavender Hills (round 161): twelve screens inspired by Provence. Warm limestone and honey-coloured
// walls, terracotta roofs, blue shutters, dark cypresses, grey-green olives and wild thyme, long purple stripes of
// lavender, sunflowers, a green river under an old stone bridge, and a golden evening light (a sunset on Chapel Hill).
// Calm on purpose: detail round the edges, a clear middle. The places are in data/lavender.js.
import { sgHM } from "../util.js";
import { sk } from "./scenes.js";
import { lampDefs } from "./village-extras.js";
import { paperOwned } from "./paperie-room.js";
import { bbPlace as place, bbGate as gate, bbShed as shed, bbFence as fence, bbVan as myVan, bbChair as chair, bbTable as table, bbFlowers as flowers } from "./bellbird-vines.js";

const C = {lav: "#9A7CC8", lav2: "#B79BDC", lav3: "#7E62B0", stone: "#E8D9B8", stone2: "#D9C49A", terra: "#C8643B", shutter: "#7FA8C8", cypress: "#3E5A3A", olive: "#9AA88A", dry: "#D9CC8A",
  dry2: "#CBBE7A", sun: "#F3C93A", sun2: "#C88A2A", river: "#6E9E8A", river2: "#8CB8A4", ink: "#2F2B28", cobble: "#D6C8A8"};
const g = s => `<g pointer-events="none">${s}</g>`;
const evening = () => sgHM() >= 17*60 + 30;
const ground = (col = C.dry, col2 = C.dry2) => `<rect width="520" height="640" style="fill:${col}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="140" cy="460" rx="170" ry="90" style="fill:${col2}"/><ellipse cx="400" cy="560" rx="150" ry="70" style="fill:${col2}"/></g>`;
const lane = (d, w = 26, a = "#E8DCC0", b = "#D2C29E") => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${b}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${a}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const hills = (sky = "#E8EEF2", far = "#C9C4A0") => g(`<rect width="520" height="170" fill="${evening() ? "#F6C98A" : sky}"/>${evening() ? `<circle cx="400" cy="90" r="26" fill="#F39A4A" opacity=".85"/>` : ""}<path d="M0 120 Q100 86 210 104 T420 92 T520 100 V170 H0z" fill="${far}"/><path d="M0 146 Q130 120 260 134 T520 128 V170 H0z" fill="#B9B98A"/>`);
const cypress = (x, y, s = 1) => g(sk(`<path d="M${x} ${y} q${-12*s} ${-30*s} ${-6*s} ${-70*s} q${4*s} ${-20*s} ${6*s} ${-26*s} q${4*s} ${8*s} ${7*s} ${26*s} q${6*s} ${40*s} ${-7*s} ${70*s}z" style="fill:${C.cypress}"/>`, `<path d="M${x} ${y} q${-12*s} ${-30*s} ${-6*s} ${-70*s}"/>`));
const olive = (x, y, s = 1) => g(sk(`<path d="M${x - 3*s} ${y} q${-4*s} ${-20*s} ${2*s} ${-30*s} l${4*s} 0 q${2*s} ${14*s} ${2*s} ${30*s}z" style="fill:#7A6A5A"/>`, ``) + [[-16, -36, 18], [12, -40, 18], [-2, -50, 16]].map(([dx, dy, r]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*.7*s}" fill="${C.olive}"/>`).join(""));
const plane = (x, y, s = 1) => g(sk(`<path d="M${x - 6*s} ${y} q${-2*s} ${-40*s} ${3*s} ${-80*s} l${7*s} 0 q${3*s} ${40*s} ${4*s} ${80*s}z" style="fill:#C9C0A8"/>${[[-2, -30], [3, -50], [-1, -66]].map(([dx, dy]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${3*s}" ry="${5*s}" style="fill:#8A9A7A"/>`).join("")}`, ``)
  + [[-30, -96, 32], [24, -104, 34], [-2, -124, 30], [34, -82, 22], [-38, -78, 22]].map(([dx, dy, r], k) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*.7*s}" fill="${k % 2 ? "#8AAE6A" : "#9CBC7A"}" opacity=".95"/>`).join(""));
const lavRow = (x1, x2, y, s = 1) => g(Array.from({length: Math.floor((x2 - x1)/24)}, (_, i) => `<ellipse cx="${x1 + 12 + i*24}" cy="${y}" rx="${13*s}" ry="${9*s}" fill="${i % 3 ? C.lav : C.lav2}"/><ellipse cx="${x1 + 10 + i*24}" cy="${y - 5*s}" rx="${7*s}" ry="${4*s}" fill="${C.lav3}" opacity=".6"/>`).join(""));
const sunflower = (x, y, s = 1) => g(`<path d="M${x} ${y} v${-34*s}" stroke="#5E8A3A" stroke-width="${2.4*s}"/><ellipse cx="${x - 6*s}" cy="${y - 16*s}" rx="${6*s}" ry="${3*s}" fill="#6E9A4A"/>` + Array.from({length: 10}, (_, i) => { const a = i*36*Math.PI/180; return `<ellipse cx="${x + Math.cos(a)*7*s}" cy="${y - 40*s + Math.sin(a)*7*s}" rx="${4*s}" ry="${2.2*s}" transform="rotate(${i*36} ${x + Math.cos(a)*7*s} ${y - 40*s + Math.sin(a)*7*s})" fill="${C.sun}"/>`; }).join("") + `<circle cx="${x}" cy="${y - 40*s}" r="${5*s}" fill="#6A4A2A"/>`);
// a stone house: warm walls, a terracotta roof, blue shutters either side of the windows
function stoneHouse(x, y, w, h, o = {}){
  const wall = o.wall || C.stone, roof = o.roof || C.terra, sh = o.shutter || C.shutter, dx = o.doorX != null ? o.doorX : w/2;
  const wins = (o.wins || []).map(wx => `<rect x="${x + wx - 8}" y="${y + 16}" width="16" height="18" rx="1" style="fill:#9CC4D0"/><rect x="${x + wx - 15}" y="${y + 15}" width="6" height="20" style="fill:${sh}"/><rect x="${x + wx + 9}" y="${y + 15}" width="6" height="20" style="fill:${sh}"/>`).join("");
  return `<g pointer-events="none"><path d="M${x + w} ${y + 6} l10 7 V${y + h + 7} H${x + 10} l-10 -7z" style="fill:#6F7C5C" opacity=".16"/></g>` + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${wall}"/>${Array.from({length: 6}, (_, i) => `<rect x="${x + 8 + (i*37) % (w - 24)}" y="${y + 40 + (i*13) % (h - 50)}" width="14" height="6" rx="2" style="fill:${C.stone2}"/>`).join("")}<path d="M${x - 8} ${y + 2} L${x + w/2} ${y - (o.roofH || 20)} L${x + w + 8} ${y + 2}z" style="fill:${roof}"/>${wins}<rect x="${x + dx - 11}" y="${y + h - 28}" width="22" height="28" rx="${o.arch ? 11 : 2}" style="fill:${o.door || C.shutter}"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x - 8} ${y + 2} L${x + w/2} ${y - (o.roofH || 20)} L${x + w + 8} ${y + 2}z"/><rect x="${x + dx - 11}" y="${y + h - 28}" width="22" height="28" rx="${o.arch ? 11 : 2}"/>`)
    + (o.sign ? `<rect x="${x + w/2 - o.sign.length*3.1 - 6}" y="${y + 2}" width="${o.sign.length*6.2 + 12}" height="13" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x + w/2}" y="${y + 11.4}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}" pointer-events="none">${o.sign}</text>` : "");
}
const awning = (x, y, w, a, b = "#FFFDF6") => g(sk(`<path d="M${x} ${y} h${w} l-6 14 h${-w + 12}z" style="fill:${a}"/>${Array.from({length: Math.floor(w/14)}, (_, i) => i % 2 ? `<path d="M${x + i*14} ${y} h14 l-1 14 h-14z" style="fill:${b}"/>` : "").join("")}`, `<path d="M${x} ${y} h${w} l-6 14 h${-w + 12}z"/>`));
const rosebush = (x, y, col = "#E8A0B4", s = 1) => g(`<ellipse cx="${x}" cy="${y}" rx="${18*s}" ry="${12*s}" fill="#5E7A4E"/>${[[-8, -4], [6, -8], [10, 2], [-4, 4], [0, -10]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${3.4*s}" fill="${col}" stroke="${C.ink}" stroke-width=".4"/>`).join("")}`);
const goat = (x, y, flip = 1, col = "#F3EAD6") => g(sk(`<ellipse cx="${x}" cy="${y - 10}" rx="12" ry="7" style="fill:${col}"/><ellipse cx="${x + flip*13}" cy="${y - 16}" rx="5" ry="4" style="fill:${col}"/><path d="M${x + flip*12} ${y - 20} l${flip*-2} -6 M${x + flip*15} ${y - 20} l${flip*2} -6" style="stroke:#8A7A62" stroke-width="1.4"/>`, `<ellipse cx="${x}" cy="${y - 10}" rx="12" ry="7"/>`) + `<path d="M${x - 8} ${y - 4} v6 M${x - 2} ${y - 3} v6 M${x + 4} ${y - 3} v6 M${x + 9} ${y - 4} v6" stroke="${C.ink}" stroke-width="1.3"/><circle cx="${x + flip*10}" cy="${y - 11}" r="1.6" fill="#E3B04B"/>`);
const hive = (x, y, col) => g(sk(`<rect x="${x - 12}" y="${y - 26}" width="24" height="24" rx="2" style="fill:${col}"/><path d="M${x - 15} ${y - 26} h30 l-3 -6 h-24z" style="fill:#8A6A52"/><rect x="${x - 6}" y="${y - 6}" width="12" height="3" style="fill:#3A3430"/>`, `<rect x="${x - 12}" y="${y - 26}" width="24" height="24" rx="2"/>`) + `<circle cx="${x + 10}" cy="${y - 32}" r="1.4" fill="#3A3430"/><circle cx="${x - 8}" cy="${y - 36}" r="1.4" fill="#3A3430"/>`);
const thyme = (x, y) => g(`<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#A8B098"/>${[[-5, -2], [3, -4], [6, 1]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.4" fill="#C9A2DC"/>`).join("")}`);

/* ---------- Lavender Ridge ---------- */
function rowsScreen(){
  const rows = [250, 300, 350, 400, 450, 500, 550, 600].map((y, i) => lavRow(i % 2 ? -10 : 6, 530, y, .95)).join("");
  const field = place("bvhrows", 260, 430, 50, 12, "The lavender rows", "", "Lavender rows", 260, 454, "#E6DCF3");
  const bench = place("bvhbench", 400, 300, 30, 9, "The bench at the top", g(sk(`<rect x="364" y="270" width="72" height="8" rx="2" style="fill:#B98A5E"/><rect x="364" y="258" width="72" height="6" rx="2" style="fill:#B98A5E"/><path d="M370 278 v14 M430 278 v14" style="stroke:#6B5444" stroke-width="2.4"/>`, `<rect x="364" y="258" width="72" height="20"/>`)), "Bench", 400, 318, "#F6E3B4");
  const path = lane("M150 640 Q170 560 240 520 Q290 480 300 640", 24);
  return lampDefs + ground("#C9BE8A", "#BCB27A") + hills() + rows + path + cypress(40, 250, 1) + cypress(70, 260, .8) + cypress(490, 250, 1) + olive(470, 640, .9) + bench + field
    + myVan("bvvan_lavender", 150, 560) + gate("bvhToStill", 300, 612, "The farmyard", 360, 590, "Down the lane to the still and the shop");
}
function stillScreen(){
  const fields = g(`<path d="M0 0 H220 V140 H0z M300 0 H520 V140 H300z" fill="#C9BE8A"/>`) + lavRow(0, 220, 40) + lavRow(0, 220, 80) + lavRow(0, 220, 120) + lavRow(300, 520, 40) + lavRow(300, 520, 80) + lavRow(300, 520, 120);
  const path = lane("M260 0 Q262 120 260 200 Q250 320 230 420 Q200 520 130 580", 30);
  const still = place("bvhstill", 105, 248, 46, 10, "The distillery", stoneHouse(40, 166, 130, 84, {wins: [30], door: "#8A5A3A", sign: "DISTILLERY", doorX: 80}) + g(sk(`<rect x="146" y="110" width="14" height="60" style="fill:#C9784A"/><ellipse cx="153" cy="110" rx="9" ry="4" style="fill:#D98A5A"/>`, `<rect x="146" y="110" width="14" height="60"/>`) + `<path d="M153 104 q-8 -12 2 -20 q10 -8 0 -18" fill="none" stroke="#E6DCF3" stroke-width="5" opacity=".75" stroke-linecap="round"/>`), "Distillery", 105, 272, "#E6DCF3");
  const shop = place("bvhshop", 415, 248, 46, 10, "The farm shop", stoneHouse(350, 166, 130, 84, {wins: [30, 100], sign: "FARM SHOP"}) + g([362, 378, 394, 446, 462].map(x => `<path d="M${x} 166 v12" stroke="#5E7A4E" stroke-width="2"/><ellipse cx="${x}" cy="181" rx="3" ry="5" fill="${C.lav}"/>`).join("")), "Farm shop", 415, 272, "#E6DCF3");
  const tea = place("bvhtea", 410, 522, 44, 10, "The tea room", stoneHouse(350, 440, 120, 80, {wins: [26, 94], door: "#8A9A6A", sign: "TEA ROOM"}) + g(`<path d="M346 446 q30 -20 64 -6 q30 -16 64 4" stroke="#6E8A4E" stroke-width="4" fill="none"/>`), "Tea room", 410, 546, "#F6E3B4");
  return lampDefs + ground() + fields + path + still + shop + tea + table(300, 470) + chair(270, 480, C.shutter) + chair(330, 482, C.shutter) + cypress(200, 400, .8) + olive(60, 420, .9) + flowers([[200, 330, C.lav], [320, 380, "#FFFDF6"]])
    + gate("bvhToRows", 260, 26, "The rows", 320, 50, "Up the lane to the lavender rows");
}

/* ---------- Montrose ---------- */
function squareScreen(){
  const cobbles = g(`<rect y="240" width="520" height="400" fill="${C.cobble}"/>${Array.from({length: 60}, (_, i) => `<ellipse cx="${(i*83) % 520}" cy="${260 + ((i*47) % 370)}" rx="9" ry="5" fill="none" stroke="#C4B48E" stroke-width="1"/>`).join("")}`);
  const boul = place("bvhboul", 110, 248, 46, 10, "La Boulangerie", stoneHouse(50, 166, 120, 84, {wins: [26, 96], door: "#3E6B8C", sign: "BOULANGERIE", shutter: "#3E6B8C"}), "Boulangerie", 110, 272, "#C3DDF3");
  const nougat = place("bvhnougat", 260, 248, 46, 10, "The nougat shop", stoneHouse(200, 166, 120, 84, {wins: [26, 96], door: "#C8643B", sign: "NOUGAT", wall: "#F3E3C3"}) + awning(196, 196, 128, "#C8643B"), "Nougat", 260, 272, "#FBE0B8");
  const cafe = place("bvhcafe", 410, 248, 46, 10, "Café de la Place", stoneHouse(350, 166, 120, 84, {wins: [26, 96], door: "#5E7A4E", sign: "CAFÉ", shutter: "#5E7A4E"}) + table(380, 300, 40) + table(440, 300, 40), "Café", 410, 272, "#DCEBC8");
  const fountain = place("bvhfountain", 260, 476, 40, 10, "The fountain", g(sk(`<ellipse cx="260" cy="448" rx="38" ry="16" style="fill:#B9AE9A"/><ellipse cx="260" cy="444" rx="30" ry="11" style="fill:#7FB8C8"/><rect x="254" y="412" width="12" height="32" style="fill:#B9AE9A"/><path d="M252 414 q8 -12 16 0z" style="fill:#9AA88A"/>`, `<ellipse cx="260" cy="448" rx="38" ry="16"/>`) + `<path d="M260 410 q-12 8 -16 30 M260 410 q12 8 16 30" fill="none" stroke="#CFE8F0" stroke-width="2"/>`), "Fountain", 260, 498, "#C3DDF3");
  const piste = place("bvhpiste", 400, 540, 40, 10, "The pétanque piste", g(`<rect x="350" y="496" width="110" height="28" rx="4" fill="#E8DCC0" stroke="#C4B48E"/>${[[372, 510], [392, 506], [420, 514], [440, 508]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#9AA0A8" stroke="${C.ink}" stroke-width=".5"/>`).join("")}<circle cx="430" cy="504" r="1.6" fill="#E8566C"/>`), "Pétanque", 400, 562, "#F6E3B4");
  return lampDefs + `<rect width="520" height="640" fill="${C.cobble}"/>` + hills() + cobbles + boul + nougat + cafe + plane(40, 600, .9) + plane(480, 420, 1) + plane(140, 400, .8) + fountain + piste
    + myVan("bvvan_hilltown", 130, 560) + gate("bvhToLanes", 504, 400, "The lanes", 456, 430, "Up into the lanes");
}
function lanesScreen(){
  const fronts = [[30, "#F3E3C3", "#C8643B"], [130, "#E8D9B8", "#3E6B8C"], [460, "#E8D9B8", "#E8A0B4"]].map(([x, wall, door]) => stoneHouse(x, 130, 70, 100, {wall, door, wins: [35], arch: true, doorX: 35})).join("")
    // round 183: the shop with the green door: À VENDRE, then Mel's paperie, with sheets in the window
    + place("bvhpaper", 415, 252, 40, 10, "The paperie", stoneHouse(380, 130, 70, 100, {wall: "#F3D9C0", door: "#5E7A4E", wins: [35], arch: true, doorX: 35, sign: paperOwned() ? "PAPETERIE" : "À VENDRE"})
      + (paperOwned() ? g(`<rect x="366" y="160" width="10" height="13" fill="#F2C4C4" stroke="#3a2e28" stroke-width=".5"/><rect x="368" y="176" width="10" height="13" fill="#C6D6B2" stroke="#3a2e28" stroke-width=".5"/>`) : ""));
  const ramparts = place("bvhramparts", 300, 262, 46, 10, "The ramparts", g(sk(`<rect x="240" y="200" width="120" height="50" style="fill:#D9C49A"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${242 + i*24}" y="188" width="14" height="14" style="fill:#D9C49A"/>`).join("")}`, `<rect x="240" y="200" width="120" height="50"/>`) + `<path d="M240 220 h120 M240 236 h120" stroke="#C4B48E" stroke-width="1.4"/>`), "Ramparts", 300, 284, "#F6E3B4");
  const lavoir = place("bvhlavoir", 140, 440, 40, 10, "The old washhouse", g(sk(`<rect x="94" y="400" width="92" height="28" rx="3" style="fill:#B9AE9A"/><rect x="100" y="404" width="80" height="16" style="fill:#7FB8C8"/><path d="M86 400 l54 -24 l54 24z" style="fill:${C.terra}"/><path d="M96 400 v-14 M184 400 v-14" style="stroke:#8A7A62" stroke-width="4"/>`, `<rect x="94" y="400" width="92" height="28" rx="3"/>`)), "Washhouse", 140, 462, "#C3DDF3");
  const steps = g(Array.from({length: 8}, (_, i) => `<rect x="${250 + i*4}" y="${560 - i*36}" width="70" height="8" rx="2" fill="#D9C49A" stroke="#C4B48E"/>`).join(""));
  return lampDefs + `<rect width="520" height="640" fill="${C.cobble}"/>` + hills() + fronts + ramparts + lane("M16 400 Q140 420 260 380 Q330 330 300 270", 40, "#E8DCC0", "#D2C29E") + steps + lavoir + cypress(470, 400, .9) + rosebush(60, 560) + rosebush(470, 560, "#F4C7CF")
    + flowers([[220, 470, "#E8566C"], [380, 480, C.lav]]) + gate("bvhToSquare", 16, 400, "The square", 60, 430, "Back down to the square");
}

/* ---------- Rosehill ---------- */
function perfumeStreetScreen(){
  const walls = g(`<path d="M0 0 H220 V140 H0z M300 0 H520 V140 H300z" fill="#E8D9B8"/>`) + [40, 100, 160, 360, 420, 480].map((x, i) => rosebush(x, 120 + (i % 2)*12, i % 2 ? "#E8A0B4" : "#F4C7CF", 1.1)).join("");
  const steps = g(Array.from({length: 6}, (_, i) => `<rect x="224" y="${20 + i*22}" width="72" height="8" rx="2" fill="#D9C49A" stroke="#C4B48E"/>`).join(""));
  const perf = place("bvhperfume", 105, 248, 46, 10, "The perfumery", stoneHouse(40, 160, 130, 90, {wins: [30, 100], door: "#7A5AA8", sign: "PARFUMERIE", shutter: "#B79BDC"}) + g([[54, 184], [62, 184], [124, 184], [132, 184]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="5" height="9" rx="1.4" fill="${["#E8A0B4", "#F3C969", "#B79BDC", "#9FD3C2"][i]}"/>`).join("")), "Perfumery", 105, 272, "#E6DCF3");
  const savon = place("bvhsavon", 415, 248, 46, 10, "The soap maker", stoneHouse(350, 166, 130, 84, {wins: [30, 100], sign: "SAVONNERIE", wall: "#F3E3C3"}) + g([0, 1, 2].map(i => `<rect x="${396 + i*12}" y="${226 - i*2}" width="10" height="6" fill="${["#F4C7CF", "#B79BDC", "#F3E7B0"][i]}" stroke="${C.ink}" stroke-width=".5"/>`).join("")), "Soap maker", 415, 272, "#F6D3DC");
  const glass = place("bvhglass", 410, 522, 44, 10, "The glassblower", stoneHouse(350, 440, 120, 80, {wins: [26], door: "#3A3430", sign: "VERRERIE", doorX: 80}) + g(`<rect x="420" y="490" width="22" height="30" fill="#F39A4A" opacity=".8"/><circle cx="378" cy="476" r="6" fill="#9FD3C2" opacity=".8"/>`), "Glassblower", 410, 546, "#FBE0B8");
  return lampDefs + `<rect width="520" height="640" fill="${C.cobble}"/>` + walls + steps + lane("M260 150 Q250 320 230 420 Q200 520 130 580", 30, "#E8DCC0", "#D2C29E") + perf + savon + glass + cypress(200, 420, .7) + plane(40, 640, .8) + flowers([[260, 330, "#E8A0B4"], [320, 400, C.lav]])
    + myVan("bvvan_perfume", 130, 560) + gate("bvhToGarden", 260, 26, "The garden", 320, 50, "Up the steps to the perfumer's garden");
}
function gardenScreen(){
  const wall = g(`<rect width="520" height="240" fill="#E3EEF0"/><rect y="150" width="520" height="90" fill="#E8D9B8"/>${Array.from({length: 14}, (_, i) => `<rect x="${i*40 + 6}" y="${160 + (i % 3)*20}" width="18" height="7" rx="2" fill="${C.stone2}"/>`).join("")}`) + cypress(60, 240, 1.1) + cypress(460, 240, 1.1) + cypress(100, 236, .8);
  const roses = place("bvhroses", 200, 396, 50, 10, "The rose beds", g(`<rect x="130" y="340" width="140" height="46" rx="8" fill="#8A6A52"/>`) + rosebush(160, 360, "#E8A0B4") + rosebush(200, 352, "#C2334D") + rosebush(240, 362, "#F4C7CF"), "Roses", 200, 418, "#F6D3DC");
  const jas = place("bvhjasmine", 390, 416, 50, 10, "The jasmine walk", g(sk(`<path d="M320 406 V350 Q390 316 460 350 V406" style="fill:none;stroke:#6B5444" stroke-width="4"/>`, ``) + `<path d="M320 352 Q390 318 460 352" stroke="#5E7A4E" stroke-width="12" fill="none"/>${Array.from({length: 12}, (_, i) => `<circle cx="${326 + i*11}" cy="${350 - Math.sin(i/11*Math.PI)*30}" r="2.2" fill="#FFFDF6"/>`).join("")}`), "Jasmine", 390, 438, "#DCEBC8");
  const beds = [[90, 520, "#FFFDF6"], [200, 560, "#E8A0B4"], [330, 540, C.lav], [440, 560, "#F3C969"]].map(([x, y, c]) => rosebush(x, y, c, 1.2)).join("");
  return lampDefs + ground("#B9C48A", "#A8B47A") + wall + lane("M260 640 Q260 520 270 460 Q280 380 260 300", 24, "#E8DCC0", "#D2C29E") + roses + jas + beds
    + gate("bvhToStreet", 260, 612, "The street", 320, 590, "Down the steps to the street");
}

/* ---------- Sunflower Hill ---------- */
function hivesScreen(){
  const top = g(`<path d="M0 0 H520 V150 H0z" fill="#B9C48A"/>`) + Array.from({length: 18}, (_, i) => sunflower(16 + i*30, 140 - (i % 3)*14, .9)).join("");
  const honey = place("bvhhoney", 115, 248, 46, 10, "The honey house", stoneHouse(50, 160, 130, 90, {wins: [30, 100], door: "#C88A2A", sign: "HONEY HOUSE"}) + g(`<ellipse cx="115" cy="152" rx="6" ry="4" fill="${C.sun}" stroke="${C.ink}" stroke-width=".6"/><path d="M111 152 h8" stroke="${C.ink}" stroke-width="1.4"/>`), "Honey house", 115, 272, "#FBE0B8");
  const candle = place("bvhcandle", 405, 248, 46, 10, "The candle shop", stoneHouse(340, 166, 130, 84, {wins: [30, 100], sign: "CANDLES", wall: "#F3E3C3", shutter: "#C88A2A"}), "Candles", 405, 272, "#F6E3B4");
  const hives = place("bvhhives", 250, 410, 50, 10, "The hives", ["#7FA8C8", "#F3C969", "#9CC45A", "#F4A0B4", "#B79BDC"].map((c, i) => hive(198 + i*26, 392, c)).join(""), "The hives", 250, 432, "#FBE0B8");
  return lampDefs + ground() + top + lane("M390 640 Q390 560 300 500 Q200 460 16 420", 24) + honey + candle + hives + olive(60, 560, .9) + sunflower(470, 480, 1.2) + sunflower(490, 500, 1.1)
    + myVan("bvvan_honey", 390, 560) + gate("bvhToFields", 16, 420, "The fields", 60, 452, "West into the sunflower fields");
}
function fieldsScreen(){
  const field = Array.from({length: 60}, (_, i) => { const x = 10 + (i*53) % 510, y = 270 + Math.floor(i/12)*80 + (i*17) % 30; return (x > 170 && x < 350 && y > 330 && y < 460) || (x > 430 && y > 380 && y < 460) ? "" : sunflower(x, y, 1); }).join("");
  const maze = place("bvhmaze", 260, 430, 50, 12, "The sunflower maze", g(`<rect x="190" y="360" width="140" height="60" rx="30" fill="#9CB86A"/>`) + [196, 216, 236, 284, 304, 324].map(x => sunflower(x, 380, .8)).join("") + [196, 324].map(x => sunflower(x, 412, .8)).join("") + g(`<rect x="248" y="396" width="24" height="6" rx="2" fill="#B98A5E"/>`), "The maze", 260, 452, "#FBE0B8");
  const farm = place("bvhkitchen", 265, 242, 46, 10, "The farmhouse kitchen", stoneHouse(205, 156, 120, 80, {wins: [26, 94], door: "#5E7A4E", shutter: "#5E7A4E", sign: "FARMHOUSE"}), "Farmhouse", 265, 266, "#DCEBC8");
  return lampDefs + ground("#B9C48A", "#A8B47A") + hills() + farm + field + maze + gate("bvhToHives", 504, 420, "The hives", 456, 450, "East, back to the hives");
}

/* ---------- The Old Bridge ---------- */
function bridgeScreen(){
  const river = g(sk(`<path d="M0 120 Q260 100 520 124 V236 Q260 222 0 240z" style="fill:${C.river}"/>`, ``) + `<path d="M40 170 q20 -4 40 0 M220 190 q20 -4 40 0 M400 160 q20 -4 40 0" stroke="${C.river2}" stroke-width="3" fill="none"/>`);
  const br = place("bvhbridge", 260, 252, 46, 10, "The old bridge", g(sk(`<path d="M180 250 Q260 100 340 250z" style="fill:#B9AE9A"/><path d="M212 240 Q260 150 308 240z" style="fill:${C.river}"/>`, `<path d="M180 250 Q260 100 340 250"/>`) + `<path d="M186 238 Q260 110 334 238" stroke="#D9CCB0" stroke-width="5" fill="none"/>${Array.from({length: 10}, (_, i) => `<path d="M${198 + i*13} ${236 - Math.sin(i/9*Math.PI)*90} v6" stroke="#8A7A62" stroke-width="1"/>`).join("")}`), "The old bridge", 260, 276, "#C3DDF3");
  const willow = place("bvhwillow", 420, 420, 40, 10, "The willow and the swing", g(sk(`<path d="M416 400 q-4 -40 4 -90 l8 0 q4 50 2 90z" style="fill:#8A7A62"/>`, ``) + `<ellipse cx="420" cy="300" rx="60" ry="40" fill="#9CB86A"/>${Array.from({length: 14}, (_, i) => `<path d="M${370 + i*8} ${300} q2 50 ${(i % 2 ? 4 : -4)} ${80 + (i % 3)*10}" stroke="#8AAE6A" stroke-width="2" fill="none"/>`).join("")}<path d="M396 316 v60 M412 316 v60" stroke="#8A7A62" stroke-width="1.4"/><rect x="392" y="374" width="24" height="5" fill="#C9785A"/>`), "Willow swing", 420, 444, "#DCEBC8");
  return lampDefs + ground("#B9C48A", "#A8B47A") + g(`<rect width="520" height="130" fill="#C9D4A8"/>`) + river + br + lane("M130 640 Q160 560 240 520 Q360 480 504 480", 24) + lane("M240 520 Q250 380 260 260", 18)
    + willow + plane(60, 360, .9) + cypress(30, 560, .8) + flowers([[200, 440, "#E8566C"], [320, 560, "#E8566C"], [100, 480, "#FFFDF6"]]) + myVan("bvvan_bridge", 130, 560) + gate("bvhToBank", 504, 480, "The riverbank", 456, 448, "East along the riverbank");
}
function bankScreen(){
  const epi = place("bvhepicerie", 110, 248, 46, 10, "L'Épicerie", stoneHouse(50, 166, 120, 84, {wins: [26, 96], sign: "ÉPICERIE"}) + awning(46, 196, 128, "#5E7A4E"), "Épicerie", 110, 272, "#DCEBC8");
  const glace = place("bvhglace", 260, 248, 46, 10, "Glacier du Pont", stoneHouse(200, 166, 120, 84, {wins: [26, 96], wall: "#CFE3EA", door: "#E8A0B4", sign: "GLACIER"}) + g(`<path d="M320 180 l-6 14 h12z" fill="#E3B04B"/><circle cx="320" cy="176" r="6" fill="#E8A0B4"/>`), "Ice cream", 260, 272, "#F6D3DC");
  const mill = place("bvhmill", 410, 248, 46, 10, "Le Vieux Moulin", stoneHouse(350, 156, 120, 94, {wins: [26, 96], sign: "LE VIEUX MOULIN", roofH: 26}) + g(`<rect x="470" y="150" width="50" height="110" fill="${C.river}"/>`) + g(`<g class="tlspin"><circle cx="482" cy="206" r="30" fill="none" stroke="#8A6A52" stroke-width="5"/>${[0, 45, 90, 135].map(a => `<path d="M${482 - 30*Math.cos(a*Math.PI/180)} ${206 - 30*Math.sin(a*Math.PI/180)} L${482 + 30*Math.cos(a*Math.PI/180)} ${206 + 30*Math.sin(a*Math.PI/180)}" stroke="#8A6A52" stroke-width="3"/>`).join("")}</g>`), "Old mill", 410, 272, "#F6E3B4");
  const meadow = place("bvhmeadow", 300, 470, 40, 10, "The meadow", g(`<rect x="250" y="420" width="100" height="40" rx="3" fill="#F3E3E8" stroke="${C.ink}" stroke-width=".8"/>${Array.from({length: 5}, (_, i) => `<path d="M${250 + i*20} 420 v40 M250 ${428 + i*8} h100" stroke="#E8566C" stroke-width="1" opacity=".6"/>`).join("")}<path d="M330 430 h14 l-2 14 h-10z" fill="#C9A06A" stroke="${C.ink}" stroke-width=".6"/>`), "Picnic meadow", 300, 492, "#DCEBC8");
  const poppies = flowers([[120, 360, "#E8566C"], [180, 520, "#E8566C"], [420, 380, "#E8566C"], [460, 520, "#E8566C"], [80, 560, "#FFFDF6"], [380, 580, "#E8566C"]]);
  const river = g(sk(`<path d="M0 600 Q260 580 520 600 V640 H0z" style="fill:${C.river}"/>`, ``));
  return lampDefs + ground("#B9C48A", "#A8B47A") + g(`<rect width="520" height="160" fill="#C9D4A8"/>`) + epi + glace + mill + river + meadow + poppies + plane(40, 460, .8) + gate("bvhToBridge", 16, 480, "The bridge", 60, 448, "West, back to the bridge");
}

/* ---------- Chapel Hill ---------- */
function goatsScreen(){
  const hill = g(`<path d="M0 0 H520 V160 Q400 140 260 150 Q120 160 0 140z" fill="${evening() ? "#F6C98A" : "#E3EEF0"}"/><path d="M0 140 Q120 120 260 130 Q400 120 520 140 V170 H0z" fill="#B9B98A"/>`) + cypress(470, 140, .8) + g(`<path d="M440 100 l20 -16 l20 16 v20 h-40z" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".8"/>`);
  const fromage = place("bvhfromage", 110, 248, 46, 10, "The fromagerie", stoneHouse(50, 166, 120, 84, {wins: [26, 96], sign: "FROMAGERIE", door: "#8A9A6A"}), "Fromagerie", 110, 272, "#DCEBC8");
  const bistro = place("bvhbistro", 410, 248, 46, 10, "The farm bistro", stoneHouse(350, 166, 120, 84, {wins: [26, 96], sign: "BISTRO", door: "#C8643B"}) + g(`<path d="M340 166 h140" stroke="#6E8A4E" stroke-width="6"/>${[350, 380, 410, 440, 470].map(x => `<circle cx="${x}" cy="172" r="3" fill="#F3E3A0"/>`).join("")}`), "Bistro", 410, 272, "#FBE0B8");
  const goats = place("bvhgoats", 260, 430, 50, 12, "The goats", g(`<rect x="190" y="350" width="140" height="60" rx="6" fill="#C9C49A" opacity=".7"/>`) + goat(220, 396, 1) + goat(260, 380, -1, "#B98A5E") + goat(300, 398, 1) + goat(240, 404, -1, "#FFFDF6") + fence(190, 330, 412) + fence(190, 330, 352), "The goats", 260, 452, "#F6E3B4");
  return lampDefs + ground("#C9C49A", "#B9B48A") + hill + lane("M130 640 Q170 560 260 500 Q360 450 504 420", 26, "#F2EDE2", "#DCD4C2") + fromage + bistro + goats + [80, 160, 360, 460, 420, 60].map((x, i) => thyme(x, 330 + (i*53) % 260)).join("") + olive(40, 640, .9)
    + myVan("bvvan_chapel", 130, 560) + gate("bvhToChapel", 504, 420, "The chapel", 456, 450, "East, up the hill to the chapel");
}
function chapelScreen(){
  const ev = evening();
  const sky = g(`<rect width="520" height="260" fill="${ev ? "#F3B87A" : "#E3EEF0"}"/>${ev ? `<rect y="120" width="520" height="140" fill="#F39A6A" opacity=".5"/><circle cx="420" cy="200" r="34" fill="#F36A3A" opacity=".85"/>` : `<ellipse cx="120" cy="60" rx="40" ry="12" fill="#FFFFFF"/>`}<path d="M0 230 Q130 200 260 216 T520 210 V260 H0z" fill="${ev ? "#9A7CC8" : "#B9B98A"}" opacity=".85"/>`);
  const chapel = place("bvhchapel", 260, 252, 46, 10, "The chapel of Saint Anne", g(sk(`<rect x="200" y="140" width="120" height="104" style="fill:#F6F1E6"/><path d="M190 142 L260 104 L330 142z" style="fill:${C.terra}"/><rect x="246" y="76" width="28" height="36" style="fill:#F6F1E6"/><path d="M242 78 L260 62 L278 78z" style="fill:${C.terra}"/><rect x="249" y="208" width="22" height="36" rx="11" style="fill:#8A7A62"/><circle cx="260" cy="170" r="10" style="fill:#9CC4D0"/>`, `<rect x="200" y="140" width="120" height="104"/><rect x="246" y="76" width="28" height="36"/>`) + `<path d="M260 88 v14" stroke="#C9A24A" stroke-width="3"/><circle cx="260" cy="104" r="4" fill="#C9A24A"/>`), "Chapel", 260, 276, "#F6E3B4");
  const bench = place("bvhsunset", 390, 430, 34, 9, "The sunset bench", g(sk(`<rect x="350" y="398" width="80" height="12" rx="3" style="fill:#B9AE9A"/><rect x="356" y="410" width="10" height="10" style="fill:#9A9080"/><rect x="414" y="410" width="10" height="10" style="fill:#9A9080"/>`, `<rect x="350" y="398" width="80" height="12" rx="3"/>`)), "Sunset bench", 390, 452, ev ? "#FBE0B8" : "#F6E3B4");
  return lampDefs + ground("#C9C49A", "#B9B48A") + sky + cypress(170, 250, 1.3) + cypress(350, 250, 1.2) + cypress(380, 250, .9) + chapel + bench + lane("M16 420 Q140 420 220 380 Q260 340 260 270", 24, "#F2EDE2", "#DCD4C2") + [100, 200, 320, 460, 470, 140].map((x, i) => thyme(x, 340 + (i*61) % 260)).join("")
    + gate("bvhToGoats", 16, 420, "The goats", 60, 452, "West, back down to the goats");
}

const SCREENS = {hv_rows: rowsScreen, hv_still: stillScreen, hm_square: squareScreen, hm_lanes: lanesScreen, hp_street: perfumeStreetScreen, hp_garden: gardenScreen,
  hs_hives: hivesScreen, hs_fields: fieldsScreen, hb_bridge: bridgeScreen, hb_bank: bankScreen, hc_goats: goatsScreen, hc_chapel: chapelScreen};
export const lavenderArt = scene => (SCREENS[scene] || rowsScreen)();
