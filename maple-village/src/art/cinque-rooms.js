// Cinque Terre's interiors (round 132): five rooms behind the doors in the four villages. Warm plaster, terracotta
// floors, dark beams, lemons and basil everywhere: the edges full, the middle calm and clear (the playbook).
//   ct_focacceria: the wood oven glowing at the back, trays of focaccia on the counter, flour sacks, a chalk menu
//   ct_pesto:      the long marble table with mortars, basil hanging from the beams, jars on shelves, a sea window
//   ct_cantina:    barrels along the walls, the tasting bar, the cane racks of drying grapes, bottles in the rack
//   ct_gelato:     the long glass counter of gelato tubs, the menu board, stools by the window, a cone stand
//   ct_limoni:     crates of lemons, a wall of limoncino bottles, linen and painted plates, tins of anchovies
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a couple of small touches too.
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#8A5A3A") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
const LEMON = "#F3D34A", BASIL = "#5E8A3A", TERRA = "#C9785A";
const plaster = (col = "#F3E2C4") => g(`<rect width="520" height="200" style="fill:${col}"/><rect y="0" width="520" height="14" style="fill:#6B5444"/>${[110, 270, 430].map(x => `<rect x="${x - 6}" y="0" width="12" height="200" style="fill:#7A5E48" opacity=".85"/>`).join("")}`);
const tiles = y0 => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${TERRA}"/>${Array.from({length: 40}, (_, i) => `<rect x="${(i % 8)*65}" y="${y0 + Math.floor(i/8)*92}" width="65" height="92" style="fill:none;stroke:#A85A3E" stroke-width="1.6"/>`).join("")}`;
const shelf = (x, y, w, items) => g(sk(`<rect x="${x}" y="${y}" width="${w}" height="7" style="fill:#8A6A52"/>${items}`, `<rect x="${x}" y="${y}" width="${w}" height="7"/>`));
const bottles = (x, y, n, col, cap = "#5A3A2E") => Array.from({length: n}, (_, i) => `<rect x="${x + i*12}" y="${y - 22}" width="9" height="22" rx="3" style="fill:${col}"/><rect x="${x + i*12 + 2.5}" y="${y - 27}" width="4" height="6" style="fill:${cap}"/>`).join("");
const jars = (x, y, n, col) => Array.from({length: n}, (_, i) => `<rect x="${x + i*16}" y="${y - 16}" width="13" height="16" rx="2" style="fill:${col}"/><rect x="${x + i*16 - 1}" y="${y - 19}" width="15" height="4" rx="1" style="fill:#C9A27E"/>`).join("");
const crate = (x, y, fill, n = 3) => g(sk(`<rect x="${x - 20}" y="${y - 16}" width="40" height="16" style="fill:#C9A27E"/>${Array.from({length: n}, (_, i) => `<ellipse cx="${x - 12 + i*12}" cy="${y - 17}" rx="5" ry="4" style="fill:${fill}"/>`).join("")}`, `<rect x="${x - 20}" y="${y - 16}" width="40" height="16"/>`));
const barrel = (x, y, s = 1) => g(sk(`<ellipse cx="${x}" cy="${y}" rx="${20*s}" ry="${26*s}" style="fill:#8A5A3A"/><path d="M${x - 19*s} ${y - 10*s} h${38*s} M${x - 19*s} ${y + 10*s} h${38*s}" style="stroke:#5A3A2E" stroke-width="2.4"/><ellipse cx="${x}" cy="${y}" rx="${6*s}" ry="${6*s}" style="fill:#6B4430"/>`, `<ellipse cx="${x}" cy="${y}" rx="${20*s}" ry="${26*s}"/>`));
const basilBunch = (x, y) => g(`<path d="M${x} ${y} v10" style="stroke:#6B5444" stroke-width="1"/>${[[-5, 14], [0, 18], [5, 14], [-3, 22], [3, 22]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="4" ry="6" style="fill:${BASIL};stroke:var(--line)" stroke-width=".6"/>`).join("")}`);
const stool = (x, y, col = "#C9483A") => g(sk(`<ellipse cx="${x}" cy="${y}" rx="12" ry="5" style="fill:${col}"/><path d="M${x - 8} ${y + 2} l-3 16 M${x + 8} ${y + 2} l3 16" style="stroke:#6B5444" stroke-width="2"/>`, `<ellipse cx="${x}" cy="${y}" rx="12" ry="5"/>`));
const seaWindow = (x, y, w, h) => g(sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#4F9CC4"/><path d="M${x} ${y + h*.55} H${x + w}" style="stroke:#7FBCD8" stroke-width="2"/><rect x="${x}" y="${y}" width="${w}" height="${h*.5}" style="fill:#BFE0F2"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x + w/2} ${y} V${y + h}"/>`));

/* ---------- the focacceria ---------- */
function focacceriaRoom(){
  const wall = plaster("#F3DCC0")
    // the wood oven: a domed brick mouth glowing orange
    + g(sk(`<path d="M300 200 V110 Q300 40 400 40 Q500 40 500 110 V200z" style="fill:#C9785A"/><path d="M350 200 V150 Q350 112 400 112 Q450 112 450 150 V200z" style="fill:#3A2A20"/><path d="M362 200 Q380 160 400 168 Q420 160 438 200z" style="fill:#F28C28"/>`, `<path d="M300 200 V110 Q300 40 400 40 Q500 40 500 110 V200"/><path d="M350 200 V150 Q350 112 400 112 Q450 112 450 150 V200"/>`)) + lampGlow(400, 180, 40)
    + g(sk(`<rect x="30" y="40" width="110" height="80" style="fill:#2F3A34"/>`, `<rect x="30" y="40" width="110" height="80"/>`) + `<text x="85" y="66" text-anchor="middle" font-family="Klee One,serif" font-size="10" fill="#FFFDF6">Focaccia</text><text x="85" y="84" text-anchor="middle" font-family="Klee One,serif" font-size="8" fill="#FFFDF6">plain · onion · olive</text><text x="85" y="100" text-anchor="middle" font-family="Klee One,serif" font-size="8" fill="#FFFDF6">farinata · 3</text>`)
    + shelf(160, 120, 120, `${[0, 1, 2, 3].map(i => `<ellipse cx="${178 + i*28}" cy="114" rx="12" ry="6" style="fill:#E8C27A"/>`).join("")}`);
  // the counter, trays of focaccia (the baker takes orders here)
  const counter = spot("ct_focacceria", 260, 330, "The focaccia counter", hovE(400, 320, 100, 16),
    sk(`<rect x="300" y="236" width="200" height="90" rx="4" style="fill:#8A6A52"/><rect x="296" y="230" width="208" height="10" rx="3" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<rect x="${310 + i*64}" y="244" width="56" height="30" rx="3" style="fill:#E8C27A"/>${Array.from({length: 6}, (_, k) => `<circle cx="${318 + i*64 + (k % 3)*16}" cy="${252 + Math.floor(k/3)*12}" r="2" style="fill:#C9A24A"/>`).join("")}`).join("")}`, `<rect x="300" y="236" width="200" height="90" rx="4"/>`)
    + lab(400, 346, "Focaccia counter", "#FBE0B8", 10));
  const edges = g(sk(`<rect x="30" y="260" width="80" height="150" rx="3" style="fill:#8A6A52"/>${[0, 1, 2, 3].map(r => `<rect x="36" y="${272 + r*34}" width="68" height="6" style="fill:#6B5444"/><ellipse cx="54" cy="${268 + r*34}" rx="12" ry="5" style="fill:#E8C27A"/><ellipse cx="84" cy="${268 + r*34}" rx="12" ry="5" style="fill:#D9B06A"/>`).join("")}`, `<rect x="30" y="260" width="80" height="150" rx="3"/>`))
    + g(sk(`<rect x="180" y="430" width="160" height="34" rx="4" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<circle cx="${210 + i*50}" cy="430" r="6" style="fill:#FFFDF6"/>`).join("")}`, `<rect x="180" y="430" width="160" height="34" rx="4"/>`)) + stool(200, 490) + stool(320, 490, "#3E6BAE")
    + g(sk(`<rect x="430" y="540" width="40" height="50" rx="6" style="fill:#E6DED0"/><rect x="470" y="550" width="36" height="40" rx="6" style="fill:#E6DED0"/>`, `<rect x="430" y="540" width="40" height="50" rx="6"/><rect x="470" y="550" width="36" height="40" rx="6"/>`))   // flour sacks
    + g(sk(`<rect x="34" y="540" width="56" height="40" rx="3" style="fill:#8A6A52"/><ellipse cx="62" cy="540" rx="24" ry="6" style="fill:#E8D3A0"/>`, `<rect x="34" y="540" width="56" height="40" rx="3"/>`));   // a crate of chickpeas
  return tiles(200) + wall + edges + counter + exit();
}

/* ---------- the pesto kitchen ---------- */
function pestoRoom(){
  const wall = plaster("#EEF0DC") + seaWindow(180, 40, 160, 110)
    + g([60, 90, 120, 380, 410, 440, 470].map(x => basilBunch(x, 14)).join(""))
    + shelf(30, 150, 120, jars(40, 150, 6, BASIL)) + shelf(380, 150, 120, jars(390, 150, 6, "#F3E7C8"));
  // the long marble table with a row of mortars (Nonna Pina's lesson)
  const table = spot("ct_pesto", 260, 420, "Make pesto with Nonna Pina", hovE(260, 410, 130, 18),
    sk(`<rect x="140" y="330" width="240" height="66" rx="4" style="fill:#EDEAE4"/>${[0, 1, 2, 3].map(i => `<path d="M${168 + i*56} 350 q0 26 18 26 q18 0 18 -26z" style="fill:#FFFDF6"/><ellipse cx="${186 + i*56}" cy="350" rx="18" ry="5" style="fill:#7FA35A"/><path d="M${196 + i*56} 346 l10 -18" style="stroke:#8A6A52" stroke-width="4"/>`).join("")}`, `<rect x="140" y="330" width="240" height="66" rx="4"/>`)
    + lab(260, 420, "Pesto with Nonna Pina", "#DCEBC8", 10));
  const edges = g(sk(`<rect x="30" y="260" width="60" height="150" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(r => `<rect x="34" y="${280 + r*44}" width="52" height="6" style="fill:#6B5444"/>${[0, 1, 2].map(c => `<circle cx="${42 + c*16}" cy="${274 + r*44}" r="5" style="fill:${["#5E8A3A", "#F3E7C8", "#C9A27E"][c]}"/>`).join("")}`).join("")}`, `<rect x="30" y="260" width="60" height="150" rx="3"/>`))
    + g(sk(`<rect x="430" y="260" width="60" height="150" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(r => `<rect x="434" y="${280 + r*44}" width="52" height="6" style="fill:#6B5444"/>${bottles(440, 280 + r*44, 3, "#C9C25A")}`).join("")}`, `<rect x="430" y="260" width="60" height="150" rx="3"/>`))   // olive oil
    + crate(80, 560, BASIL) + crate(440, 560, "#F3E7C8") + g(sk(`<rect x="200" y="520" width="120" height="30" rx="4" style="fill:#C9A27E"/><ellipse cx="230" cy="520" rx="14" ry="5" style="fill:#E8C27A"/><ellipse cx="290" cy="520" rx="14" ry="5" style="fill:#F3E7C8"/>`, `<rect x="200" y="520" width="120" height="30" rx="4"/>`));   // cheese and pine nuts
  return tiles(200) + wall + edges + table + exit("#3E5E4A");
}

/* ---------- the cantina ---------- */
function cantinaRoom(){
  const wall = plaster("#E8D9C0")
    + g([60, 120, 400, 460].map(x => barrel(x, 160, 1.1)).join(""))
    // the cane racks of drying grapes (the Sciacchetrà raisins)
    + g(sk(`<rect x="170" y="40" width="180" height="120" style="fill:#C9B07A"/>${Array.from({length: 4}, (_, r) => `<path d="M170 ${66 + r*28} H350" style="stroke:#A8915A" stroke-width="2"/>${Array.from({length: 8}, (_, c) => `<ellipse cx="${184 + c*21}" cy="${58 + r*28}" rx="7" ry="9" style="fill:${(r + c) % 3 ? "#C9B05A" : "#8A6A3A"}"/>`).join("")}`).join("")}`, `<rect x="170" y="40" width="180" height="120"/>`));
  // the tasting bar (Signor Bruno: tastings, and the harvest)
  const bar = spot("ct_cantina", 260, 360, "The tasting bar", hovE(260, 344, 100, 16),
    sk(`<rect x="180" y="280" width="160" height="50" rx="4" style="fill:#6B4430"/><rect x="176" y="276" width="168" height="8" rx="3" style="fill:#C9A27E"/>${bottles(196, 276, 3, "#C98A2E")}${[270, 296, 322].map(x => `<path d="M${x} 262 l-4 -12 h8z M${x} 262 v10" style="fill:#FFFDF6;stroke:#3A3430" stroke-width=".8"/>`).join("")}`, `<rect x="180" y="280" width="160" height="50" rx="4"/>`)
    + lab(260, 360, "Tasting bar", "#E8D3BC", 10));
  const edges = g(sk(`<rect x="30" y="250" width="80" height="250" rx="3" style="fill:#5A3A2E"/>${Array.from({length: 7}, (_, r) => Array.from({length: 3}, (_, c) => `<circle cx="${46 + c*24}" cy="${270 + r*32}" r="8" style="fill:${(r + c) % 2 ? "#4E7A5A" : "#C98A2E"}"/>`).join("")).join("")}`, `<rect x="30" y="250" width="80" height="250" rx="3"/>`))   // the bottle rack
    + g([450, 450].map((x, i) => barrel(x, 300 + i*90, 1)).join("")) + crate(420, 560, "#5A3A6E") + crate(100, 560, "#C9B05A");
  return tiles(200) + wall + edges + bar + exit("#5A3A2E");
}

/* ---------- the gelateria ---------- */
function gelatoRoom(){
  const wall = plaster("#FBE3E3")
    + g(sk(`<rect x="160" y="34" width="200" height="90" rx="4" style="fill:#FFFDF6"/>`, `<rect x="160" y="34" width="200" height="90" rx="4"/>`) + `<text x="260" y="56" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="12" fill="#C9483A">GELATO</text>${["basilico · limone · fico", "pistacchio · nocciola", "fragola · cioccolato"].map((t, i) => `<text x="260" y="${76 + i*16}" text-anchor="middle" font-family="Klee One,serif" font-size="9" fill="#2F2B28">${t}</text>`).join("")}`)
    + seaWindow(30, 40, 100, 100) + seaWindow(390, 40, 100, 100);
  // the long glass counter of gelato tubs (Gianni scoops)
  const counter = spot("ct_gelato", 260, 330, "The gelato counter", hovE(260, 316, 130, 16),
    sk(`<rect x="120" y="230" width="280" height="64" rx="4" style="fill:#E6E2DA"/><rect x="124" y="234" width="272" height="30" style="fill:#EAF6FA"/>${["#7FA35A", "#F3D34A", "#8C5A7A", "#A8C98A", "#B98A5A", "#E8566C", "#5A3A2A"].map((c, i) => `<path d="M${132 + i*38} 262 q15 -18 30 0z" style="fill:${c}"/>`).join("")}`, `<rect x="120" y="230" width="280" height="64" rx="4"/>`)
    + lab(260, 316, "Gelato counter", "#F6D3DC", 10));
  const edges = stool(60, 480) + stool(100, 500, "#3E6BAE") + stool(420, 480, "#F3D34A") + stool(460, 500)
    + g(sk(`<rect x="30" y="250" width="50" height="120" rx="3" style="fill:#8A6A52"/>${Array.from({length: 4}, (_, r) => `<path d="M40 ${270 + r*26} l8 16 l8 -16z" style="fill:#E8C48E"/>`).join("")}`, `<rect x="30" y="250" width="50" height="120" rx="3"/>`))   // the cone stand
    + g(sk(`<rect x="440" y="250" width="50" height="120" rx="3" style="fill:#FFFDF6"/>${Array.from({length: 3}, (_, r) => `<rect x="446" y="${260 + r*36}" width="38" height="26" rx="2" style="fill:${["#7FA35A", "#F3D34A", "#8C5A7A"][r]}"/>`).join("")}`, `<rect x="440" y="250" width="50" height="120" rx="3"/>`));   // the freezer of tubs to take away
  return tiles(200) + wall + edges + counter + exit("#C9483A");
}

/* ---------- the lemon shop ---------- */
function limoniRoom(){
  const wall = plaster("#FFF4C8")
    + shelf(30, 60, 220, bottles(40, 60, 16, LEMON, "#FFFDF6")) + shelf(30, 120, 220, bottles(40, 120, 16, LEMON, "#FFFDF6"))
    + g(sk(`<rect x="290" y="34" width="200" height="140" rx="3" style="fill:#FFFDF6"/>${[0, 1, 2].map(i => `<circle cx="${330 + i*60}" cy="74" r="22" style="fill:#3E6BAE"/><circle cx="${330 + i*60}" cy="74" r="12" style="fill:${LEMON}"/><rect x="${306 + i*60}" y="120" width="44" height="40" style="fill:${["#FFFDF6", "#F3E7A0", "#E6EEF6"][i]}"/><path d="M${310 + i*60} 130 h36 M${310 + i*60} 142 h36" style="stroke:${LEMON}" stroke-width="2"/>`).join("")}`, `<rect x="290" y="34" width="200" height="140" rx="3"/>`));   // plates and linen
  // the counter (Signora Franca: the shop)
  const counter = spot("ct_limoni", 260, 450, "The lemon shop counter", hovE(260, 440, 100, 16),
    sk(`<rect x="180" y="380" width="160" height="44" rx="4" style="fill:#8A6A52"/><rect x="176" y="376" width="168" height="8" rx="3" style="fill:#C9A27E"/>${Array.from({length: 6}, (_, i) => `<ellipse cx="${200 + i*24}" cy="372" rx="6" ry="5" style="fill:${LEMON}"/>`).join("")}`, `<rect x="180" y="380" width="160" height="44" rx="4"/>`)
    + lab(260, 450, "The counter", "#FBF0B8", 10));
  const edges = crate(60, 300, LEMON) + crate(60, 360, LEMON) + crate(60, 420, LEMON) + crate(460, 300, "#9FC3D9") + crate(460, 360, LEMON)
    + g(sk(`<rect x="430" y="440" width="60" height="60" rx="3" style="fill:#8A6A52"/>${Array.from({length: 6}, (_, i) => `<rect x="${436 + (i % 3)*17}" y="${448 + Math.floor(i/3)*22}" width="14" height="10" rx="2" style="fill:#9FC3D9"/>`).join("")}`, `<rect x="430" y="440" width="60" height="60" rx="3"/>`))   // tins of anchovies
    + g(sk(`<rect x="34" y="470" width="60" height="30" rx="3" style="fill:#F3E7A0"/><rect x="38" y="460" width="52" height="12" rx="3" style="fill:#FFF8D0"/>`, `<rect x="34" y="470" width="60" height="30" rx="3"/>`));   // lemon soap
  return tiles(200) + wall + edges + counter + exit("#4E7A5A");
}

export function cinqueRoomArt(scene){
  return scene === "ct_focacceria" ? focacceriaRoom() : scene === "ct_pesto" ? pestoRoom() : scene === "ct_cantina" ? cantinaRoom() : scene === "ct_gelato" ? gelatoRoom() : limoniRoom();
}
