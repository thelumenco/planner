// The Tablelands' rooms (round 158): three behind the doors of every stop, in the high country's colours: timber and
// tin, rainforest greens, cream dairy tiles, red earth. Like the Vines' and the Coast's rooms (art/bellbird-rooms.js,
// whose helpers these share): busy round the edges, the middle of the floor clear, and one thing in the middle of the
// back to tap (data-rdspot = the room's id: core.js roomSpot opens its panel).
import { sk } from "./scenes.js";
import { rLab as lab, rG as g, rSpot as spot, rHov as hovE, rExit as exit, rWall as wall, rFloor as floor, rWin as win, rShelf as shelfUnit, rJars as jars, rBottles as bottlesF, rCounter as counter, rTable as table, rChair as chair, rPlant as plant, rCrate as crateOf, rFrame as frame, rSign as signText } from "./bellbird-rooms.js";

const O = `stroke="#3a2e28" stroke-width=".6"`;
const ctrSpot = (id, aria, label, col, top, extra = "", labCol = "#FBE0B8", ty = 330) => spot(id, 260, ty, aria, hovE(260, 320, 110, 16), sk(counter(150, 250, 220, col, top), `<rect x="150" y="250" width="220" height="46" rx="4"/>`) + g(extra) + lab(260, 346, label, labCol));
const armchair = (x, y, col) => g(sk(`<rect x="${x - 20}" y="${y - 20}" width="40" height="30" rx="8" style="fill:${col}"/><rect x="${x - 24}" y="${y - 12}" width="8" height="22" rx="4" style="fill:${col}"/><rect x="${x + 16}" y="${y - 12}" width="8" height="22" rx="4" style="fill:${col}"/>`, `<rect x="${x - 20}" y="${y - 20}" width="40" height="30" rx="8"/>`));
const stove = (x, y) => g(sk(`<rect x="${x}" y="${y}" width="60" height="70" rx="6" style="fill:#3A3430"/><rect x="${x + 12}" y="${y + 24}" width="36" height="28" rx="4" style="fill:#E8913A"/><rect x="${x + 24}" y="${y - 80}" width="12" height="80" style="fill:#4A4440"/>`, `<rect x="${x}" y="${y}" width="60" height="70" rx="6"/>`)
  + `<path d="M${x + 20} ${y + 48} q6 -14 10 0 q4 -10 8 0" fill="#F3C969"/>`);
const bowls = (x, y, w, r) => Array.from({length: 4}, (_, i) => `<path d="M${x + 4 + i*(w/4)} ${y - 12} q${w/8 - 4} 14 ${w/4 - 8} 0z" fill="${["#A8574A", "#C9A06A", "#8A5A3A", "#D9B48A"][(i + r) % 4]}" ${O}/>`).join("");
const books = (x, y, w, r) => Array.from({length: Math.floor(w/9)}, (_, i) => `<rect x="${x + i*9}" y="${y - 14 - (i*7 + r) % 5}" width="7" height="${14 + (i*7 + r) % 5}" fill="${["#A8443A", "#3E6B8C", "#5E8A4E", "#C9A24A", "#7A5A8A", "#E8D9B8"][(i + r*2) % 6]}"/>`).join("");
const lollyJars = (x, y, w, r) => Array.from({length: 6}, (_, i) => `<rect x="${x + i*(w/6)}" y="${y - 22}" width="${w/6 - 4}" height="22" rx="3" fill="#E6F2F4" ${O}/><rect x="${x + i*(w/6) + 2}" y="${y - 14}" width="${w/6 - 8}" height="12" rx="2" fill="${["#E8566C", "#F3C969", "#9FD3C2", "#B9A2DC", "#F4A0A0", "#9CC45A"][(i + r) % 6]}"/>`).join("");
const cheeses = (x, y, w, r) => Array.from({length: 4}, (_, i) => `<ellipse cx="${x + 14 + i*(w/4)}" cy="${y - 8}" rx="${w/8 - 3}" ry="8" fill="${["#F3D98A", "#E8C060", "#F3E7B0"][(i + r) % 3]}" ${O}/>`).join("");
const bags = (x, y, w, r) => Array.from({length: 5}, (_, i) => `<path d="M${x + i*(w/5)} ${y} v-18 l4 -4 h${w/5 - 14} l4 4 v18z" fill="#D9C49A" ${O}/><rect x="${x + i*(w/5) + 3}" y="${y - 12}" width="${w/5 - 12}" height="6" fill="#FFFDF6"/>`).join("");
const teacups = (x, y, w, r) => Array.from({length: 4}, (_, i) => `<path d="M${x + i*(w/4)} ${y - 10} h16 q0 10 -8 10 q-8 0 -8 -10z" fill="${["#F4C7CF", "#BFD4E2", "#FFFDF6", "#C3E8B8"][(i + r) % 4]}" ${O}/>`).join("");
const sacks = (x, y, n = 3) => g(sk(Array.from({length: n}, (_, i) => `<path d="M${x + i*22 - 9} ${y - (i % 2)*12} q-3 -22 9 -24 q12 2 9 24z" style="fill:#D9C49A"/>`).join(""), ``));
const cassowary = (x, y) => g(sk(`<ellipse cx="${x}" cy="${y - 30}" rx="24" ry="22" style="fill:#2F2B28"/><path d="M${x + 14} ${y - 46} q6 -24 4 -40" style="fill:none;stroke:#3E86AE" stroke-width="8"/><circle cx="${x + 18}" cy="${y - 88}" r="7" style="fill:#3E86AE"/><path d="M${x + 14} ${y - 94} l4 -10 l6 10z" style="fill:#B9824E"/><path d="M${x + 14} ${y - 60} q-4 8 2 12" style="fill:#C8432F"/><rect x="${x - 40}" y="${y - 6}" width="80" height="8" style="fill:#8A6A52"/>`, `<ellipse cx="${x}" cy="${y - 30}" rx="24" ry="22"/>`) + `<path d="M${x - 6} ${y - 10} v6 M${x + 6} ${y - 10} v6" stroke="#8A8A8A" stroke-width="2"/>`);
const kayakRack = (x, y) => g(sk([0, 1, 2].map(i => `<ellipse cx="${x}" cy="${y + i*26}" rx="90" ry="8" style="fill:${["#E8566C", "#F3C969", "#3E86AE"][i]}"/>`).join("") + `<rect x="${x - 96}" y="${y - 14}" width="6" height="70" style="fill:#6B5444"/><rect x="${x + 90}" y="${y - 14}" width="6" height="70" style="fill:#6B5444"/>`, ``));
const paddle = (x, y, col) => g(`<path d="M${x} ${y} v-90" stroke="#8A6A52" stroke-width="3"/><ellipse cx="${x}" cy="${y - 96}" rx="7" ry="14" fill="${col}" ${O}/>`);
const cowBail = (x, y) => g(sk(`<ellipse cx="${x}" cy="${y}" rx="26" ry="16" style="fill:#FFFDF6"/><ellipse cx="${x - 8}" cy="${y - 4}" rx="9" ry="6" style="fill:#2F2B28"/><ellipse cx="${x + 12}" cy="${y + 4}" rx="6" ry="4" style="fill:#2F2B28"/>`, `<ellipse cx="${x}" cy="${y}" rx="26" ry="16"/>`) + `<path d="M${x - 30} ${y - 22} v44 M${x + 30} ${y - 22} v44" stroke="#9AA0A8" stroke-width="3"/>`);
const tinCeiling = (col = "#E6DED0") => g(`<rect width="520" height="40" fill="${col}"/>${Array.from({length: 26}, (_, i) => `<rect x="${i*20 + 4}" y="8" width="12" height="12" rx="2" fill="none" stroke="#C9BFA8" stroke-width="1"/><circle cx="${i*20 + 10}" cy="28" r="3" fill="none" stroke="#C9BFA8" stroke-width="1"/>`).join("")}`);

/* ---------- Misty Falls ---------- */
function cafeRoom(){
  const back = wall("#DCE8D0", {boards: true, trim: "#5A6A4E"}) + win(40, 40, 170, 110, "valley") + g(`<ellipse cx="125" cy="100" rx="80" ry="10" fill="#FFFFFF" opacity=".6"/>`) + stove(420, 120) + shelfUnit(250, 30, 140, 150, 3, jars(5, ["#E3B04B", "#C2334D", "#FFFDF6"]));
  const ctr = ctrSpot("bv_tcafe", "The pie warmer", "Pies and scones", "#5A6A4E", "#C9A27E", `<rect x="166" y="222" width="80" height="26" rx="3" fill="#CFE3EA" opacity=".8" ${O}/>${[0, 1, 2].map(i => `<ellipse cx="${182 + i*24}" cy="240" rx="9" ry="5" fill="#C98A4A" ${O}/>`).join("")}<rect x="280" y="232" width="56" height="16" fill="#FFFDF6" ${O}/>`);
  const edges = table(90, 470, 70, "#E8D9B8") + chair(50, 480) + chair(130, 480) + table(430, 470, 70, "#E8D9B8") + chair(394, 480) + chair(466, 480) + plant(470, 600, .9) + plant(50, 600, .8);
  return floor(200, "#B98A5E") + back + edges + ctr + exit("#5A6A4E");
}
function rangerRoom(){
  const back = wall("#C9C49A", {boards: true, trim: "#4E6A4A"}) + frame(30, 30, 220, 140, "#B9D19A", "#9CC47A") + g(`<circle cx="120" cy="80" r="12" fill="#5E9EC4" ${O}/><path d="M60 140 q40 -20 80 0 t80 -10" stroke="#B8644A" stroke-width="3" fill="none"/>`) + signText(140, 26, "THE TABLELAND", "#FFFDF6", "#4E6A4A", 9)
    + shelfUnit(280, 40, 120, 140, 3, jars(4, ["#8A6A42", "#C9A06A", "#5E8A4E"])) + cassowary(460, 196);
  const ctr = ctrSpot("bv_tranger", "The ranger's desk", "The ranger's desk", "#6B5444", "#B98A5E", `<rect x="180" y="226" width="60" height="20" fill="#FFFDF6" ${O}/><rect x="270" y="230" width="22" height="16" fill="#E3B04B" ${O}/><path d="M310 246 v-22 l14 6 l-14 6" fill="#C8432F" ${O}/>`, "#DCEBC8");
  const edges = g(sk(`<rect x="40" y="430" width="90" height="70" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(i => `<rect x="${48 + i*26}" y="440" width="20" height="30" fill="${["#9CC45A", "#F3C969", "#3E86AE"][i]}"/>`).join("")}`, `<rect x="40" y="430" width="90" height="70" rx="3"/>`)) + crateOf(440, 490, ["#8A6A42", "#C9A06A", "#5E5A3E"]) + plant(470, 600, 1) + plant(60, 600, .8);
  return floor(200, "#A88A6A") + back + edges + ctr + exit("#4E6A4A");
}
function galleryRoom(){
  const back = wall("#F6F3EC", {trim: "#5E8A9A"}) + frame(30, 40, 110, 80, "#CFE8F0", "#7FA868") + frame(160, 30, 90, 110, "#E3EEF0", "#9CC47A") + frame(270, 50, 110, 70, "#F3E3C3", "#B8644A") + frame(400, 40, 90, 90, "#DCE8D0", "#5E9EC4")
    + g(sk([0, 1, 2, 3].map(i => `<path d="M${60 + i*120} 186 q10 -16 24 -10 q4 -10 10 -4 l-6 6 q-8 12 -28 8z" style="fill:${["#C9785A", "#5E8A4E", "#3E86AE", "#E3B04B"][i]}"/>`).join(""), ``));
  const ctr = ctrSpot("bv_tgallery", "The gallery desk", "Paintings and carvings", "#5E8A9A", "#DCE8D0", `<rect x="190" y="230" width="24" height="18" fill="#C9785A" ${O}/><circle cx="300" cy="238" r="9" fill="#B8644A" ${O}/>`, "#C3E8DA");
  const wheel = g(sk(`<rect x="410" y="470" width="70" height="30" rx="4" style="fill:#8A9098"/><ellipse cx="445" cy="466" rx="26" ry="8" style="fill:#B9BEC4"/><path d="M432 466 q13 -24 26 0" style="fill:#C9785A"/>`, `<rect x="410" y="470" width="70" height="30" rx="4"/>`));
  const edges = g(sk(`<rect x="40" y="440" width="80" height="60" rx="3" style="fill:#E8D9B8"/>`, `<rect x="40" y="440" width="80" height="60" rx="3"/>`) + `<path d="M56 440 q10 -18 22 -4 q6 -10 12 -2" fill="#5E8A4E" ${O}/>`) + wheel + plant(470, 600, .8) + plant(50, 600, .9);
  return floor(200, "#C9B89A") + back + edges + ctr + exit("#5E8A9A");
}

/* ---------- Crater Lake ---------- */
function boatRoom(){
  const back = wall("#B98A5E", {boards: true, trim: "#8A3A2E"}) + kayakRack(130, 70) + win(300, 40, 190, 110, "water") + paddle(250, 190, "#E8566C") + paddle(270, 190, "#F3C969");
  const ctr = ctrSpot("bv_tboat", "The hire counter", "Kayaks and paddles", "#8A3A2E", "#C9A27E", `<rect x="176" y="224" width="60" height="22" fill="#2F3A34" ${O}/><text x="206" y="239" text-anchor="middle" font-size="7" fill="#FFFDF6">OUT: 3</text><path d="M290 246 h40 v-14 q-20 -10 -40 0z" fill="#E8913A" ${O}/>`, "#F6D3DC");
  const edges = g(sk(`<rect x="40" y="430" width="90" height="70" rx="3" style="fill:#E8913A"/>${[0, 1, 2].map(i => `<path d="M${50 + i*26} 440 h18 v50 h-18z" style="fill:${["#E8566C", "#F3C969", "#3E86AE"][i]}"/>`).join("")}`, `<rect x="40" y="430" width="90" height="70" rx="3"/>`)) + crateOf(440, 490, ["#F3C969", "#E8566C"]) + plant(470, 600, .8);
  return floor(200, "#8A6A52") + back + edges + ctr + exit("#8A3A2E");
}
function lakeHouseRoom(){
  const back = wall("#F3EAD6", {trim: "#3E6B5A", beams: true}) + win(30, 40, 200, 120, "water") + win(250, 40, 130, 120, "water") + g(sk(`<rect x="400" y="60" width="100" height="140" style="fill:#B0A48A"/><rect x="420" y="120" width="60" height="70" rx="20" style="fill:#3A3430"/><path d="M432 182 q8 -20 14 0 q6 -14 12 0" style="fill:#E8913A"/>`, `<rect x="400" y="60" width="100" height="140"/>`));
  const ctr = ctrSpot("bv_tlake", "The counter", "Pancakes and hot chocolate", "#3E6B5A", "#C9A27E", `${[0, 1, 2].map(i => `<ellipse cx="${186 + i*22}" cy="${244 - i*4}" rx="14" ry="4" fill="#E3B47A" ${O}/>`).join("")}<path d="M290 246 h22 v-16 h-22z" fill="#8A5A3A" ${O}/><path d="M320 246 h22 v-16 h-22z" fill="#8A5A3A" ${O}/>`);
  const edges = armchair(80, 480, "#C8432F") + armchair(440, 480, "#3E6B5A") + g(`<rect x="60" y="500" width="40" height="6" fill="#E8D9B8"/>`) + plant(470, 600, .9) + plant(50, 600, .8);
  return floor(200, "#B98A5E") + back + edges + ctr + exit("#3E6B5A");
}
function turnerRoom(){
  const back = wall("#D9C49A", {boards: true, trim: "#5A3A2E"}) + shelfUnit(20, 30, 200, 160, 3, bowls) + shelfUnit(300, 30, 200, 160, 3, bowls) + g(`<path d="M240 40 v150 M250 50 v140" stroke="#8A6A52" stroke-width="3"/>`);
  const lathe = spot("bv_tturner", 260, 330, "The lathe", hovE(260, 320, 110, 16), sk(`<rect x="160" y="240" width="200" height="40" rx="4" style="fill:#5A5A5A"/><rect x="170" y="280" width="16" height="24" style="fill:#3A3A3A"/><rect x="334" y="280" width="16" height="24" style="fill:#3A3A3A"/><rect x="190" y="226" width="40" height="18" rx="3" style="fill:#3E6B5A"/><ellipse cx="270" cy="236" rx="22" ry="12" style="fill:#A8574A"/>`, `<rect x="160" y="240" width="200" height="40" rx="4"/>`)
    + g(`<path d="M246 252 q10 6 4 14 M292 252 q-8 8 -2 14 M300 270 q6 4 2 10" stroke="#E3B47A" stroke-width="2" fill="none"/>`) + lab(260, 346, "Bowls from the rainforest", "#FBE0B8"));
  const edges = g(`${[[60, 480], [90, 500], [440, 490], [470, 470]].map(([x, y]) => `<path d="M${x} ${y} q8 -6 14 0 q-6 6 -14 0z" fill="#E3B47A"/>`).join("")}`) + crateOf(80, 500, ["#A8574A", "#C9A06A", "#8A5A3A"]) + crateOf(440, 500, ["#D9B48A", "#8A5A3A"]) + plant(470, 600, .8);
  return floor(200, "#C9A06A") + back + edges + lathe + exit("#5A3A2E");
}

/* ---------- Willow Bend ---------- */
function bakehouseRoom(){
  const back = wall("#E8D4C0", {trim: "#8A3A2E"}) + g(sk(`<path d="M30 200 V90 Q30 30 110 30 Q190 30 190 90 V200z" style="fill:#A8574A"/><path d="M60 200 V110 Q60 70 110 70 Q160 70 160 110 V200z" style="fill:#2F2420"/><path d="M80 196 q10 -30 20 -4 q10 -24 20 0 q8 -18 16 4z" style="fill:#E8913A"/>`, `<path d="M30 200 V90 Q30 30 110 30 Q190 30 190 90 V200z"/>`))
    + shelfUnit(220, 30, 280, 160, 3, (x, y, w, r) => Array.from({length: 6}, (_, i) => `<ellipse cx="${x + 20 + i*(w/6)}" cy="${y - 7}" rx="17" ry="8" fill="${["#D9A05A", "#C98A4A", "#E3B47A"][(i + r) % 3]}" ${O}/>`).join(""));
  const ctr = ctrSpot("bv_tbakery", "The glass case", "Bread, lamingtons and finger buns", "#FFFDF6", "#E6DCC6", `<rect x="156" y="258" width="208" height="30" fill="#CFE3EA" opacity=".6"/>${[0, 1, 2, 3, 4].map(i => i % 2 ? `<rect x="${170 + i*40}" y="266" width="18" height="16" fill="#8A5A3A" ${O}/>` : `<ellipse cx="${178 + i*40}" cy="274" rx="14" ry="6" fill="#F4C7CF" ${O}/>`).join("")}`);
  const edges = g(`<rect x="40" y="430" width="90" height="70" fill="#E6DCC6" ${O}/><path d="M50 440 h70 M50 460 h70 M50 480 h70" stroke="#C9A27E" stroke-width="3"/>`) + g(`<ellipse cx="85" cy="425" rx="40" ry="5" fill="#FFFFFF" opacity=".8"/>`) + crateOf(440, 490, ["#D9A05A", "#E3B47A"]) + plant(470, 600, .9);
  return floor(200, "#C9A27E", "flags") + back + edges + ctr + exit("#8A3A2E");
}
function lollyRoom(){
  const back = wall("#FBE6EC", {trim: "#E8566C"}) + shelfUnit(10, 20, 240, 176, 4, lollyJars) + shelfUnit(270, 20, 240, 176, 4, lollyJars) + g(`<path d="M250 10 l30 190 M270 10 l30 190" stroke="#8A6A52" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${253 + i*5} ${30 + i*30} h20" stroke="#8A6A52" stroke-width="2"/>`).join("")}`);
  const ctr = ctrSpot("bv_tlolly", "The counter and the scale", "Lollies by the bag", "#E8566C", "#FBE6EC", `<path d="M190 246 h40 l-6 -16 h-28z" fill="#B9BEC4" ${O}/><rect x="196" y="222" width="28" height="8" rx="2" fill="#E6F2F4" ${O}/>${[0, 1, 2].map(i => `<path d="M${280 + i*20} 246 v-18 l4 -4 h8 l4 4 v18z" fill="#FFFDF6" ${O}/>`).join("")}`, "#F6D3DC");
  const edges = g(sk(`<rect x="40" y="430" width="90" height="70" rx="6" style="fill:#F4C7CF"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${54 + (i % 3)*30}" cy="${450 + Math.floor(i/3)*30}" r="9" style="fill:${["#E8566C", "#F3C969", "#9FD3C2", "#B9A2DC", "#F4A0A0", "#9CC45A"][i]}"/>`).join("")}`, `<rect x="40" y="430" width="90" height="70" rx="6"/>`)) + crateOf(440, 490, ["#E8566C", "#F3C969", "#9FD3C2"]) + plant(470, 600, .8);
  return floor(200, "#FFFDF6", "flags") + back + edges + ctr + exit("#E8566C");
}
function booksRoom(){
  const back = wall("#9A5A44", {trim: "#3E3A2E", beams: true}) + shelfUnit(10, 20, 160, 176, 5, books) + shelfUnit(180, 20, 160, 176, 5, books) + shelfUnit(350, 20, 160, 176, 5, books)
    + g(`<ellipse cx="420" cy="58" rx="14" ry="7" fill="#E8913A" ${O}/><circle cx="430" cy="52" r="5" fill="#E8913A" ${O}/><path d="M427 47 l1 -4 l3 3 M432 47 l2 -4 l2 4" fill="#E8913A" stroke="#3a2e28" stroke-width=".5"/><text x="440" y="46" font-size="8" fill="#FFFDF6" opacity=".8">z</text>`);
  const ctr = ctrSpot("bv_tbooks", "The till desk", "Second-hand books", "#3E3A2E", "#B98A5E", `<rect x="180" y="226" width="34" height="20" fill="#C9A24A" ${O}/>${[0, 1, 2, 3].map(i => `<rect x="${260 + i*12}" y="${230 - i*3}" width="10" height="${16 + i*3}" fill="${["#A8443A", "#3E6B8C", "#5E8A4E", "#C9A24A"][i]}" ${O}/>`).join("")}`);
  const edges = armchair(80, 480, "#5E8A4E") + armchair(440, 480, "#A8443A") + g(`<rect x="430" y="440" width="24" height="6" fill="#3E6B8C"/>`) + plant(470, 600, .9) + plant(50, 600, .8);
  return floor(200, "#8A6A52") + back + edges + ctr + exit("#3E3A2E");
}

/* ---------- Greenhill Dairy ---------- */
function milkRoom(){
  const back = wall("#E6E2DA", {trim: "#3E6B5A"}) + cowBail(70, 150) + cowBail(190, 150) + cowBail(330, 150) + cowBail(450, 150) + g(sk(`<rect x="230" y="20" width="60" height="30" rx="6" style="fill:#C8432F"/><circle cx="276" cy="35" r="8" style="fill:#3A3430"/>`, `<rect x="230" y="20" width="60" height="30" rx="6"/>`)) + g(`<path d="M246 14 l4 -10 M262 14 l-2 -10" stroke="#3a2e28"/><text x="300" y="30" font-size="10" fill="#3E6B5A">♪</text>`);
  const pit = spot("bv_tmilk", 260, 380, "The milking pit", hovE(260, 372, 110, 16), sk(`<rect x="120" y="300" width="280" height="60" rx="4" style="fill:#9AA0A8"/><rect x="132" y="310" width="256" height="40" rx="3" style="fill:#7A8088"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${150 + i*44} 300 q-6 -20 4 -36" style="fill:none;stroke:#3a2e28" stroke-width="2"/><rect x="${146 + i*44}" y="262" width="10" height="8" rx="2" style="fill:#B9BEC4"/>`).join("")}`, `<rect x="120" y="300" width="280" height="60" rx="4"/>`) + lab(260, 392, "Milking at three", "#C3DDF3"));
  const edges = g(sk(`<rect x="40" y="440" width="70" height="60" rx="30" style="fill:#D9DDE0"/>`, `<rect x="40" y="440" width="70" height="60" rx="30"/>`)) + g(sk(`<rect x="420" y="440" width="60" height="60" rx="4" style="fill:#3E6B5A"/><path d="M430 450 h40 M430 466 h40" style="stroke:#FFFDF6" stroke-width="2"/>`, `<rect x="420" y="440" width="60" height="60" rx="4"/>`)) + plant(60, 600, .7);
  return floor(200, "#C9C4BA", "flags") + back + edges + pit + exit("#3E6B5A");
}
function cheeseRoom(){
  const back = g(`<rect width="520" height="200" fill="#F6F8F8"/>${Array.from({length: 14}, (_, i) => `<path d="M0 ${12 + i*14} H520" stroke="#DDE6E8" stroke-width="1"/>`).join("")}${Array.from({length: 26}, (_, i) => `<path d="M${i*20} 0 V200" stroke="#DDE6E8" stroke-width="1"/>`).join("")}<rect width="520" height="12" fill="#E3B04B"/>`)
    + shelfUnit(20, 30, 200, 160, 4, cheeses) + shelfUnit(300, 30, 200, 160, 4, cheeses);
  const vat = spot("bv_tcheese", 260, 330, "The cheese vat", hovE(260, 320, 110, 16), sk(`<rect x="150" y="236" width="220" height="60" rx="18" style="fill:#C9CFD4"/><rect x="160" y="230" width="200" height="14" rx="6" style="fill:#F3EAD0"/><path d="M180 296 v14 M340 296 v14" style="stroke:#8A9098" stroke-width="4"/>`, `<rect x="150" y="236" width="220" height="60" rx="18"/>`)
    + g(`<path d="M300 230 q20 -30 40 -10" stroke="#8A6A52" stroke-width="3" fill="none"/>`) + lab(260, 346, "Cheese making today", "#F6E3B4"));
  const edges = g(sk(`<rect x="40" y="440" width="90" height="60" rx="3" style="fill:#B9BEC4"/>`, `<rect x="40" y="440" width="90" height="60" rx="3"/>`) + `${[0, 1, 2].map(i => `<circle cx="${58 + i*26}" cy="464" r="10" fill="#FFFDF6" ${O}/>`).join("")}`) + crateOf(440, 490, ["#F3D98A", "#E8C060"]) + plant(470, 600, .7);
  return floor(200, "#E6E2DA", "flags") + back + edges + vat + exit("#E3B04B");
}
function farmShopRoom(){
  const back = wall("#F3EAD6", {boards: true, trim: "#5A6A4E"}) + g(sk(`<rect x="20" y="30" width="170" height="160" rx="6" style="fill:#E6EEF2"/>${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5].map(i => `<rect x="${32 + i*26}" y="${48 + r*48}" width="14" height="34" rx="5" style="fill:#FFFDF6"/><rect x="${32 + i*26}" y="${48 + r*48}" width="14" height="8" style="fill:${["#3E86AE", "#C8432F", "#E3B04B"][r]}"/>`).join("")).join("")}`, `<rect x="20" y="30" width="170" height="160" rx="6"/>`))
    + win(220, 40, 140, 100, "vines") + g(`<ellipse cx="270" cy="120" rx="10" ry="6" fill="#FFFDF6" ${O}/><ellipse cx="310" cy="124" rx="10" ry="6" fill="#FFFDF6" ${O}/>`) + shelfUnit(380, 30, 120, 160, 3, cheeses);
  const ctr = ctrSpot("bv_tshop", "The counter", "Milk, cheese and milkshakes", "#FFFDF6", "#5A6A4E", `<ellipse cx="190" cy="242" rx="20" ry="6" fill="#F3D98A" ${O}/><rect x="270" y="210" width="40" height="36" rx="4" fill="#B9BEC4" ${O}/><rect x="282" y="226" width="12" height="20" rx="3" fill="#F4C7CF" ${O}/>`, "#FBE0B8");
  const edges = table(90, 470, 70, "#FFFDF6") + chair(50, 480, "#5A6A4E") + chair(130, 480, "#5A6A4E") + table(430, 470, 70, "#FFFDF6") + chair(394, 480, "#5A6A4E") + chair(466, 480, "#5A6A4E") + g(`<ellipse cx="84" cy="462" rx="5" ry="3" fill="#2F2B28"/><ellipse cx="436" cy="462" rx="5" ry="3" fill="#2F2B28"/>`) + plant(470, 600, .8);
  return floor(200, "#C9A27E") + back + edges + ctr + exit("#5A6A4E");
}

/* ---------- Nutwood Farm ---------- */
function crackRoom(){
  const back = wall("#B9BEC4", {trim: "#5A4636"}) + g(Array.from({length: 26}, (_, i) => `<path d="M${i*20 + 10} 12 V200" stroke="#A0A6AE" stroke-width="1.4"/>`).join("")) + sacks(60, 196, 4) + sacks(400, 196, 4);
  const machine = spot("bv_tcrack", 260, 330, "The cracker", hovE(260, 320, 110, 16), sk(`<rect x="170" y="200" width="180" height="96" rx="6" style="fill:#3E6B5A"/><path d="M230 200 l10 -60 h40 l10 60z" style="fill:#5A5A5A"/><circle cx="210" cy="250" r="22" style="fill:#8A9098"/><circle cx="310" cy="250" r="22" style="fill:#8A9098"/><path d="M340 280 l40 20 h-10" style="fill:none;stroke:#5A5A5A" stroke-width="6"/>`, `<rect x="170" y="200" width="180" height="96" rx="6"/>`)
    + g(`<g class="tlspin"><path d="M210 232 v36 M192 250 h36" stroke="#3a2e28" stroke-width="3"/></g><g class="tlspin"><path d="M310 232 v36 M292 250 h36" stroke="#3a2e28" stroke-width="3"/></g>${[[372, 300], [384, 296], [376, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#E8D9B8" ${O}/>`).join("")}`) + lab(260, 346, "Clatter, clatter, crack", "#FBE0B8"));
  const edges = sacks(70, 500, 3) + g(`${[[420, 480], [450, 490], [470, 470], [440, 500]].map(([x, y]) => `<path d="M${x} ${y} q6 -6 12 0 q-6 6 -12 0z" fill="#8A6A42"/>`).join("")}`) + crateOf(450, 500, ["#E8D9B8", "#D9C49A"]) + plant(470, 600, .7);
  return floor(200, "#9A9484", "flags") + back + edges + machine + exit("#5A4636");
}
function nutCafeRoom(){
  const back = wall("#F3EAD6", {boards: true, trim: "#7A3A2E"}) + win(30, 40, 200, 110, "vines") + g([60, 110, 160, 200].map(x => `<ellipse cx="${x}" cy="118" rx="18" ry="12" fill="#3E6E42"/>`).join("")) + shelfUnit(260, 30, 240, 160, 3, jars(6, ["#E8D9B8", "#9CC45A", "#C9A0C0"]));
  const ctr = ctrSpot("bv_tnutcafe", "The counter", "Macadamia slice and finger-lime soda", "#7A3A2E", "#C9A27E", `<rect x="170" y="230" width="60" height="16" fill="#E3B47A" ${O}/>${[0, 1, 2].map(i => `<circle cx="${180 + i*18}" cy="228" r="3.4" fill="#E8D9B8" ${O}/>`).join("")}${[0, 1].map(i => `<rect x="${290 + i*22}" y="222" width="14" height="24" rx="4" fill="#CFE8C0" ${O}/>`).join("")}`);
  const edges = table(90, 470, 70, "#FFFDF6") + chair(50, 480, "#5E8A4E") + chair(130, 480, "#5E8A4E") + table(430, 470, 70, "#FFFDF6") + chair(394, 480, "#5E8A4E") + chair(466, 480, "#5E8A4E") + plant(470, 600, .8) + plant(50, 600, .9);
  return floor(200, "#B98A5E") + back + edges + ctr + exit("#7A3A2E");
}
function packRoom(){
  const back = wall("#D9CBB0", {boards: true, trim: "#5A3A2E"}) + shelfUnit(20, 30, 220, 160, 3, bags) + shelfUnit(280, 30, 220, 160, 3, (x, y, w, r) => Array.from({length: 3}, (_, i) => `<rect x="${x + i*(w/3)}" y="${y - 20}" width="${w/3 - 6}" height="20" fill="#C9A27E" ${O}/>${Array.from({length: 4}, (_, k) => `<ellipse cx="${x + i*(w/3) + 10 + k*14}" cy="${y - 22}" rx="5" ry="2" fill="#9CC45A" ${O}/>`).join("")}`).join(""));
  const ctr = spot("bv_tpack", 260, 330, "The sorting table", hovE(260, 320, 110, 16), sk(`<rect x="150" y="240" width="220" height="50" rx="4" style="fill:#B98A5E"/><rect x="160" y="246" width="200" height="38" rx="3" style="fill:#E8D9B8"/>`, `<rect x="150" y="240" width="220" height="50" rx="4"/>`)
    + g(`${Array.from({length: 18}, (_, i) => `<circle cx="${170 + (i*23) % 180}" cy="${254 + (i*7) % 24}" r="3.4" fill="#8A6A42" ${O}/>`).join("")}<path d="M330 240 h30 l-4 -14 h-22z" fill="#B9BEC4" ${O}/>`) + lab(260, 346, "Nuts by the bag", "#DCEBC8"));
  const edges = sacks(70, 500, 3) + crateOf(440, 490, ["#9CC45A", "#C9A0C0"]) + plant(470, 600, .7);
  return floor(200, "#A88A6A") + back + edges + ctr + exit("#5A3A2E");
}

/* ---------- Kingsreef ---------- */
function ticketRoom(){
  const back = wall("#F3E7C8", {boards: true, trim: "#B8443A"}) + frame(30, 40, 90, 70, "#E8D9B8", "#B0A48A") + frame(140, 30, 70, 90, "#E8D9B8", "#C9B89A") + frame(400, 40, 90, 70, "#E8D9B8", "#B0A48A")
    + g(sk(`<rect x="230" y="40" width="150" height="130" style="fill:#8A5A3A"/><rect x="250" y="60" width="110" height="70" rx="40" style="fill:#CFE3EA"/><path d="M250 100 h110" style="stroke:#C9A24A" stroke-width="2"/>`, `<rect x="230" y="40" width="150" height="130"/>`)) + signText(305, 34, "TICKETS", "#FFFDF6", "#B8443A", 9);
  const ctr = ctrSpot("bv_tticket", "The ticket window", "Tickets and old treasures", "#8A5A3A", "#C9A27E", `<rect x="176" y="228" width="34" height="18" fill="#C9A24A" ${O}/><path d="M240 246 h30 v-10 h-6 l-4 -8 h-10z" fill="#3A3430" ${O}/><rect x="300" y="210" width="16" height="36" rx="3" fill="#F3E3A0" ${O}/>`);
  const edges = g(sk(`<rect x="40" y="440" width="80" height="60" rx="3" style="fill:#2E5A3E"/><circle cx="62" cy="500" r="10" style="fill:#2F2B28"/><circle cx="98" cy="500" r="10" style="fill:#2F2B28"/>`, `<rect x="40" y="440" width="80" height="60" rx="3"/>`)) + g(sk(`<rect x="420" y="430" width="60" height="70" rx="3" style="fill:#8A6A52"/>${[0, 1].map(i => `<rect x="${430 + i*24}" y="440" width="16" height="22" rx="3" style="fill:#F3E3A0"/>`).join("")}`, `<rect x="420" y="430" width="60" height="70" rx="3"/>`)) + plant(470, 600, .7);
  return floor(200, "#B98A5E") + back + edges + ctr + exit("#B8443A");
}
function pubRoom(){
  const back = tinCeiling() + g(`<rect y="40" width="520" height="160" fill="#E8D4B0"/><rect y="40" width="520" height="10" fill="#8A3A2E"/>`) + shelfUnit(150, 60, 220, 120, 3, bottlesF(12, ["#5A7A3A", "#8A3A2E", "#C9A24A"])) + frame(30, 60, 100, 80, "#E8D9B8", "#C9A24A")
    + g(`<circle cx="80" cy="96" r="6" fill="#F3C969" ${O}/><path d="M66 110 q14 -8 28 0" stroke="#5A3A2E" stroke-width="2" fill="none"/>`) + frame(390, 60, 100, 80, "#E8D9B8", "#B0A48A");
  const ctr = ctrSpot("bv_tpub", "The long cedar bar", "Sarsaparilla and pub lunches", "#8A3A2E", "#B98A5E", `${[0, 1, 2, 3].map(i => `<rect x="${180 + i*44}" y="226" width="12" height="20" rx="3" fill="${i % 2 ? "#8A3A2E" : "#E3B04B"}" ${O}/>`).join("")}`);
  const piano = g(sk(`<rect x="400" y="430" width="90" height="70" rx="3" style="fill:#3A2E28"/><rect x="404" y="476" width="82" height="10" style="fill:#FFFDF6"/>`, `<rect x="400" y="430" width="90" height="70" rx="3"/>`) + Array.from({length: 10}, (_, i) => `<rect x="${406 + i*8}" y="476" width="4" height="6" fill="#2F2B28"/>`).join(""));
  const edges = table(90, 470, 70, "#C9A27E") + chair(50, 480, "#8A3A2E") + chair(130, 480, "#8A3A2E") + piano + plant(50, 600, .8);
  return floor(200, "#8A6A52") + back + edges + ctr + exit("#8A3A2E");
}
function antiqueRoom(){
  const back = wall("#E8E0F0", {trim: "#5A3A2E"}) + shelfUnit(20, 30, 200, 160, 3, teacups) + shelfUnit(300, 30, 200, 160, 3, (x, y, w, r) => r === 0 ? `<path d="M${x + 10} ${y} v-20 h20 l10 -16 h-10 l-6 16" fill="#C9A24A" ${O}/><circle cx="${x + 70}" cy="${y - 10}" r="9" fill="#F3E3A0" ${O}/><rect x="${x + 110}" y="${y - 22}" width="40" height="22" fill="#8A5A3A" ${O}/>` : teacups(x, y, w, r))
    + g(`<path d="M240 40 h40 l-10 30 h-20z" fill="#C9A24A" ${O}/><path d="M250 70 v20" stroke="#3a2e28"/><rect x="240" y="90" width="40" height="20" fill="#8A5A3A" ${O}/>`);
  const ctr = ctrSpot("bv_tantique", "The counter", "Curios, teacups and gold pans", "#5A3A2E", "#C9A27E", `<ellipse cx="190" cy="240" rx="18" ry="6" fill="#8A7A6A" ${O}/><rect x="270" y="226" width="20" height="20" fill="#C9A24A" ${O}/><path d="M310 246 l6 -18 h8 l6 18z" fill="#B9BEC4" ${O}/>`, "#F6D3DC");
  const horse = g(sk(`<path d="M410 500 q30 10 60 0" style="fill:none;stroke:#8A5A3A" stroke-width="5"/><ellipse cx="440" cy="466" rx="26" ry="12" style="fill:#F3E7C8"/><path d="M462 460 q12 -22 4 -34 l-12 8 z" style="fill:#F3E7C8"/><path d="M420 476 l-6 20 M460 476 l6 20" style="stroke:#8A5A3A" stroke-width="4"/>`, `<ellipse cx="440" cy="466" rx="26" ry="12"/>`) + `<path d="M458 432 q6 -4 10 4" stroke="#C8432F" stroke-width="3" fill="none"/>`);
  const edges = g(sk(`<rect x="40" y="440" width="80" height="60" rx="3" style="fill:#8A5A3A"/><path d="M80 440 l-10 -40 q20 -10 30 10z" style="fill:#C9A24A"/>`, `<rect x="40" y="440" width="80" height="60" rx="3"/>`)) + horse + plant(470, 600, .7) + plant(50, 600, .8);
  return floor(200, "#A88A6A") + back + edges + ctr + exit("#5A3A2E");
}

const ROOMS = {bv_tcafe: cafeRoom, bv_tranger: rangerRoom, bv_tgallery: galleryRoom, bv_tboat: boatRoom, bv_tlake: lakeHouseRoom, bv_tturner: turnerRoom,
  bv_tbakery: bakehouseRoom, bv_tlolly: lollyRoom, bv_tbooks: booksRoom, bv_tmilk: milkRoom, bv_tcheese: cheeseRoom, bv_tshop: farmShopRoom,
  bv_tcrack: crackRoom, bv_tnutcafe: nutCafeRoom, bv_tpack: packRoom, bv_tticket: ticketRoom, bv_tpub: pubRoom, bv_tantique: antiqueRoom};
export const tablelandsRoomArt = scene => (ROOMS[scene] || cafeRoom)();
