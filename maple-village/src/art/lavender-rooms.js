// The Lavender Hills' rooms (round 162): three behind the doors of every stop, in Provence colours: limestone walls,
// terracotta tiles, blue shutters, copper, lavender. Like the other regions' rooms (art/bellbird-rooms.js, whose
// helpers these share): busy round the edges, the middle of the floor clear, one thing in the middle of the back to tap.
import { sk } from "./scenes.js";
import { paperRoomArt } from "./paperie-room.js";
import { rLab as lab, rG as g, rSpot as spot, rHov as hovE, rExit as exit, rWall as wall, rFloor as floor, rWin as win, rShelf as shelfUnit, rJars as jars, rBottles as bottlesF, rCounter as counter, rTable as table, rChair as chair, rPlant as plant, rCrate as crateOf, rFrame as frame, rSign as signText } from "./bellbird-rooms.js";

const O = `stroke="#3a2e28" stroke-width=".6"`;
const ctrSpot = (id, aria, label, col, top, extra = "", labCol = "#FBE0B8") => spot(id, 260, 330, aria, hovE(260, 320, 110, 16), sk(counter(150, 250, 220, col, top), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(extra) + lab(260, 346, label, labCol));
const tiles = (y0 = 200) => g(`<rect y="${y0}" width="520" height="${640 - y0}" fill="#D9895E"/>${Array.from({length: 13}, (_, r) => Array.from({length: 9}, (_, c) => `<rect x="${c*60 + (r % 2)*30 - 30}" y="${y0 + r*34}" width="58" height="32" rx="3" fill="none" stroke="#C0744A" stroke-width="1.2"/>`).join("")).join("")}`);
const stoneWall = (col = "#E8D9B8") => g(`<rect width="520" height="200" fill="${col}"/>${Array.from({length: 22}, (_, i) => `<rect x="${(i*61) % 500}" y="${20 + (i*37) % 160}" width="${20 + (i % 3)*8}" height="9" rx="3" fill="#D9C49A"/>`).join("")}<rect width="520" height="12" fill="#C8643B"/>`);
const bunches = (x0, x1, y = 14, col = "#9A7CC8") => g(Array.from({length: Math.floor((x1 - x0)/22)}, (_, i) => `<path d="M${x0 + i*22} ${y} v14" stroke="#5E7A4E" stroke-width="2"/><ellipse cx="${x0 + i*22}" cy="${y + 20}" rx="4" ry="9" fill="${col}"/>`).join(""));
const blueBottles = bottlesF(8, ["#3E6B8C", "#5E8AB0", "#9A7CC8"]);
const soaps = (x, y, w, r) => Array.from({length: 6}, (_, i) => `<rect x="${x + i*(w/6)}" y="${y - 12}" width="${w/6 - 3}" height="12" rx="2" fill="${["#E6DCF3", "#F4C7CF", "#F3E7B0", "#C9D9A0"][(i + r) % 4]}" ${O}/>`).join("");
const loaves = (x, y, w, r) => Array.from({length: 5}, (_, i) => r === 0 ? `<rect x="${x + i*(w/5) + 4}" y="${y - 32}" width="6" height="32" rx="3" fill="#D9A05A" ${O}/>` : `<ellipse cx="${x + 18 + i*(w/5)}" cy="${y - 7}" rx="16" ry="7" fill="${["#D9A05A", "#C98A4A", "#E3B47A"][(i + r) % 3]}" ${O}/>`).join("");
const honeyJars = (x, y, w, r) => Array.from({length: 6}, (_, i) => `<rect x="${x + i*(w/6)}" y="${y - 14}" width="${w/6 - 4}" height="14" rx="3" fill="${["#F3D98A", "#E3B04B", "#C88A2A", "#E3C8E8"][(i + r) % 4]}" ${O}/>`).join("");
const candles = (x, y, w, r) => Array.from({length: 7}, (_, i) => `<rect x="${x + i*(w/7)}" y="${y - 18 - (i % 3)*4}" width="7" height="${18 + (i % 3)*4}" rx="2" fill="#F3D98A" ${O}/><path d="M${x + i*(w/7) + 3.5} ${y - 22 - (i % 3)*4} v-4" stroke="#3a2e28" stroke-width=".6"/>`).join("");
const goatCheeses = (x, y, w, r) => Array.from({length: 5}, (_, i) => `<ellipse cx="${x + 16 + i*(w/5)}" cy="${y - 6}" rx="12" ry="6" fill="${["#FFF8EC", "#C9D9A0", "#8A6A42"][(i + r) % 3]}" ${O}/>`).join("");
const tubs = (x, y, w) => g(Array.from({length: 8}, (_, i) => `<rect x="${x + i*(w/8)}" y="${y}" width="${w/8 - 3}" height="18" rx="3" fill="${["#E6DCF3", "#F3D98A", "#F4C7CF", "#C9D9A0", "#F3A05A", "#FFFDF6", "#E8A0B4", "#B79BDC"][i]}" ${O}/>`).join(""));

/* ---------- Lavender Ridge ---------- */
function stillRoom(){
  const back = stoneWall() + bunches(20, 500, 14) + shelfUnit(20, 60, 160, 130, 3, blueBottles) + shelfUnit(340, 60, 160, 130, 3, blueBottles);
  const still = spot("bv_hstill", 260, 330, "The copper still", hovE(260, 320, 110, 16), sk(`<ellipse cx="230" cy="250" rx="56" ry="44" style="fill:#C9784A"/><path d="M230 206 q0 -40 40 -46 l60 0" style="fill:none;stroke:#C9784A" stroke-width="10"/><rect x="320" y="150" width="30" height="110" rx="6" style="fill:#B9BEC4"/><rect x="200" y="290" width="60" height="16" style="fill:#5A4636"/>`, `<ellipse cx="230" cy="250" rx="56" ry="44"/>`)
    + g(`<path d="M206 236 q24 -14 48 0" stroke="#E3A06A" stroke-width="3" fill="none"/><path d="M334 262 l4 16" stroke="#E3B04B" stroke-width="2"/><rect x="330" y="278" width="14" height="18" rx="3" fill="#E3B04B" ${O}/>`) + lab(260, 346, "Lavender into oil", "#E6DCF3"));
  const edges = g(sk(`<rect x="40" y="430" width="90" height="70" rx="4" style="fill:#9A7CC8"/>`, `<rect x="40" y="430" width="90" height="70" rx="4"/>`) + `<path d="M50 440 q20 -20 40 0 q20 -20 30 0" stroke="#7E62B0" stroke-width="3" fill="none"/>`) + crateOf(440, 490, ["#9A7CC8", "#B79BDC", "#7E62B0"]) + plant(470, 600, .8);
  return tiles() + back + edges + still + exit("#7A5AA8");
}
function lavShopRoom(){
  const back = stoneWall("#F3E7D0") + bunches(20, 500, 14) + shelfUnit(20, 60, 230, 130, 3, (x, y, w, r) => r === 1 ? soaps(x, y, w, r) : blueBottles(x, y, w, r)) + shelfUnit(270, 60, 230, 130, 3, honeyJars);
  const ctr = ctrSpot("bv_hshop", "The counter", "Oil, soap, honey and bunches", "#7A5AA8", "#E6DCF3", `${[0, 1, 2].map(i => `<path d="M${180 + i*26} 248 l-6 -18 h12z" fill="#9A7CC8" ${O}/>`).join("")}<rect x="280" y="232" width="40" height="16" fill="#FFFDF6" ${O}/>`, "#E6DCF3");
  const edges = crateOf(80, 490, ["#9A7CC8", "#B79BDC", "#7E62B0"]) + g(`<rect x="420" y="440" width="60" height="60" rx="4" fill="#C9A27E" ${O}/>${[0, 1, 2].map(i => `<ellipse cx="${436 + i*14}" cy="440" rx="5" ry="12" fill="#9A7CC8"/>`).join("")}`) + plant(470, 600, .8) + plant(50, 600, .7);
  return tiles() + back + edges + ctr + exit("#7A5AA8");
}
function teaRoom(){
  const back = wall("#F3EEE6", {trim: "#7FA8C8"}) + win(30, 40, 200, 110, "vines") + g(`<path d="M30 110 h200" stroke="#9A7CC8" stroke-width="10" opacity=".7"/><path d="M26 36 q50 40 0 120 M234 36 q-50 40 0 120" fill="#FFFDF6" stroke="#E6DCC6" opacity=".9"/>`) + shelfUnit(270, 30, 230, 160, 3, jars(6, ["#E6DCF3", "#F3E7B0", "#FFFDF6"]));
  const ctr = ctrSpot("bv_htea", "The cake stand", "Lavender scones and lemonade", "#7FA8C8", "#FFFDF6", `${[0, 1, 2].map(i => `<ellipse cx="${190 + i*24}" cy="${244 - i*6}" rx="12" ry="4" fill="#E3B47A" ${O}/><circle cx="${190 + i*24}" cy="${240 - i*6}" r="2" fill="#9A7CC8"/>`).join("")}<rect x="290" y="216" width="16" height="30" rx="4" fill="#E6DCF3" ${O}/>`);
  const edges = table(90, 470, 70, "#E6DCF3") + chair(50, 480, "#7FA8C8") + chair(130, 480, "#7FA8C8") + table(430, 470, 70, "#E6DCF3") + chair(394, 480, "#7FA8C8") + chair(466, 480, "#7FA8C8") + plant(470, 600, .9) + plant(50, 600, .8);
  return floor(200, "#C9A27E") + back + edges + ctr + exit("#7FA8C8");
}

/* ---------- Montrose ---------- */
function boulRoom(){
  const back = stoneWall("#F3E3C3") + shelfUnit(20, 30, 220, 160, 3, loaves) + g(sk(`<path d="M290 200 V100 Q290 40 380 40 Q470 40 470 100 V200z" style="fill:#A8574A"/><path d="M320 200 V120 Q320 80 380 80 Q440 80 440 120 V200z" style="fill:#2F2420"/>`, `<path d="M290 200 V100 Q290 40 380 40 Q470 40 470 100 V200z"/>`) + `<path d="M340 196 q12 -24 22 -2 q10 -20 20 0 q10 -16 18 2z" fill="#E8913A"/>`);
  const ctr = ctrSpot("bv_hboul", "The counter", "Baguettes, fougasse and tarts", "#3E6B8C", "#C9A27E", `${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${170 + i*10}" y="${214 + (i % 2)*4}" width="6" height="32" rx="3" fill="#D9A05A" ${O}/>`).join("")}<path d="M260 240 q20 -16 40 0 q-20 10 -40 0z" fill="#E3B47A" ${O}/><circle cx="330" cy="240" r="9" fill="#E8913A" ${O}/>`, "#C3DDF3");
  const edges = g(`<rect x="40" y="430" width="90" height="70" rx="4" fill="#C9A27E" ${O}/>${[0, 1, 2, 3, 4].map(i => `<rect x="${50 + i*16}" y="410" width="6" height="40" rx="3" fill="#D9A05A" ${O}/>`).join("")}`) + crateOf(440, 490, ["#D9A05A", "#E3B47A"]) + plant(470, 600, .8);
  return tiles() + back + edges + ctr + exit("#3E6B8C");
}
function nougatRoom(){
  const back = wall("#FBEFE0", {trim: "#C8643B"}) + shelfUnit(20, 30, 230, 160, 3, (x, y, w, r) => Array.from({length: 4}, (_, i) => `<rect x="${x + i*(w/4)}" y="${y - 16}" width="${w/4 - 6}" height="16" rx="2" fill="#FFFDF6" ${O}/>${[0, 1, 2].map(k => `<circle cx="${x + i*(w/4) + 8 + k*12}" cy="${y - 9}" r="2" fill="#D9A05A"/>`).join("")}`).join("")) + shelfUnit(270, 30, 230, 160, 3, (x, y, w, r) => Array.from({length: 6}, (_, i) => `<path d="M${x + i*(w/6)} ${y} l${w/12 - 2} -12 l${w/12 - 2} 12z" fill="#F3E7B0" ${O}/>`).join(""));
  const ctr = ctrSpot("bv_hnougat", "The nougat block", "Nougat and calissons", "#C8643B", "#F3E3C3", `<rect x="170" y="226" width="110" height="20" rx="3" fill="#FFFDF6" ${O}/>${Array.from({length: 8}, (_, i) => `<circle cx="${180 + i*13}" cy="236" r="2.2" fill="#D9A05A"/>`).join("")}<path d="M300 246 l20 -24 l4 3 l-18 22z" fill="#B9BEC4" ${O}/>`);
  const edges = g(`<rect x="40" y="440" width="90" height="60" rx="4" fill="#F4C7CF" ${O}/>`) + crateOf(440, 490, ["#F3E7B0", "#FFFDF6"]) + plant(470, 600, .8) + plant(50, 600, .7);
  return tiles() + back + edges + ctr + exit("#C8643B");
}
function cafeRoom(){
  const back = stoneWall("#F3E3C3") + win(30, 40, 180, 110, "valley") + shelfUnit(240, 30, 260, 160, 3, bottlesF(12, ["#5A7A3A", "#E3B04B", "#C8643B"])) + signText(130, 30, "CAFÉ DE LA PLACE", "#FFFDF6", "#5E7A4E", 9);
  const ctr = ctrSpot("bv_hcafe", "The zinc bar", "Citron pressé and croque-monsieur", "#9AA0A8", "#C9CFD4", `${[0, 1, 2].map(i => `<rect x="${180 + i*30}" y="226" width="12" height="20" rx="3" fill="#F3E3A0" ${O}/>`).join("")}<rect x="290" y="232" width="34" height="14" rx="3" fill="#E3B47A" ${O}/>`, "#DCEBC8");
  const edges = table(90, 470, 50, "#FFFDF6") + chair(56, 480, "#5E7A4E") + chair(124, 480, "#5E7A4E") + table(430, 470, 50, "#FFFDF6") + chair(396, 480, "#5E7A4E") + chair(464, 480, "#5E7A4E") + plant(470, 600, .8);
  return tiles() + back + edges + ctr + exit("#5E7A4E");
}

/* ---------- Rosehill ---------- */
function perfumeRoom(){
  const back = wall("#F3EEE6", {trim: "#7A5AA8", beams: true}) + frame(30, 40, 90, 110, "#F4C7CF", "#E8A0B4") + frame(400, 40, 90, 110, "#E6DCF3", "#9A7CC8") + g(sk(`<rect x="140" y="40" width="240" height="150" rx="6" style="fill:#8A5A3A"/>`, `<rect x="140" y="40" width="240" height="150" rx="6"/>`) + Array.from({length: 4}, (_, r) => Array.from({length: 14}, (_, i) => `<rect x="${150 + i*16}" y="${54 + r*34}" width="8" height="${14 - (i % 3)*2}" rx="2" fill="#8A6A42" ${O}/>`).join("")).join(""));
  const organ = spot("bv_hperfume", 260, 330, "The perfumer's organ", hovE(260, 320, 110, 16), sk(`<path d="M150 296 Q260 220 370 296z" style="fill:#5A3A2A"/><path d="M160 290 Q260 228 360 290" style="fill:none;stroke:#C9A27E" stroke-width="6"/>`, `<path d="M150 296 Q260 220 370 296z"/>`)
    + g(Array.from({length: 18}, (_, i) => { const a = Math.PI*(.1 + i*.045); return `<rect x="${260 - Math.cos(a)*92}" y="${296 - Math.sin(a)*58}" width="6" height="10" rx="1.4" fill="${["#E8A0B4", "#F3C969", "#B79BDC", "#9FD3C2", "#E3B04B"][i % 5]}" ${O}/>`; }).join("") + `${[0, 1, 2].map(i => `<rect x="${236 + i*14}" y="270" width="4" height="22" fill="#FFFDF6" ${O}/>`).join("")}`) + lab(260, 346, "Blend your own perfume", "#E6DCF3"));
  const edges = g(sk(`<ellipse cx="80" cy="470" rx="34" ry="28" style="fill:#C9784A"/><path d="M80 442 v-20 h30" style="fill:none;stroke:#C9784A" stroke-width="6"/>`, `<ellipse cx="80" cy="470" rx="34" ry="28"/>`)) + crateOf(440, 490, ["#F4C7CF", "#E8A0B4", "#FFFDF6"]) + plant(470, 600, .8);
  return floor(200, "#B98A5E") + back + edges + organ + exit("#7A5AA8");
}
function savonRoom(){
  const back = stoneWall() + shelfUnit(20, 30, 230, 160, 4, soaps) + shelfUnit(270, 30, 230, 160, 4, soaps);
  const ctr = ctrSpot("bv_hsavon", "The cutting table", "Soap, cut while you watch", "#8A6A52", "#E8D9B8", `<rect x="170" y="222" width="90" height="24" rx="2" fill="#C9D9A0" ${O}/><path d="M280 246 v-30 h30 v30" fill="none" stroke="#8A6A52" stroke-width="3"/><rect x="286" y="212" width="18" height="10" rx="2" fill="#B98A5E" ${O}/>`, "#F6D3DC");
  const edges = g(`<rect x="40" y="430" width="90" height="70" rx="3" fill="#C9A27E" ${O}/>${Array.from({length: 6}, (_, i) => `<rect x="${46 + (i % 3)*26}" y="${440 + Math.floor(i/3)*22}" width="22" height="16" fill="${["#E6DCF3", "#F4C7CF", "#F3E7B0"][i % 3]}" ${O}/>`).join("")}`) + crateOf(440, 490, ["#E6DCF3", "#C9D9A0"]) + plant(470, 600, .8);
  return tiles() + back + edges + ctr + exit("#8A6A52");
}
function glassRoom(){
  const back = wall("#D9CCB8", {trim: "#3A3430"}) + shelfUnit(20, 30, 180, 160, 3, (x, y, w, r) => Array.from({length: 6}, (_, i) => `<path d="M${x + 4 + i*(w/6)} ${y} q-4 -10 2 -16 v-6 h6 v6 q6 6 2 16z" fill="${["#9FD3C2", "#B79BDC", "#F3C969", "#E8A0B4", "#7FA8C8"][(i + r) % 5]}" opacity=".85" ${O}/>`).join(""))
    + g(sk(`<rect x="320" y="60" width="160" height="140" rx="10" style="fill:#8A7A6A"/><path d="M360 200 V140 Q400 100 440 140 V200z" style="fill:#F39A4A"/>`, `<rect x="320" y="60" width="160" height="140" rx="10"/>`) + `<path d="M370 196 q14 -30 30 -6 q14 -24 30 4" fill="#F3D34A"/>`);
  const ctr = spot("bv_hglass", 260, 330, "The glassblower's bench", hovE(260, 320, 110, 16), sk(`<rect x="160" y="250" width="200" height="40" rx="4" style="fill:#5A5A5A"/><path d="M180 240 L330 220" style="stroke:#9AA0A8" stroke-width="4"/>`, `<rect x="160" y="250" width="200" height="40" rx="4"/>`) + g(`<circle cx="334" cy="219" r="10" fill="#F39A4A"/><circle cx="334" cy="219" r="5" fill="#F3D34A"/>`) + lab(260, 346, "Bottles from the fire", "#FBE0B8"));
  const edges = crateOf(80, 490, ["#9FD3C2", "#B79BDC", "#F3C969"]) + g(`<rect x="420" y="440" width="60" height="60" rx="3" fill="#8A6A52" ${O}/>`) + plant(470, 600, .7);
  return floor(200, "#9A9484", "flags") + back + edges + ctr + exit("#3A3430");
}

/* ---------- Sunflower Hill ---------- */
function honeyRoom(){
  const back = stoneWall("#F3E3C3") + shelfUnit(20, 30, 230, 160, 4, honeyJars) + g(sk(`<rect x="290" y="40" width="200" height="140" style="fill:#CFE3EA"/>${[0, 1, 2].map(i => `<rect x="${304 + i*62}" y="56" width="52" height="110" style="fill:#E3B04B"/>${Array.from({length: 12}, (_, k) => `<path d="M${308 + i*62 + (k % 4)*12} ${64 + Math.floor(k/4)*30} l6 -4 l6 4 v8 l-6 4 l-6 -4z" style="fill:none;stroke:#C88A2A" stroke-width=".8"/>`).join("")}`).join("")}`, `<rect x="290" y="40" width="200" height="140"/>`));
  const ex = spot("bv_hhoney", 260, 330, "The honey extractor", hovE(260, 320, 110, 16), sk(`<rect x="200" y="210" width="120" height="86" rx="20" style="fill:#C9CFD4"/><ellipse cx="260" cy="212" rx="60" ry="12" style="fill:#B9BEC4"/><rect x="250" y="190" width="20" height="20" style="fill:#5A5A5A"/><path d="M320 270 h20 v24" style="fill:none;stroke:#B9BEC4" stroke-width="6"/>`, `<rect x="200" y="210" width="120" height="86" rx="20"/>`)
    + g(`<path d="M340 294 v6" stroke="#E3B04B" stroke-width="4"/><rect x="330" y="300" width="22" height="14" rx="3" fill="#E3B04B" ${O}/>`) + lab(260, 346, "Honey from the frames", "#FBE0B8"));
  const edges = g(`<rect x="40" y="430" width="90" height="70" rx="3" fill="#E3B04B" ${O}/>`) + crateOf(440, 490, ["#F3D98A", "#E3B04B"]) + plant(470, 600, .8);
  return tiles() + back + edges + ex + exit("#C88A2A");
}
function candleRoom(){
  const back = wall("#F6EEDC", {trim: "#C88A2A"}) + shelfUnit(20, 30, 230, 160, 3, candles) + shelfUnit(270, 30, 230, 160, 3, candles) + g(`<path d="M250 20 h20" stroke="#8A6A52" stroke-width="2"/>${[0, 1, 2].map(i => `<rect x="${252 + i*6}" y="22" width="3" height="40" fill="#F3D98A"/>`).join("")}`);
  const ctr = ctrSpot("bv_hcandle", "The rolling table", "Beeswax candles", "#C88A2A", "#F3D98A", `<rect x="170" y="230" width="80" height="16" fill="#F3D98A" ${O}/>${Array.from({length: 6}, (_, i) => `<path d="M${174 + i*12} 232 l4 -3 l4 3 v6 l-4 3 l-4 -3z" fill="none" stroke="#C88A2A" stroke-width=".8"/>`).join("")}${[0, 1, 2].map(i => `<rect x="${280 + i*16}" y="${216 - i*4}" width="8" height="${30 + i*4}" rx="2" fill="#F3D98A" ${O}/>`).join("")}`);
  const edges = crateOf(80, 490, ["#F3D98A", "#E3B04B"]) + g(`<rect x="420" y="440" width="60" height="60" rx="3" fill="#C9A27E" ${O}/>`) + plant(470, 600, .8);
  return floor(200, "#C9A27E") + back + edges + ctr + exit("#C88A2A");
}
function kitchenRoom(){
  const back = stoneWall("#F3E3C3") + g(sk(`<rect x="30" y="80" width="120" height="110" style="fill:#3A3430"/><rect x="40" y="96" width="100" height="10" style="fill:#5A5A5A"/>`, `<rect x="30" y="80" width="120" height="110"/>`)) + bunches(180, 340, 16, "#7E9A5A") + win(360, 40, 140, 110, "vines");
  const tableSpot = spot("bv_hkitchen", 260, 330, "The long kitchen table", hovE(260, 320, 120, 16), sk(`<rect x="140" y="250" width="240" height="44" rx="4" style="fill:#C9A27E"/>`, `<rect x="140" y="250" width="240" height="44" rx="4"/>`)
    + g(`<ellipse cx="200" cy="262" rx="26" ry="8" fill="#E3B47A" ${O}/><rect x="250" y="252" width="18" height="18" rx="3" fill="#E3B04B" ${O}/><path d="M300 270 q20 -14 40 0z" fill="#9CC45A" ${O}/>`) + lab(260, 346, "Odile's lunch", "#DCEBC8"));
  const edges = chair(120, 470, "#5E7A4E") + chair(400, 470, "#5E7A4E") + crateOf(80, 520, ["#F3C93A", "#E3B04B"]) + plant(470, 600, .9) + plant(50, 600, .7);
  return tiles() + back + edges + tableSpot + exit("#5E7A4E");
}

/* ---------- The Old Bridge ---------- */
function epicerieRoom(){
  const back = stoneWall("#F3E3C3") + shelfUnit(20, 30, 230, 160, 3, jars(6, ["#5A7A3A", "#C8643B", "#E3B04B"])) + g(`${[290, 320, 350, 380, 410, 440, 470].map((x, i) => `<path d="M${x} 14 v${20 + (i % 3)*8}" stroke="#8A6A52"/>${i % 2 ? `<ellipse cx="${x}" cy="${44 + (i % 3)*8}" rx="6" ry="14" fill="#A8574A" ${O}/>` : `<circle cx="${x}" cy="${42 + (i % 3)*8}" r="9" fill="#F3D98A" ${O}/>`}`).join("")}`);
  const ctr = ctrSpot("bv_hepicerie", "The counter", "A picnic basket, and things to fill it", "#5E7A4E", "#C9A27E", `<path d="M180 246 h50 l-4 -20 h-42z" fill="#C9A06A" ${O}/><path d="M190 226 q15 -16 30 0" fill="none" stroke="#8A6A42" stroke-width="2"/><ellipse cx="280" cy="240" rx="16" ry="6" fill="#F3D98A" ${O}/><rect x="310" y="226" width="12" height="20" rx="3" fill="#5A7A3A" ${O}/>`, "#DCEBC8");
  const edges = crateOf(80, 490, ["#9CC45A", "#5A7A3A", "#E3B04B"]) + crateOf(440, 490, ["#E8566C", "#F3A05A"]) + plant(470, 600, .8);
  return tiles() + back + edges + ctr + exit("#5E7A4E");
}
function glaceRoom(){
  const back = wall("#E6F2F4", {trim: "#E8A0B4"}) + win(30, 40, 180, 110, "water") + shelfUnit(240, 30, 260, 160, 3, jars(7, ["#FFFDF6", "#F4C7CF", "#E6DCF3"]));
  const ctr = spot("bv_hglace", 260, 330, "The gelato case", hovE(260, 320, 110, 16), sk(counter(150, 250, 220, "#E8A0B4", "#FFFDF6"), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(`<rect x="156" y="232" width="208" height="20" fill="#CFE3EA" opacity=".7" ${O}/>`) + tubs(160, 232, 200) + lab(260, 346, "Lavender, honey, apricot, melon", "#F6D3DC"));
  const edges = table(90, 470, 50, "#FFFDF6") + chair(56, 480, "#E8A0B4") + chair(124, 480, "#E8A0B4") + table(430, 470, 50, "#FFFDF6") + chair(396, 480, "#E8A0B4") + chair(464, 480, "#E8A0B4") + plant(470, 600, .8);
  return floor(200, "#FFFDF6", "flags") + back + edges + ctr + exit("#E8A0B4");
}
function millRoom(){
  const back = stoneWall() + g(sk(`<rect x="300" y="30" width="190" height="150" style="fill:#6E9E8A"/>`, `<rect x="300" y="30" width="190" height="150"/>`) + `<g class="tlspin"><circle cx="395" cy="105" r="60" fill="none" stroke="#8A6A52" stroke-width="8"/>${[0, 45, 90, 135].map(a => `<path d="M${395 - 60*Math.cos(a*Math.PI/180)} ${105 - 60*Math.sin(a*Math.PI/180)} L${395 + 60*Math.cos(a*Math.PI/180)} ${105 + 60*Math.sin(a*Math.PI/180)}" stroke="#8A6A52" stroke-width="5"/>`).join("")}</g>`) + shelfUnit(20, 30, 250, 160, 3, bottlesF(10, ["#5A7A3A", "#8A3A2E", "#E3D9A0"]));
  const ctr = ctrSpot("bv_hmill", "The bar", "Lunch by the mill wheel", "#5A3A2A", "#B98A5E", `${[0, 1, 2].map(i => `<path d="M${180 + i*30} 246 v-14 l6 -8 l6 8 v14z" fill="#E6DCC6" ${O}/>`).join("")}<ellipse cx="300" cy="240" rx="22" ry="6" fill="#FFFDF6" ${O}/>`);
  const edges = table(90, 470, 70, "#FFFDF6") + chair(50, 480, "#8A6A52") + chair(130, 480, "#8A6A52") + table(430, 470, 70, "#FFFDF6") + chair(394, 480, "#8A6A52") + chair(466, 480, "#8A6A52") + plant(50, 600, .8);
  return floor(200, "#9A9484", "flags") + back + edges + ctr + exit("#5A3A2A");
}

/* ---------- Chapel Hill ---------- */
function fromageRoom(){
  const back = g(`<rect width="520" height="200" fill="#F6F8F6"/><rect width="520" height="12" fill="#8A9A6A"/>`) + shelfUnit(20, 30, 230, 160, 4, goatCheeses) + shelfUnit(270, 30, 230, 160, 4, goatCheeses);
  const ctr = ctrSpot("bv_hfromage", "The cheese counter", "Goat's cheeses in chestnut leaves", "#FFFDF6", "#8A9A6A", `${[0, 1, 2].map(i => `<ellipse cx="${190 + i*34}" cy="240" rx="14" ry="6" fill="${["#FFF8EC", "#8A6A42", "#C9D9A0"][i]}" ${O}/>`).join("")}<path d="M290 246 q16 -20 34 0z" fill="#7A5A3A" ${O}/><path d="M298 238 h18" stroke="#E3D9A0" stroke-width="2"/>`, "#DCEBC8");
  const edges = g(`<rect x="40" y="440" width="90" height="60" rx="3" fill="#C9C4A0" ${O}/>`) + crateOf(440, 490, ["#FFF8EC", "#C9D9A0"]) + plant(470, 600, .7);
  return floor(200, "#E6E2DA", "flags") + back + edges + ctr + exit("#8A9A6A");
}
function bistroRoom(){
  const back = stoneWall("#F3E3C3") + g(`<path d="M0 20 Q130 50 260 20 T520 20" stroke="#6E8A4E" stroke-width="10" fill="none"/>${Array.from({length: 10}, (_, i) => `<circle cx="${30 + i*50}" cy="${30 + (i % 2)*8}" r="5" fill="#F3E3A0" ${O}/>`).join("")}`) + win(30, 60, 200, 110, "valley") + shelfUnit(270, 50, 230, 140, 3, bottlesF(10, ["#8A3A2E", "#E3D9A0", "#5A7A3A"]));
  const tbl = spot("bv_hbistro", 260, 330, "The long table", hovE(260, 320, 120, 16), sk(`<rect x="140" y="250" width="240" height="44" rx="4" style="fill:#FFFDF6"/>`, `<rect x="140" y="250" width="240" height="44" rx="4"/>`) + g(`${[0, 1, 2, 3].map(i => `<circle cx="${170 + i*60}" cy="268" r="11" fill="#FFFDF6" ${O}/><ellipse cx="${170 + i*60}" cy="268" rx="7" ry="4" fill="#E3B47A" ${O}/>`).join("")}`) + lab(260, 346, "Warm goat's cheese on toast", "#FBE0B8"));
  const edges = chair(120, 470, "#C8643B") + chair(400, 470, "#C8643B") + crateOf(80, 520, ["#9CC45A", "#E8566C"]) + plant(470, 600, .9) + plant(50, 600, .7);
  return tiles() + back + edges + tbl + exit("#C8643B");
}
function chapelRoom(){
  const back = g(`<rect width="520" height="640" fill="#F6F1E6"/><path d="M0 0 H520 V140 Q260 60 0 140z" fill="#3E5A8C"/>${Array.from({length: 24}, (_, i) => `<circle cx="${20 + (i*97) % 480}" cy="${16 + (i*31) % 90}" r="2" fill="#F3D98A"/>`).join("")}`) + g(`<rect x="240" y="150" width="40" height="40" rx="20" fill="#9CC4D0" ${O}/>`);
  const altar = spot("bv_hchapel", 260, 330, "The altar and the candles", hovE(260, 316, 90, 14), sk(`<rect x="210" y="210" width="100" height="80" style="fill:#E6DED0"/><rect x="206" y="204" width="108" height="10" style="fill:#C9BFA8"/>`, `<rect x="210" y="210" width="100" height="80"/>`)
    + g(`${[0, 1, 2, 3, 4].map(i => `<rect x="${224 + i*16}" y="${188 - (i % 2)*4}" width="6" height="${16 + (i % 2)*4}" fill="#FFFDF6" ${O}/><ellipse cx="${227 + i*16}" cy="${184 - (i % 2)*4}" rx="2.4" ry="4" fill="#F3C969"/>`).join("")}`) + lab(260, 346, "Light a candle", "#F6E3B4"));
  const pews = [[120, 400], [300, 400]].map(([x, y]) => g(sk(`<rect x="${x}" y="${y - 20}" width="100" height="40" rx="3" style="fill:#8A6A52"/>`, `<rect x="${x}" y="${y - 20}" width="100" height="40" rx="3"/>`))).join("");
  const rope = g(`<path d="M470 0 v460" stroke="#C9A06A" stroke-width="3"/><ellipse cx="470" cy="470" rx="6" ry="10" fill="#C8643B" ${O}/>`);
  return floor(200, "#E8D9B8", "flags") + back + pews + rope + altar + exit("#8A7A62");
}

const ROOMS = {bv_hpaper: paperRoomArt, bv_hstill: stillRoom, bv_hshop: lavShopRoom, bv_htea: teaRoom, bv_hboul: boulRoom, bv_hnougat: nougatRoom, bv_hcafe: cafeRoom,
  bv_hperfume: perfumeRoom, bv_hsavon: savonRoom, bv_hglass: glassRoom, bv_hhoney: honeyRoom, bv_hcandle: candleRoom, bv_hkitchen: kitchenRoom,
  bv_hepicerie: epicerieRoom, bv_hglace: glaceRoom, bv_hmill: millRoom, bv_hfromage: fromageRoom, bv_hbistro: bistroRoom, bv_hchapel: chapelRoom};
export const lavenderRoomArt = scene => (ROOMS[scene] || stillRoom)();
