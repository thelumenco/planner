// Kyoto's interiors (round 123): five rooms behind the doors on the lane, the temple and the river. Tatami and paper,
// dark wood and candlelight: the edges full (shelves, alcoves, cushions, lanterns, plants), the middle calm and clear.
//   kt_tea:     the tea house: tatami, shoji open on a little garden, a scroll and flowers in the alcove, the kettle
//   kt_hall:    the temple hall: a golden altar in candlelight, the great bell, the meditation corner by the moss garden
//   kt_sweets:  the sweet shop: glass cases of seasonal wagashi, wooden moulds on the wall, Mr Tanaka's counter
//   kt_market:  the covered market: four stalls (pickles, tofu, omelette, knives), lanterns, crates, steam
//   kt_pottery: the pottery: the wheel, shelves of cups, the kiln glowing, a cat on a sack of clay
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a few small touches too.
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#6B5444") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
const tatami = y0 => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:#D9CF9A"/>${Array.from({length: 5}, (_, r) => Array.from({length: 4}, (_, c) => `<rect x="${c*130 + (r % 2)*65 - 65}" y="${y0 + r*92}" width="130" height="92" style="fill:none;stroke:#3E5E4A" stroke-width="3"/>`).join("")).join("")}`;
const boards = (y0, col = "#8A6A52", line = "#6B5444") => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${col}"/>${Array.from({length: 14}, (_, r) => `<path d="M0 ${y0 + r*34} H520" style="stroke:${line}" stroke-width="1.2"/>`).join("")}`;
const shoji = (x, y, w, h) => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#FBF3DF"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${Array.from({length: Math.floor(w/22)}, (_, i) => `<path d="M${x + 22 + i*22} ${y} V${y + h}" stroke-width=".8"/>`).join("")}${Array.from({length: Math.floor(h/26)}, (_, i) => `<path d="M${x} ${y + 26 + i*26} H${x + w}" stroke-width=".8"/>`).join("")}`);
const cushion = (x, y, col = "#7A3A4A") => g(sk(`<rect x="${x - 15}" y="${y - 7}" width="30" height="13" rx="4" style="fill:${col}"/>`, `<rect x="${x - 15}" y="${y - 7}" width="30" height="13" rx="4"/>`));
const paperLantern = (x, y, col = "#FBF3DF") => lampGlow(x, y + 8, 24) + g(`<path d="M${x} ${y - 8} v4" style="stroke:#2F2B28"/><ellipse cx="${x}" cy="${y + 8}" rx="9" ry="12" style="fill:${col};stroke:var(--line)" stroke-width="1"/><path d="M${x - 8} ${y + 3} h16 M${x - 9} ${y + 9} h18 M${x - 8} ${y + 15} h16" style="stroke:#C9A27E" stroke-width=".6"/>`);
const bonsai = (x, y) => g(sk(`<rect x="${x - 14}" y="${y - 8}" width="28" height="8" rx="2" style="fill:#3E5E7A"/><path d="M${x} ${y - 8} q-4 -10 4 -16" style="fill:none;stroke:#5A4636" stroke-width="3"/><ellipse cx="${x + 4}" cy="${y - 28}" rx="14" ry="7" style="fill:#5E8A48"/><ellipse cx="${x - 8}" cy="${y - 20}" rx="9" ry="5" style="fill:#6E9A44"/>`, `<rect x="${x - 14}" y="${y - 8}" width="28" height="8" rx="2"/><ellipse cx="${x + 4}" cy="${y - 28}" rx="14" ry="7"/>`));
const crate = (x, y, fill) => g(sk(`<rect x="${x - 18}" y="${y - 18}" width="36" height="18" style="fill:#B98A5A"/>${fill ? [0, 1, 2].map(i => `<circle cx="${x - 9 + i*9}" cy="${y - 18}" r="4.4" style="fill:${fill}"/>`).join("") : ""}`, `<rect x="${x - 18}" y="${y - 18}" width="36" height="18"/>`));
const seasonFlower = () => ({spring: "#F6C7D6", summer: "#B9A8E0", autumn: "#E0782E", winter: "#C8432F"})[seasonOf(dayKey())];

/* ---------- the tea house ---------- */
function teaRoom(){
  const wall = g(`<rect width="520" height="200" style="fill:#E8DCC0"/><rect y="0" width="520" height="16" style="fill:#4A3A2E"/><rect y="192" width="520" height="8" style="fill:#4A3A2E"/>`)
    // the shoji slid open on a little garden: a stone lantern, a maple, a trickle of water
    + shoji(20, 36, 110, 150) + g(sk(`<rect x="140" y="36" width="180" height="150" style="fill:#BFD8A8"/><path d="M140 150 q90 -20 180 6 V186 H140z" style="fill:#9DB87A"/><path d="M180 186 q30 -30 70 -10" style="fill:none;stroke:#8FC3D8" stroke-width="5"/><rect x="270" y="100" width="10" height="40" style="fill:#B9B0A4"/><path d="M262 100 h26 l-5 -8 h-16z" style="fill:#CFC8BA"/>`, `<rect x="140" y="36" width="180" height="150"/>`)
      + `<circle cx="200" cy="80" r="26" style="fill:${seasonFlower()};stroke:var(--line)" stroke-width="1" opacity=".85"/>`)
    // the alcove: a hanging scroll, one branch in a vase
    + g(sk(`<rect x="350" y="30" width="150" height="162" style="fill:#D9CDB0"/><rect x="398" y="44" width="54" height="110" style="fill:#FBF3DF"/><path d="M416 70 q10 20 -2 46 M432 64 q-6 24 6 50" style="fill:none;stroke:#2F2B28" stroke-width="3"/><path d="M380 176 q-4 -18 8 -22 q10 4 6 22z" style="fill:#5E7A8A"/><path d="M386 156 q-10 -30 -24 -40" style="fill:none;stroke:#5A4636" stroke-width="2"/>`, `<rect x="350" y="30" width="150" height="162"/><rect x="398" y="44" width="54" height="110"/>`)
      + `<circle cx="364" cy="118" r="5" style="fill:${seasonFlower()};stroke:var(--line)" stroke-width=".8"/><circle cx="372" cy="130" r="4" style="fill:${seasonFlower()};stroke:var(--line)" stroke-width=".8"/>`);
  // the host's mat: the sunken hearth with the kettle, the tea things laid out
  const mat = spot("kt_tea", 380, 440, "The tea ceremony with Sachiko", hovE(380, 380, 90, 22),
    sk(`<rect x="300" y="340" width="160" height="80" rx="4" style="fill:#E3D7A6"/><rect x="330" y="356" width="40" height="40" style="fill:#5A4636"/><path d="M336 362 q14 -16 28 0 v20 h-28z" style="fill:#3A3430"/><path d="M362 362 l10 -8" style="stroke:#3A3430" stroke-width="2"/><ellipse cx="410" cy="380" rx="16" ry="7" style="fill:#5E7A4A"/><rect x="426" y="368" width="8" height="18" rx="2" style="fill:#C9A27E"/>`, `<rect x="300" y="340" width="160" height="80" rx="4"/>`)
    + `<path class="smoke" d="M350 350 q-4 -8 0 -14 q4 -6 0 -12" fill="none" style="stroke:#FFFDF6" stroke-width="1.6" opacity=".7"/>` + lab(380, 438, "Tea with Sachiko", "#DCEBC8", 10));
  const edges = cushion(140, 300) + cushion(200, 300) + cushion(110, 470, "#3E5E7A") + cushion(150, 520, "#3E5E7A") + paperLantern(60, 220) + paperLantern(470, 222) + bonsai(470, 590) + g(sk(`<rect x="34" y="560" width="70" height="40" rx="3" style="fill:#6B5444"/>${[0, 1, 2].map(i => `<ellipse cx="${50 + i*20}" cy="558" rx="7" ry="4" style="fill:${["#5E7A4A", "#C9A27E", "#3E5E7A"][i]}"/>`).join("")}`, `<rect x="34" y="560" width="70" height="40" rx="3"/>`));
  return tatami(200) + wall + edges + mat + exit("#4A3A2E");
}

/* ---------- the temple hall ---------- */
function hallRoom(){
  const floor = boards(200, "#6B5444", "#5A4636");
  const wall = g(`<rect width="520" height="200" style="fill:#3A2E26"/>${[40, 140, 380, 480].map(x => `<rect x="${x - 8}" y="0" width="16" height="200" style="fill:#8E3A2A"/>`).join("")}<rect y="0" width="520" height="14" style="fill:#2A221C"/>`)
    // the altar: gold in candlelight
    + g(sk(`<rect x="180" y="60" width="160" height="130" style="fill:#5A4636"/><path d="M260 72 q-26 10 -26 48 h52 q0 -38 -26 -48z" style="fill:#D9A93A"/><circle cx="260" cy="88" r="11" style="fill:#E8C25A"/><rect x="200" y="160" width="120" height="20" style="fill:#8A6A3A"/>${[210, 300].map(x => `<rect x="${x}" y="140" width="4" height="20" style="fill:#FFFDF6"/>`).join("")}`, `<rect x="180" y="60" width="160" height="130"/>`)
      + [212, 302].map(x => lampGlow(x, 136, 22) + `<path d="M${x} 140 q-3 -5 0 -9 q3 4 0 9z" fill="#F3C969"><animate attributeName="opacity" values="1;.6;1" dur="1.2s" repeatCount="indefinite"/></path>`).join("")
      + `<rect x="246" y="190" width="28" height="14" rx="2" style="fill:#5A4636;stroke:var(--line)" stroke-width=".8"/><path class="smoke" d="M256 188 q-4 -8 0 -14 q4 -6 0 -12" fill="none" style="stroke:#B9B0A4" stroke-width="1.4" opacity=".6"/>`);
  // the meditation corner: cushions facing a window on the moss garden (Jōshin sits here)
  const corner = spot("kt_hall", 210, 380, "Sit with Jōshin", hovE(170, 350, 80, 22),
    sk(`<rect x="40" y="220" width="110" height="80" style="fill:#9DB87A"/><path d="M40 260 q55 -20 110 10 V300 H40z" style="fill:#7E9A5A"/><circle cx="80" cy="262" r="10" style="fill:#8A8478"/>`, `<rect x="40" y="220" width="110" height="80"/>`)
    + cushion(150, 340, "#C98A3A") + cushion(210, 340, "#C98A3A") + lab(170, 372, "Meditation corner", "#F6E3B4", 10));
  // the great bell, hung in its frame (tap it)
  const bell = spot("ktbell", 420, 330, "The temple bell", hovE(420, 312, 40, 12),
    sk(`<path d="M386 230 h68 M392 230 v80 M448 230 v80" style="stroke:#5A3E2C;fill:none" stroke-width="5"/><path d="M402 240 q18 -10 36 0 v44 q-18 8 -36 0z" style="fill:#7A6A4A"/><path d="M408 262 h24 M408 274 h24" style="stroke:#5A4A2E" stroke-width="1.4"/>`, `<path d="M402 240 q18 -10 36 0 v44 q-18 8 -36 0z"/>`) + lab(420, 324, "The bell", "#E8D3BC", 9));
  const edges = paperLantern(80, 30, "#F3C969") + paperLantern(440, 30, "#F3C969") + g(sk(`<rect x="40" y="540" width="60" height="50" style="fill:#5A4636"/><path d="M46 548 h48 M46 560 h48 M46 572 h48" style="stroke:#C9A27E" stroke-width="2"/>`, `<rect x="40" y="540" width="60" height="50"/>`))
    + g(sk(`<rect x="420" y="540" width="70" height="40" style="fill:#5A4636"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${424 + i*11}" y="526" width="8" height="14" style="fill:#FBF3DF"/>`).join("")}`, `<rect x="420" y="540" width="70" height="40"/>`))
    + cushion(300, 470, "#C98A3A") + cushion(360, 480, "#C98A3A")
    // a rack of wooden wish plaques (ema) hung with red string, and an offering table of candles and oranges
    + g(sk(`<path d="M400 400 h96 M400 440 h96" style="stroke:#5A3E2C" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<path d="M${404 + i*24} 402 h18 v14 l-9 5 l-9 -5z" style="fill:#D9B86A"/><path d="M${404 + i*24} 442 h18 v14 l-9 5 l-9 -5z" style="fill:#D9B86A"/>`).join("")}<path d="M400 400 v66 M496 400 v66" style="stroke:#5A3E2C" stroke-width="3"/>`, `<path d="M400 400 h96 M400 440 h96 M400 400 v66 M496 400 v66"/>`))
    + g(sk(`<rect x="40" y="420" width="90" height="12" rx="2" style="fill:#8A5A3A"/><path d="M46 432 v24 M124 432 v24" style="stroke:#6B4430" stroke-width="3"/>${[0, 1, 2].map(i => `<circle cx="${60 + i*16}" cy="414" r="5" style="fill:#F28C28"/>`).join("")}<rect x="108" y="404" width="4" height="16" style="fill:#FFFDF6"/>`, `<rect x="40" y="420" width="90" height="12" rx="2"/>`)) + lampGlow(110, 400, 16);
  return floor + wall + corner + bell + edges + exit("#5A3E2C");
}

/* ---------- the sweet shop ---------- */
function sweetsRoom(){
  const floor = boards(200, "#C9B48E", "#B9A07A");
  const wall = g(`<rect width="520" height="200" style="fill:#F3ECDD"/><rect y="0" width="520" height="14" style="fill:#4A3A2E"/><rect y="190" width="520" height="10" style="fill:#4A3A2E"/>`)
    // wooden moulds on the wall, and a noren into the back
    + g(sk(`<rect x="30" y="40" width="160" height="12" style="fill:#8A6A52"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${36 + i*30}" y="56" width="24" height="40" rx="2" style="fill:#B98A5A"/><circle cx="${48 + i*30}" cy="70" r="6" style="fill:#8A6A52"/>`).join("")}<path d="M220 30 h80 v60 h-80z" style="fill:#E8A0B4"/><path d="M246 30 v60 M274 30 v60" style="stroke:#FFFDF6" stroke-width="1.4"/>`, `<rect x="30" y="40" width="160" height="12"/><path d="M220 30 h80 v60 h-80z"/>`))
    + g(`<text x="260" y="66" text-anchor="middle" font-family="Klee One,serif" font-size="12" fill="#FFFDF6">和菓子</text>`);
  // the glass cases and Mr Tanaka's counter
  const sweets = [["#F6C7D6", "#9CC27E"], ["#E0782E", "#E8B13A"], ["#FFFDF6", "#B9A8E0"], ["#8FB86A", "#C8432F"]];
  const counter = spot("kt_sweets", 390, 280, "Mr Tanaka's counter", hovE(390, 262, 100, 16),
    sk(`<rect x="290" y="200" width="200" height="50" rx="3" style="fill:#8A6A52"/><rect x="294" y="176" width="192" height="30" rx="3" style="fill:#EAF6FA" opacity=".9"/>${sweets.map(([a, b], i) => `<ellipse cx="${318 + i*46}" cy="198" rx="16" ry="4" style="fill:#FFFDF6"/><circle cx="${312 + i*46}" cy="192" r="5" style="fill:${a}"/><circle cx="${324 + i*46}" cy="192" r="5" style="fill:${b}"/>`).join("")}`,
      `<rect x="290" y="200" width="200" height="50" rx="3"/><rect x="294" y="176" width="192" height="30" rx="3"/>`) + lab(390, 296, "Make a sweet · the shop", "#F6D3DC", 10));
  // a little bench to eat at, a tea urn, a plant, boxes stacked
  const edges = g(sk(`<rect x="40" y="400" width="80" height="12" rx="2" style="fill:#8A6A52"/><path d="M46 412 v18 M114 412 v18" style="stroke:#6B5444" stroke-width="4"/>`, `<rect x="40" y="400" width="80" height="12" rx="2"/>`)) + cushion(60, 396, "#E8A0B4") + cushion(100, 396, "#9CC27E")
    + g(sk(`<rect x="40" y="220" width="40" height="60" rx="4" style="fill:#B9B0A4"/><rect x="48" y="272" width="8" height="8" style="fill:#3A3430"/>`, `<rect x="40" y="220" width="40" height="60" rx="4"/>`)) + bonsai(470, 600) + paperLantern(130, 22) + paperLantern(400, 22, "#F6C7D6")
    + g(sk([0, 1, 2].map(i => `<rect x="${140 + i*6}" y="${590 - i*14}" width="40" height="14" style="fill:${["#F6C7D6", "#FFFDF6", "#9CC27E"][i]}"/>`).join(""), `<rect x="140" y="590" width="40" height="14"/>`));
  return floor + wall + counter + edges + exit("#4A3A2E");
}

/* ---------- the covered market ---------- */
function marketRoom(){
  const floor = boards(170, "#B9B0A4", "#A8A094");
  const roof = g(`<rect width="520" height="170" style="fill:#2A221C"/><path d="M0 0 H520 V30 Q260 60 0 30z" style="fill:#EAF2F4" opacity=".75"/>${[60, 160, 260, 360, 460].map(x => `<path d="M${x} 30 v60" style="stroke:#5A4636" stroke-width="3"/>`).join("")}`) + [60, 160, 260, 360, 460].map((x, i) => paperLantern(x, 92, i % 2 ? "#C8432F" : "#FBF3DF")).join("");
  const stall = (x, y, w, awn, items) => g(sk(`<rect x="${x}" y="${y}" width="${w}" height="44" rx="3" style="fill:#8A6A52"/><path d="M${x - 6} ${y - 30} h${w + 12} l-6 14 h-${w}z" style="fill:${awn}"/>${items}`, `<rect x="${x}" y="${y}" width="${w}" height="44" rx="3"/><path d="M${x - 6} ${y - 30} h${w + 12} l-6 14 h-${w}z"/>`));
  const tubs = c => [0, 1, 2].map(i => `<ellipse cx="${0}" cy="0" rx="0" ry="0"/>`).join("");
  const stalls = stall(30, 256, 100, "#5E7A4A", [0, 1, 2].map(i => `<ellipse cx="${50 + i*30}" cy="256" rx="12" ry="5" style="fill:${["#8E5A6E", "#E8B13A", "#7E9A5A"][i]}"/>`).join(""))
    + stall(390, 256, 100, "#3E5E7A", [0, 1, 2].map(i => `<rect x="${398 + i*30}" y="246" width="22" height="12" rx="2" style="fill:#FFFDF6"/>`).join(""))
    + stall(30, 386, 100, "#C8432F", [0, 1].map(i => `<rect x="${44 + i*40}" y="374" width="30" height="14" rx="3" style="fill:#F3D34A"/>`).join(""))
    + stall(390, 386, 100, "#2F2B28", [0, 1, 2].map(i => `<path d="M${400 + i*28} 380 l20 -6 l2 4 l-20 6z" style="fill:#BFC3CA"/>`).join(""));
  const tap = spot("kt_market", 260, 470, "The market stalls", hovE(260, 330, 120, 20), lab(260, 340, "The stalls: pickles, tofu, omelette, knives", "#F6E3B4", 9));
  const edges = crate(170, 610, "#F3D34A") + crate(360, 610, "#8E5A6E") + crate(480, 610) + g(`<path class="smoke" d="M440 250 q-4 -8 0 -14 q4 -6 0 -12" fill="none" style="stroke:#FFFDF6" stroke-width="1.6" opacity=".7"/>`);
  return floor + roof + stalls + tap + edges + exit("#5A4636");
}

/* ---------- the pottery ---------- */
function potteryRoom(){
  const floor = boards(200, "#B9A07A", "#A88F6A");
  const wall = g(`<rect width="520" height="200" style="fill:#E6DCCB"/><rect y="0" width="520" height="14" style="fill:#4A3A2E"/>`)
    + g(sk(`<rect x="20" y="40" width="200" height="8" style="fill:#8A6A52"/><rect x="20" y="96" width="200" height="8" style="fill:#8A6A52"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${30 + i*27} 40 q-3 -16 4 -18 h10 q7 2 4 18z" style="fill:${["#3E5E7A", "#C9A27E", "#5E7A4A", "#E8B13A", "#8A6A52", "#BFE0F2", "#C8432F"][i]}"/><path d="M${32 + i*27} 96 q-3 -14 4 -16 h8 q7 2 4 16z" style="fill:${["#C9A27E", "#3E5E7A", "#E6DED0", "#5E7A4A", "#C8432F", "#8A6A52", "#F3E7C8"][i]}"/>`).join("")}`,
      `<rect x="20" y="40" width="200" height="8"/><rect x="20" y="96" width="200" height="8"/>`))
    // the kiln at the back, glowing
    + g(sk(`<path d="M330 196 V100 q75 -60 150 0 V196z" style="fill:#8A7A6A"/><path d="M380 196 V150 q25 -20 50 0 V196z" style="fill:#E0782E"/>`, `<path d="M330 196 V100 q75 -60 150 0 V196z"/>`) + lampGlow(405, 170, 40));
  // the wheel (tap to throw a cup)
  const wheel = spot("kt_pottery", 210, 360, "The potter's wheel", hovE(160, 340, 70, 20),
    sk(`<ellipse cx="160" cy="330" rx="40" ry="12" style="fill:#7A6A5A"/><ellipse cx="160" cy="326" rx="24" ry="7" style="fill:#9A8A7A"/><path d="M152 326 q-2 -14 8 -16 q10 2 8 16z" style="fill:#C9A27E"/><rect x="152" y="342" width="16" height="20" style="fill:#5A4A3E"/>`, `<ellipse cx="160" cy="330" rx="40" ry="12"/>`)
    + lab(160, 380, "The wheel · the shelves", "#E8D3BC", 10));
  // a wind chime by the door (tap it), a cat on a sack of clay, buckets
  const chime = spot("ktchime", 470, 300, "A wind chime", hovE(470, 262, 16, 22), g(`<path d="M470 210 v14" style="stroke:#2F2B28"/><path d="M460 224 q10 -10 20 0 v6 h-20z" style="fill:#BFE0F2;stroke:var(--line)" stroke-width="1"/><path d="M470 230 v14" style="stroke:#2F2B28"/><rect x="466" y="244" width="8" height="14" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8"/><circle cx="466" cy="227" r="2" fill="#E8913A"/>`));
  const edges = g(sk(`<rect x="40" y="540" width="60" height="40" rx="6" style="fill:#C9B48E"/><ellipse cx="60" cy="534" rx="12" ry="7" style="fill:#E8A45A"/><circle cx="72" cy="530" r="5" style="fill:#E8A45A"/>`, `<rect x="40" y="540" width="60" height="40" rx="6"/>`))
    + g(sk([0, 1].map(i => `<path d="M${400 + i*40} 600 l4 -30 h24 l4 30z" style="fill:#9FC0C8"/>`).join(""), [0, 1].map(i => `<path d="M${400 + i*40} 600 l4 -30 h24 l4 30z"/>`).join("")))
    + g(sk(`<rect x="300" y="400" width="80" height="40" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(i => `<path d="M${310 + i*22} 400 q-3 -12 4 -14 h8 q7 2 4 14z" style="fill:${["#3E5E7A", "#5E7A4A", "#E8B13A"][i]}"/>`).join("")}`, `<rect x="300" y="400" width="80" height="40" rx="3"/>`));
  return floor + wall + wheel + chime + edges + exit("#4A3A2E");
}

export function kyotoRoomArt(scene){
  return scene === "kt_tea" ? teaRoom() : scene === "kt_hall" ? hallRoom() : scene === "kt_sweets" ? sweetsRoom() : scene === "kt_market" ? marketRoom() : potteryRoom();
}
