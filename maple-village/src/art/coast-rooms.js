// The Coast Road's rooms (round 149): three behind the doors of every stop, each its own seaside colours. Like the
// Vines' rooms (art/bellbird-rooms.js, whose helpers these share): busy round the edges, the middle of the floor clear,
// and one thing in the middle of the back to tap (data-rdspot = the room's id: core.js roomSpot opens its panel).
import { sk } from "./scenes.js";
import { rLab as lab, rG as g, rSpot as spot, rHov as hovE, rExit as exit, rWall as wall, rFloor as floor, rWin as win, rShelf as shelfUnit, rJars as jars, rBottles as bottlesF, rCounter as counter, rTable as table, rChair as chair, rPlant as plant, rCrate as crateOf, rFrame as frame, rSign as signText } from "./bellbird-rooms.js";

const board = (x, y, col, h = 120) => g(sk(`<ellipse cx="${x}" cy="${y}" rx="11" ry="${h/2}" style="fill:${col}"/><path d="M${x} ${y - h/2 + 8} V${y + h/2 - 8}" style="stroke:#FFFDF6" stroke-width="1.4"/>`, `<ellipse cx="${x}" cy="${y}" rx="11" ry="${h/2}"/>`));
const seaWin = (x, y, w, h) => win(x, y, w, h, "water");
const tiles = (col, line) => g(`<rect width="520" height="200" fill="${col}"/>${Array.from({length: 14}, (_, i) => `<path d="M0 ${12 + i*14} H520" stroke="${line}" stroke-width="1"/>`).join("")}${Array.from({length: 26}, (_, i) => `<path d="M${i*20} 0 V200" stroke="${line}" stroke-width="1"/>`).join("")}<rect y="0" width="520" height="12" fill="#3E6B8C"/>`);
const bench = (x, y, w = 120, col = "#8A6A52") => g(sk(`<rect x="${x}" y="${y}" width="${w}" height="16" rx="3" style="fill:${col}"/>`, `<rect x="${x}" y="${y}" width="${w}" height="16" rx="3"/>`));
const fishShapes = (x, y, n, col = "#D9A05A") => g(Array.from({length: n}, (_, i) => `<path d="M${x + i*22} ${y} q8 -6 16 0 q-8 6 -16 0z M${x + i*22 + 16} ${y} l5 -4 v8z" fill="${col}" stroke="#3a2e28" stroke-width=".6"/>`).join(""));

/* ---------- Breakwater ---------- */
function surfshopRoom(){
  const back = wall("#BFE3DA", {boards: true, trim: "#3E6B8C"}) + ["#E8566C", "#F3C969", "#4F9CC4", "#FFFDF6", "#9CC27E", "#C9A2C8"].map((c, i) => board(40 + i*30, 110, c)).join("")
    + g(sk(`<rect x="320" y="40" width="180" height="8" style="fill:#8A6A52"/>`, ``) + [0, 1, 2, 3].map(i => `<path d="M${336 + i*42} 48 v6 l-14 10 v80 h28 v-80 l-14 -10z" fill="${["#2F2B28", "#3E5A6E", "#2F2B28", "#5A3A6E"][i]}" stroke="#3a2e28" stroke-width=".8"/>`).join(""));
  const ctr = spot("bv_surfshop", 260, 330, "The counter", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#3E6B8C", "#9FD3C2"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`)
    + g([0, 1, 2, 3].map(i => `<rect x="${176 + i*18}" y="234" width="14" height="10" rx="2" fill="${["#F3E7B0", "#F4C7CF", "#BFE3DA", "#F3E7B0"][i]}" stroke="#3a2e28" stroke-width=".6"/>`).join("") + `<rect x="300" y="226" width="34" height="22" rx="3" fill="#C9A24A" stroke="#3a2e28" stroke-width=".8"/>`) + lab(260, 346, "Boards and lessons", "#C3E8DA"));
  const edges = board(60, 500, "#F3C969", 100) + board(86, 504, "#E8566C", 100) + board(112, 508, "#4F9CC4", 100) + g(`<ellipse cx="450" cy="520" rx="40" ry="14" fill="#E8D3A8" stroke="#3a2e28" stroke-width=".8"/><ellipse cx="450" cy="510" rx="16" ry="9" fill="#C98A4A" stroke="#3a2e28" stroke-width=".8"/><circle cx="462" cy="504" r="5" fill="#C98A4A" stroke="#3a2e28" stroke-width=".8"/>`) + plant(470, 600, .9);
  return floor(200, "#D9C7A0") + back + edges + ctr + exit("#3E6B8C");
}
function chippyRoom(){
  const back = tiles("#F2F6F8", "#D6E2E8") + g(sk(`<rect x="40" y="30" width="170" height="130" style="fill:#2F3A34"/>`, `<rect x="40" y="30" width="170" height="130"/>`)) + signText(125, 54, "TODAY'S CATCH", "#FFFDF6", "#2F3A34", 9)
    + g(`<text x="60" y="84" font-size="9" font-family="Klee One,serif" fill="#FFFDF6">flake · 9</text><text x="60" y="104" font-size="9" font-family="Klee One,serif" fill="#FFFDF6">whiting · 10</text><text x="60" y="124" font-size="9" font-family="Klee One,serif" fill="#FFFDF6">potato cakes · 2</text><text x="60" y="144" font-size="9" font-family="Klee One,serif" fill="#FFFDF6">calamari · 7</text>`)
    + seaWin(300, 40, 180, 110);
  const ctr = spot("bv_chippy", 260, 330, "The counter", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#C9D6DE", "#E6EEF2"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`)
    + g(`<rect x="170" y="222" width="70" height="26" rx="3" fill="#9AA0A8" stroke="#3a2e28" stroke-width=".8"/><rect x="176" y="216" width="26" height="10" fill="#F3D98A" stroke="#3a2e28" stroke-width=".6"/><rect x="208" y="216" width="26" height="10" fill="#F3D98A" stroke="#3a2e28" stroke-width=".6"/><rect x="280" y="232" width="60" height="16" fill="#F6F1E2" stroke="#3a2e28" stroke-width=".6"/>`) + lab(260, 346, "Fish and chips", "#C3DDF3"));
  const edges = table(90, 470, 70, "#F4C7CF") + chair(50, 480) + chair(130, 480) + table(430, 470, 70, "#F4C7CF") + chair(390, 480) + chair(470, 480) + g(`<rect x="84" y="456" width="5" height="10" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".5"/><rect x="92" y="456" width="5" height="10" fill="#7A4A3A" stroke="#3a2e28" stroke-width=".5"/>`) + plant(40, 600, .8);
  return floor(200, "#E6E2DA", "flags") + back + edges + ctr + exit("#3E6B8C");
}
function bakeryRoom(){
  const back = wall("#F6E7D0", {trim: "#8A5A3A"}) + shelfUnit(20, 30, 200, 160, 3, (x, y, w, r) => Array.from({length: 5}, (_, i) => `<ellipse cx="${x + 18 + i*(w/5)}" cy="${y - 6}" rx="16" ry="7" fill="${["#D9A05A", "#C98A4A", "#E3B47A"][(i + r) % 3]}" stroke="#3a2e28" stroke-width=".6"/>`).join("")) + seaWin(300, 40, 180, 110);
  const ctr = spot("bv_bakery", 260, 330, "The glass counter", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#FFFDF6", "#E6DCC6"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`)
    + g(`<rect x="156" y="258" width="208" height="30" fill="#CFE3EA" opacity=".6"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${178 + i*40}" cy="276" rx="14" ry="7" fill="${i % 2 ? "#E8C07A" : "#F3E7B0"}" stroke="#3a2e28" stroke-width=".6"/>`).join("")}`) + lab(260, 346, "Pies and slices", "#FBE0B8"));
  const edges = table(90, 480, 60) + chair(56, 490) + chair(124, 490) + table(430, 480, 60) + chair(396, 490) + chair(464, 490) + plant(470, 600, .9) + crateOf(60, 590, ["#E3B47A", "#D9A05A"]);
  return floor(200, "#C9A27E") + back + edges + ctr + exit("#8A5A3A");
}

/* ---------- Lighthouse Point ---------- */
function lighthouseRoom(){
  const back = g(`<rect width="520" height="640" fill="#F2EEE6"/><path d="M0 200 Q260 240 520 200 V0 H0z" fill="#FFFDF6"/>`) + [80, 260, 440].map(x => g(sk(`<circle cx="${x}" cy="90" r="34" style="fill:#7FB8D0"/><path d="M${x - 34} 100 Q${x} 90 ${x + 34} 100" style="fill:none;stroke:#FFFDF6" stroke-width="2"/>`, `<circle cx="${x}" cy="90" r="34"/>`))).join("");
  // the spiral stair up the middle
  const stair = spot("bv_lighthouse", 260, 380, "The stairs to the top", hovE(260, 372, 70, 14), sk(`<circle cx="260" cy="300" r="64" style="fill:#E6DED0"/>${Array.from({length: 12}, (_, i) => { const a = i/12*Math.PI*2; return `<path d="M260 300 L${260 + Math.cos(a)*62} ${300 + Math.sin(a)*62}" style="stroke:#5A4636" stroke-width="3"/>`; }).join("")}<circle cx="260" cy="300" r="10" style="fill:#5A4636"/>`, `<circle cx="260" cy="300" r="64"/>`) + lab(260, 392, "Up to the lamp", "#F6D3DC"));
  const edges = g(sk(`<rect x="40" y="440" width="70" height="60" rx="3" style="fill:#8A6A52"/><path d="M48 450 h54 M48 462 h54" style="stroke:#F3E7C8" stroke-width="2"/>`, `<rect x="40" y="440" width="70" height="60" rx="3"/>`)) + g(`<text x="75" y="486" text-anchor="middle" font-size="7" fill="#F3E7C8">LOGBOOK</text>`)
    + g(sk(`<path d="M420 500 l20 -60 h20 l20 60z" style="fill:#F3E7B0"/>${[0, 1, 2, 3].map(i => `<path d="M${428 + i*4} ${490 - i*12} h${44 - i*8}" style="stroke:#C9A24A" stroke-width="2"/>`).join("")}`, `<path d="M420 500 l20 -60 h20 l20 60z"/>`)) + plant(60, 600, .8);
  return floor(200, "#B9AE9E", "flags") + back + edges + stair + exit("#3E7A5A");
}
function tearoomRoom(){
  const back = wall("#F6F0E6", {trim: "#C8432F"}) + seaWin(200, 40, 120, 100) + g(`<path d="M196 36 q30 30 0 110 M324 36 q-30 30 0 110" fill="#FFFDF6" stroke="#E6DCC6" stroke-width="1.2" opacity=".9"/>`)
    + shelfUnit(20, 30, 150, 160, 3, jars(6, ["#FFFDF6", "#BFD4E2", "#F4C7CF"])) + g(sk(`<rect x="370" y="80" width="110" height="40" rx="4" style="fill:#CFE3EA"/><path d="M386 110 l20 -18 v18z M406 110 l14 -24 v24z" style="fill:#FFFDF6"/><path d="M380 112 h90" style="stroke:#8A5A3A" stroke-width="2"/>`, `<rect x="370" y="80" width="110" height="40" rx="4"/>`));
  const ctr = spot("bv_tearoom", 260, 330, "The dresser", hovE(260, 320, 110, 16), sk(counter(160, 250, 200, "#8A5A3A", "#C9A27E"), `<rect x="160" y="250" width="200" height="46" rx="4"/>`)
    + g(`${[0, 1, 2].map(i => `<ellipse cx="${200 + i*40}" cy="244" rx="12" ry="5" fill="#E3B47A" stroke="#3a2e28" stroke-width=".6"/><circle cx="${200 + i*40}" cy="240" r="3" fill="#C2334D"/>`).join("")}<path d="M310 240 q10 -14 20 0z" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".7"/>`) + lab(260, 346, "Devonshire tea", "#FBE0B8"));
  const edges = table(90, 470, 60, "#FFFDF6") + chair(56, 480) + chair(124, 480) + table(430, 470, 60, "#FFFDF6") + chair(396, 480) + chair(464, 480) + plant(470, 600, .9) + plant(50, 600, .7);
  return floor(200, "#B9825E") + back + edges + ctr + exit("#C8432F");
}
function giftshopRoom(){
  const back = wall("#EAF2F4", {trim: "#3E6B8C"}) + shelfUnit(20, 30, 150, 160, 3, (x, y, w, r) => Array.from({length: 4}, (_, i) => `<path d="M${x + 10 + i*34} ${y} l5 -26 h6 l5 26z" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".6"/><rect x="${x + 14 + i*34}" y="${y - 32}" width="10" height="6" fill="#C8432F"/>`).join(""))
    + g([0, 1, 2, 3, 4].map(i => `<path d="M${220 + i*24} 20 v${40 + (i % 2)*14}" stroke="#8A7A66"/>${[0, 1, 2].map(k => `<circle cx="${220 + i*24}" cy="${62 + (i % 2)*14 + k*8}" r="3" fill="${["#FFFDF6", "#F4C7CF", "#BFD4E2"][k]}" stroke="#3a2e28" stroke-width=".5"/>`).join("")}`).join("")) + seaWin(360, 40, 130, 100);
  const ctr = spot("bv_giftshop", 260, 330, "The counter", hovE(260, 320, 110, 16), sk(counter(160, 250, 200, "#3E6B8C", "#BFD4E2"), `<rect x="160" y="250" width="200" height="46" rx="4"/>`) + g(`<rect x="300" y="226" width="34" height="22" rx="3" fill="#C9A24A" stroke="#3a2e28" stroke-width=".8"/>`) + lab(260, 346, "Lighthouse things", "#C3DDF3"));
  const edges = g(sk(`<rect x="40" y="430" width="60" height="110" rx="3" style="fill:#C9A27E"/>${[0, 1, 2, 3].map(i => `<rect x="${46 + (i % 2)*26}" y="${440 + Math.floor(i/2)*44}" width="22" height="34" fill="${["#F4C7CF", "#BFD4E2", "#F3E7B0", "#C3E8B8"][i]}"/>`).join("")}`, `<rect x="40" y="430" width="60" height="110" rx="3"/>`)) + crateOf(440, 480, ["#FFFDF6", "#E6DED0"]) + plant(470, 600, .8);
  return floor(200, "#D9CDB4") + back + edges + ctr + exit("#3E6B8C");
}

/* ---------- Fern Gully ---------- */
function rangerRoom(){
  const back = wall("#C9B49A", {boards: true, trim: "#4E6A4A"}) + frame(30, 40, 150, 110, "#E8E0C8", "#9DB27A") + g(`<path d="M50 120 q40 -40 110 -20" stroke="#4E7A9A" stroke-width="2" fill="none"/>`)
    + g([0, 1, 2, 3, 4, 5].map(i => `<path d="M${220 + (i % 3)*40} ${50 + Math.floor(i/3)*50} q12 -16 24 0 q-12 16 -24 0z" fill="${["#7FA35A", "#C98A3A", "#9DB27A"][i % 3]}" stroke="#3a2e28" stroke-width=".6"/>`).join("")) + g(`<path d="M380 40 q30 60 10 130" stroke="#8A6A52" stroke-width="3" fill="none"/><path d="M386 60 q20 4 28 20 M388 90 q22 4 30 20 M388 120 q20 4 26 20" stroke="#8A6A52" stroke-width="1.4" fill="none"/>`);
  const ctr = spot("bv_rangerhut", 260, 330, "The ranger's desk", hovE(260, 320, 110, 16), sk(counter(160, 250, 200, "#6B5444", "#9A7656"), `<rect x="160" y="250" width="200" height="46" rx="4"/>`) + g(`<rect x="300" y="222" width="24" height="26" rx="4" fill="#CFE3EA" stroke="#3a2e28" stroke-width=".8" opacity=".8"/>`) + lab(260, 346, "Maps and tickets", "#DCEBC8"));
  const edges = g(sk(`<rect x="40" y="470" width="80" height="16" style="fill:#8A6A52"/>${[0, 1, 2].map(i => `<path d="M${50 + i*24} 470 v-24 h14 v24" style="fill:#5A4636"/>`).join("")}`, `<rect x="40" y="470" width="80" height="16"/>`)) + crateOf(450, 480, ["#9DB27A", "#7FA35A"]) + plant(470, 600, 1) + plant(50, 600, .9);
  return floor(200, "#9A7F62") + back + edges + ctr + exit("#4E6A4A");
}
function mushcafeRoom(){
  const back = wall("#F3E7C8", {trim: C_RED}) + g(sk(`<rect x="30" y="60" width="90" height="120" rx="4" style="fill:#3A3430"/><rect x="46" y="110" width="58" height="40" rx="3" style="fill:#E8913A"/><path d="M60 60 v-50 h22 v50" style="fill:#3A3430"/>`, `<rect x="30" y="60" width="90" height="120" rx="4"/>`))
    + shelfUnit(150, 30, 160, 150, 3, jars(6, ["#C98A4A", "#E3B47A", "#7FA35A"])) + g([[360, 70], [420, 110], [470, 60]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="11" fill="${C_RED}" stroke="#3a2e28" stroke-width=".8"/><circle cx="${x - 6}" cy="${y - 2}" r="2.6" fill="#FFFDF6"/><circle cx="${x + 6}" cy="${y - 4}" r="2" fill="#FFFDF6"/><rect x="${x - 5}" y="${y + 6}" width="10" height="14" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".6"/>`).join(""));
  const ctr = spot("bv_mushcafe", 260, 330, "The counter", hovE(260, 320, 110, 16), sk(counter(160, 250, 200, "#8A5A3A", "#C9A27E"), `<rect x="160" y="250" width="200" height="46" rx="4"/>`) + g(`<ellipse cx="200" cy="244" rx="16" ry="6" fill="#C98A4A" stroke="#3a2e28" stroke-width=".6"/><rect x="300" y="226" width="30" height="20" rx="3" fill="#E8E0C8" stroke="#3a2e28" stroke-width=".6"/>`) + lab(260, 346, "Soup of the day", "#F6D3DC"));
  const edges = table(90, 470, 60, "#E8D3A8") + chair(56, 480, "#7FA35A") + chair(124, 480, C_RED) + table(430, 470, 60, "#E8D3A8") + chair(396, 480, "#E3B04B") + chair(464, 480, "#7FA35A") + plant(470, 600) + plant(50, 600, .8);
  return floor(200, "#8A6A52") + back + edges + ctr + exit(C_RED);
}
const C_RED = "#C8432F";
function grottoRoom(){
  const back = g(`<rect width="520" height="640" fill="#1E2422"/><path d="M0 0 H520 V260 Q400 300 260 280 Q120 300 0 260z" fill="#2E3632"/>${Array.from({length: 60}, (_, i) => { const x = (i*97) % 520, y = 20 + (i*53) % 230; return `<circle cx="${x}" cy="${y}" r="${1 + (i % 3)*.5}" fill="#9FF0D8" class="twinkle" style="animation-delay:${(i % 7)*.4}s"/>`; }).join("")}`);
  const look = spot("bv_grotto", 260, 380, "Look up", hovE(260, 372, 90, 14), lab(260, 386, "Look up (torches off)", "#C3E8DA"));
  const edges = g(`<ellipse cx="80" cy="520" rx="60" ry="20" fill="#3A403C"/><ellipse cx="450" cy="500" rx="50" ry="18" fill="#3A403C"/><ellipse cx="260" cy="560" rx="80" ry="14" fill="#2A4A50" opacity=".8"/>`);
  return back + edges + look + exit("#3A3430");
}

/* ---------- Fisher's Harbour ---------- */
function coopRoom(){
  const back = wall("#C9CED2", {trim: "#3E6B8C"}) + g(Array.from({length: 26}, (_, i) => `<path d="M${i*20} 12 V200" stroke="#B5BBC0" stroke-width="2"/>`).join("")) + g(sk(`<rect x="360" y="40" width="130" height="90" style="fill:#FFFDF6"/>`, `<rect x="360" y="40" width="130" height="90"/>`)) + signText(425, 60, "TODAY", "#FFFDF6", "#3E6B8C", 9)
    + g(`<text x="372" y="84" font-size="8" font-family="Klee One,serif" fill="#3B3530">crays · 28</text><text x="372" y="100" font-size="8" font-family="Klee One,serif" fill="#3B3530">prawns · 6</text><text x="372" y="116" font-size="8" font-family="Klee One,serif" fill="#3B3530">scallops · 7</text>`) + fishShapes(40, 80, 6, "#9FC3D9") + g(`<path d="M30 70 H180" stroke="#8A7A66"/>`);
  const ctr = spot("bv_coop", 260, 330, "The ice tubs", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#9AA0A8", "#E6EEF2"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`)
    + g(`<rect x="156" y="246" width="208" height="12" fill="#FFFFFF" opacity=".8"/>${[0, 1, 2].map(i => `<path d="M${176 + i*30} 244 q10 -10 20 0" fill="#C8432F" stroke="#3a2e28" stroke-width=".7"/><path d="M${180 + i*30} 238 l-6 -8 M${192 + i*30} 238 l6 -8" stroke="#C8432F" stroke-width="1.2"/>`).join("")}<rect x="300" y="222" width="40" height="24" rx="3" fill="#D9A05A" stroke="#3a2e28" stroke-width=".8"/>`) + lab(260, 346, "Fresh off the boats", "#C3DDF3"));
  const edges = g(sk(`<rect x="40" y="460" width="80" height="40" rx="4" style="fill:#4F93B4"/><rect x="400" y="460" width="80" height="40" rx="4" style="fill:#E8913A"/>`, `<rect x="40" y="460" width="80" height="40" rx="4"/><rect x="400" y="460" width="80" height="40" rx="4"/>`)) + g(`<path d="M50 470 h60 M410 470 h60" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>`) + crateOf(80, 580, ["#C8432F", "#C8432F"]);
  return floor(200, "#B9BEC4", "flat") + back + edges + ctr + exit("#3E6B8C");
}
function pubRoom(){
  const back = wall("#7A4A3A", {boards: true, trim: "#3E2A20"}) + shelfUnit(150, 30, 220, 150, 3, bottlesF(10, ["#7A1F3D", "#E8D57A", "#5A7A3A", "#C98A4A"])) + g(sk(`<rect x="30" y="60" width="90" height="120" style="fill:#3A3430"/><path d="M50 180 q25 -40 50 0z" style="fill:#E8913A"/>`, `<rect x="30" y="60" width="90" height="120"/>`))
    + g(`<circle cx="440" cy="80" r="30" fill="#2F2B28" stroke="#C9A24A" stroke-width="4"/><circle cx="440" cy="80" r="16" fill="#C8432F"/><circle cx="440" cy="80" r="5" fill="#F3E7C8"/>`) + g(`<circle cx="260" cy="20" r="0"/>`);
  const ctr = spot("bv_pub", 260, 330, "The bar", hovE(260, 320, 110, 16), sk(counter(140, 250, 240, "#5A3A2A", "#9A6A42"), `<rect x="140" y="250" width="240" height="46" rx="4"/>`)
    + g(`${[0, 1, 2].map(i => `<rect x="${200 + i*30}" y="222" width="6" height="26" fill="#C9A24A" stroke="#3a2e28" stroke-width=".6"/><circle cx="${203 + i*30}" cy="220" r="4" fill="#2F2B28"/>`).join("")}<circle cx="320" cy="236" r="14" fill="none" stroke="#8A6A52" stroke-width="4"/>${Array.from({length: 8}, (_, i) => { const a = i/8*Math.PI*2; return `<path d="M320 236 L${320 + Math.cos(a)*20} ${236 + Math.sin(a)*20}" stroke="#8A6A52" stroke-width="2"/>`; }).join("")}`) + lab(260, 346, "The bar", "#FBE0B8"));
  const edges = table(90, 470, 60, "#9A6A42") + chair(56, 480, "#5A3A2A") + chair(124, 480, "#5A3A2A") + table(430, 470, 60, "#9A6A42") + chair(396, 480, "#5A3A2A") + chair(464, 480, "#5A3A2A") + g(`<rect x="440" y="560" width="50" height="40" rx="6" fill="#8A6A52" stroke="#3a2e28" stroke-width=".8"/>`);
  return floor(200, "#6B4A36") + back + edges + ctr + exit("#3E2A20");
}
function smokehouseRoom(){
  const back = g(`<rect width="520" height="200" fill="#A89880"/>${Array.from({length: 8}, (_, i) => `<path d="M0 ${20 + i*24} H520" stroke="#988870" stroke-width="2"/>`).join("")}`) + [40, 90, 140].map(y => g(`<path d="M30 ${y} H490" stroke="#5A4636" stroke-width="3"/>`) + fishShapes(40, y + 12, 20, ["#D9A05A", "#C98A3A", "#E3B47A"][y % 3])).join("")
    + g(`<path d="M100 0 q-20 40 0 80 q20 40 0 80" stroke="#E6DED0" stroke-width="18" fill="none" opacity=".25"/><path d="M400 0 q-20 40 0 80 q20 40 0 80" stroke="#E6DED0" stroke-width="18" fill="none" opacity=".25"/>`);
  const ctr = spot("bv_smokehouse", 260, 330, "The counter", hovE(260, 320, 110, 16), sk(counter(160, 250, 200, "#6B5444", "#9A7656"), `<rect x="160" y="250" width="200" height="46" rx="4"/>`) + g([0, 1, 2, 3].map(i => `<rect x="${186 + i*36}" y="230" width="20" height="18" rx="3" fill="#E3D6BE" stroke="#3a2e28" stroke-width=".6"/><rect x="${186 + i*36}" y="228" width="20" height="5" fill="#8A5A3A"/>`).join("")) + lab(260, 346, "Smoked trout", "#F6E3B4"));
  const edges = crateOf(70, 470, ["#8A6A52", "#6B5444"]) + crateOf(70, 530, ["#8A6A52", "#6B5444"]) + g(`<rect x="410" y="450" width="70" height="90" rx="3" fill="#7A6A5A" stroke="#3a2e28" stroke-width=".8"/><rect x="420" y="500" width="50" height="20" fill="#E8913A"/>`);
  return floor(200, "#8A7A6A", "flags") + back + edges + ctr + exit("#5A4636");
}

/* ---------- The Sisters ---------- */
function kioskRoom(){
  const back = wall("#F3E7C8", {trim: "#3E6B8C"}) + g(sk(`<rect x="30" y="30" width="190" height="140" style="fill:#E8E0C8"/><path d="M50 120 q50 -60 150 -40" style="stroke:#4E7A9A" stroke-width="2" fill="none"/>`, `<rect x="30" y="30" width="190" height="140"/>`) + [[80, 90], [130, 70], [170, 110]].map(([x, y]) => `<path d="M${x - 6} ${y} l12 0 M${x} ${y - 6} l0 12" stroke="#C8432F" stroke-width="2"/>`).join("")) + signText(125, 46, "SHIPWRECKS", "#FFFDF6", "#3E6B8C", 9)
    + seaWin(300, 40, 190, 110);
  const ctr = spot("bv_kiosk", 260, 330, "The hatch", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#3E6B8C", "#9FC3D9"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(`<rect x="170" y="226" width="40" height="22" rx="3" fill="#E6EEF2" stroke="#3a2e28" stroke-width=".7"/><rect x="290" y="224" width="30" height="24" rx="3" fill="#9AA0A8" stroke="#3a2e28" stroke-width=".7"/>`) + lab(260, 346, "Chips and coffee", "#C3DDF3"));
  const edges = g(sk(`<rect x="40" y="420" width="50" height="130" rx="3" style="fill:#C9A27E"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${46 + (i % 2)*20}" y="${430 + Math.floor(i/2)*38}" width="16" height="30" fill="${["#E8913A", "#9FC3D9", "#F3D34A"][i % 3]}"/>`).join("")}`, `<rect x="40" y="420" width="50" height="130" rx="3"/>`)) + table(430, 480, 60) + chair(396, 490) + chair(464, 490) + plant(470, 600, .8);
  return floor(200, "#D9C7A0") + back + edges + ctr + exit("#3E6B8C");
}
function slscRoom(){
  const back = g(`<rect width="520" height="200" fill="#F3D34A"/><rect width="520" height="100" fill="#C8432F"/><rect y="0" width="520" height="12" fill="#3E2A20"/>`) + [40, 100].map(x => board(x, 110, "#C8432F", 150)).join("") + board(160, 110, "#F3D34A", 150)
    + g(sk(`<rect x="320" y="30" width="170" height="140" style="fill:#5A3A2A"/>`, `<rect x="320" y="30" width="170" height="140"/>`) + Array.from({length: 7}, (_, i) => `<path d="M336 ${56 + i*16} h138" stroke="#E8C33A" stroke-width="1.4"/>`).join("")) + signText(405, 44, "HONOUR BOARD", "#F3D34A", "#5A3A2A", 9);
  const ctr = spot("bv_slsc", 260, 330, "The canteen", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#C8432F", "#F3D34A"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(`<rect x="300" y="226" width="34" height="22" rx="3" fill="#E6EEF2" stroke="#3a2e28" stroke-width=".8"/>`) + lab(260, 346, "The canteen", "#F6D3DC"));
  const edges = g(sk(`<rect x="40" y="440" width="90" height="30" rx="14" style="fill:#F3D34A"/><rect x="400" y="440" width="90" height="30" rx="14" style="fill:#C8432F"/>`, `<rect x="40" y="440" width="90" height="30" rx="14"/><rect x="400" y="440" width="90" height="30" rx="14"/>`)) + bench(60, 560, 100) + plant(470, 600, .8);
  return floor(200, "#C9B79A") + back + edges + ctr + exit("#C8432F");
}
function hideRoom(){
  const back = g(`<rect width="520" height="640" fill="#5A4A3A"/><rect width="520" height="200" fill="#6B5A44"/>${Array.from({length: 10}, (_, i) => `<path d="M0 ${20 + i*18} H520" stroke="#5A4A3A" stroke-width="2"/>`).join("")}`)
    + g(sk(`<rect x="30" y="60" width="460" height="100" style="fill:#3E5A6E"/><path d="M30 130 Q260 116 490 130 V160 H30z" style="fill:#EAD7A8"/><path d="M30 120 Q260 108 490 120" style="stroke:#FFFDF6;fill:none" stroke-width="3"/>`, `<rect x="30" y="60" width="460" height="100"/>`));
  const look = spot("bv_hide", 260, 330, "The long window", hovE(260, 320, 140, 16), lab(260, 330, "Watch the beach (whisper)", "#DCEBC8"));
  const edges = bench(60, 420, 160, "#3E2A20") + bench(300, 420, 160, "#3E2A20") + g(`<rect x="30" y="520" width="60" height="50" rx="3" fill="#3E2A20"/><text x="60" y="550" text-anchor="middle" font-size="7" fill="#F3E7C8">NO FLASH</text>`);
  return back + edges + look + exit("#3E2A20");
}

/* ---------- Koala Cove ---------- */
function parkstoreRoom(){
  const back = wall("#F3EAD6", {boards: true, trim: "#3E6B8C"}) + shelfUnit(20, 30, 200, 160, 3, jars(9, ["#E8913A", "#9FC3D9", "#F3D34A", "#E8566C"])) + g(sk(`<rect x="300" y="40" width="190" height="130" rx="4" style="fill:#BFE3EE"/><rect x="310" y="50" width="170" height="110" style="fill:#E6F4F8"/>`, `<rect x="300" y="40" width="190" height="130" rx="4"/>`) + [0, 1, 2].map(i => `<rect x="320" y="${62 + i*34}" width="150" height="4" fill="#B7C9CF"/>${[0, 1, 2, 3].map(k => `<rect x="${326 + k*36}" y="${48 + i*34}" width="14" height="14" rx="3" fill="${["#E8566C", "#F3C969", "#9CC27E", "#C9A2C8"][(i + k) % 4]}"/>`).join("")}`).join(""));
  const ctr = spot("bv_parkstore", 260, 330, "The counter", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#8A6A52", "#C9A27E"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(`<rect x="170" y="222" width="30" height="26" rx="3" fill="#C9A86A" stroke="#3a2e28" stroke-width=".8"/><circle cx="185" cy="220" r="5" fill="#E3B04B"/><rect x="300" y="226" width="34" height="22" rx="3" fill="#C9A24A" stroke="#3a2e28" stroke-width=".8"/>`) + lab(260, 346, "Bait, bread and bird seed", "#C3DDF3"));
  const edges = crateOf(70, 470, ["#E3B04B", "#C8432F"]) + g(`<rect x="400" y="440" width="90" height="70" rx="4" fill="#C9C2B4" stroke="#3a2e28" stroke-width=".8"/><text x="445" y="480" text-anchor="middle" font-size="7" fill="#3B3530">LOST THONGS</text>${[0, 1, 2].map(i => `<ellipse cx="${416 + i*26}" cy="498" rx="8" ry="4" fill="${["#4F9CC4", "#E8566C", "#F3D34A"][i]}"/>`).join("")}`) + plant(470, 600, .9);
  return floor(200, "#C9A27E") + back + edges + ctr + exit("#3E6B8C");
}
function laundryRoom(){
  const back = wall("#DCEFF0", {trim: "#E8566C"}) + g([0, 1, 2].map(i => sk(`<rect x="${30 + i*70}" y="80" width="60" height="100" rx="4" style="fill:#FFFDF6"/><circle cx="${60 + i*70}" cy="136" r="20" style="fill:#BFD4E2"/><circle cx="${60 + i*70}" cy="136" r="12" style="fill:#9FC3D9"/>`, `<rect x="${30 + i*70}" y="80" width="60" height="100" rx="4"/><circle cx="${60 + i*70}" cy="136" r="20"/>`)).join(""))
    + shelfUnit(320, 30, 170, 150, 3, (x, y, w, r) => Array.from({length: 7}, (_, i) => `<rect x="${x + i*(w/7)}" y="${y - 20}" width="${w/7 - 3}" height="20" fill="${["#E8566C", "#9FC3D9", "#F3D34A", "#9CC27E", "#C9A2C8"][(i + r) % 5]}"/>`).join("")) + signText(405, 26, "BOOK SWAP", "#FFFDF6", "#E8566C", 8);
  const ctr = spot("bv_laundry", 260, 330, "The coffee counter", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#E8566C", "#F4C7CF"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(`<rect x="170" y="220" width="44" height="28" rx="3" fill="#9AA0A8" stroke="#3a2e28" stroke-width=".8"/><rect x="290" y="232" width="50" height="14" rx="3" fill="#E3B47A" stroke="#3a2e28" stroke-width=".6"/>`) + lab(260, 346, "Coffee and banana bread", "#F6D3DC"));
  const edges = table(90, 470, 60) + chair(56, 480, "#9FC3D9") + chair(124, 480, "#E8566C") + g(`<rect x="400" y="450" width="80" height="40" rx="4" fill="#C9A86A" stroke="#3a2e28" stroke-width=".8"/>${[0, 1, 2].map(i => `<rect x="${408 + i*24}" y="${440}" width="20" height="12" fill="${["#F4C7CF", "#FFFDF6", "#BFD4E2"][i]}" stroke="#3a2e28" stroke-width=".5"/>`).join("")}`) + plant(470, 600, .9);
  return floor(200, "#D9DDD2", "flags") + back + edges + ctr + exit("#E8566C");
}
function rechallRoom(){
  const back = wall("#E6E2DA", {trim: "#3E6B8C"}) + g(sk(`<rect x="30" y="40" width="110" height="140" rx="6" style="fill:#3E2A50"/><rect x="42" y="56" width="86" height="60" style="fill:#F3D34A"/>`, `<rect x="30" y="40" width="110" height="140" rx="6"/>`)) + signText(85, 136, "PINBALL", "#F3D34A", "#3E2A50", 8)
    + g(sk(`<rect x="180" y="40" width="150" height="120" style="fill:#2F3A34"/>`, `<rect x="180" y="40" width="150" height="120"/>`) + Array.from({length: 6}, (_, i) => `<path d="M196 ${68 + i*14} h118" stroke="#FFFDF6" stroke-width="1" opacity=".7"/>`).join("")) + signText(255, 56, "HIGH SCORES", "#FFFDF6", "#2F3A34", 8)
    + g(sk(`<rect x="370" y="80" width="120" height="100" style="fill:#3A3430"/>${Array.from({length: 10}, (_, i) => `<rect x="${376 + i*11}" y="150" width="9" height="24" style="fill:#FFFDF6"/>`).join("")}`, `<rect x="370" y="80" width="120" height="100"/>`));
  const ctr = spot("bv_rechall", 260, 400, "The ping-pong table", hovE(260, 392, 90, 14), sk(`<rect x="170" y="290" width="180" height="90" rx="3" style="fill:#3E7A5A"/><path d="M260 290 v90 M170 335 h180" style="stroke:#FFFDF6" stroke-width="2"/><path d="M170 335 h180" style="stroke:#2F2B28" stroke-width="4"/>`, `<rect x="170" y="290" width="180" height="90" rx="3"/>`) + lab(260, 404, "Ping-pong", "#C3E8DA"));
  const edges = table(80, 500, 60, "#E8D3A8") + chair(46, 510) + chair(114, 510) + g(`<rect x="400" y="470" width="80" height="60" rx="4" fill="#C9A86A" stroke="#3a2e28" stroke-width=".8"/><text x="440" y="504" text-anchor="middle" font-size="7" fill="#3B3530">JIGSAWS</text>`);
  return floor(200, "#C9A27E") + back + edges + ctr + exit("#3E6B8C");
}

const ROOMS = {bv_surfshop: surfshopRoom, bv_chippy: chippyRoom, bv_bakery: bakeryRoom, bv_lighthouse: lighthouseRoom, bv_tearoom: tearoomRoom, bv_giftshop: giftshopRoom,
  bv_rangerhut: rangerRoom, bv_mushcafe: mushcafeRoom, bv_grotto: grottoRoom, bv_coop: coopRoom, bv_pub: pubRoom, bv_smokehouse: smokehouseRoom,
  bv_kiosk: kioskRoom, bv_slsc: slscRoom, bv_hide: hideRoom, bv_parkstore: parkstoreRoom, bv_laundry: laundryRoom, bv_rechall: rechallRoom};
export const coastRoomArt = scene => (ROOMS[scene] || surfshopRoom)();
