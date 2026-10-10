// Jeju's interiors (round 128): five rooms behind the doors on the shore, the farms, the harbour and the village.
// Black stone walls and old wooden beams, orange everywhere (floats, tangerines, persimmon cloth): the edges full,
// the middle calm and clear (the playbook).
//   jj_haenyeo: the divers' house: the stove and the porridge pot, wetsuits and nets on the walls, floats stacked up,
//               a low table where the divers eat, Halmang Kim's breathing lesson by the window on the sea
//   jj_shed:    the packing shed: the long sorting table, crates stacked to the roof, scales, a radio, boxes to post
//   jj_cafe:    the stone-house café: a window full of sea, low wooden tables, the counter piled with tangerines
//   jj_market:  the market hall: four stalls (seaweed and dried fish, tangerines and chocolate, omija and tea, black
//               pork on the grill) under strings of bulbs
//   jj_dye:     the dye workshop: tubs of crushed green persimmon, cloth hung from every beam, a doorway full of sun
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a couple of small touches too.
import { ink } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#5F5E64") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const TANG = "#F29A2E", BASALT = "#4A494E", BASALT2 = "#5F5E64", BASALT3 = "#7A7980", CLOTH = ["#C9874A", "#B26A36", "#D9A66A", "#9E5A2E", "#E3C49A"];
// a black stone wall, with lighter stones picked out
const stoneWall = (h = 200, col = BASALT2) => g(`<rect width="520" height="${h}" style="fill:${col}"/>${Array.from({length: 70}, (_, i) => `<ellipse cx="${rnd(i)*520}" cy="${rnd(i + 99)*(h - 10) + 5}" rx="${9 + rnd(i*3)*8}" ry="${5 + rnd(i*7)*4}" style="fill:${BASALT3}" opacity=".55"/>`).join("")}`);
const beams = (y = 18) => g(`<rect y="0" width="520" height="${y}" style="fill:#6B5444"/>${[90, 260, 430].map(x => `<rect x="${x - 7}" y="0" width="14" height="200" style="fill:#6B5444" opacity=".9"/>`).join("")}`);
const boards = (y0, col = "#B98A5A", line = "#8A6A52") => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${col}"/>${Array.from({length: 14}, (_, r) => `<path d="M0 ${y0 + r*34} H520" style="stroke:${line}" stroke-width="1.2"/>`).join("")}`;
const flags = (y0) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:#CFC8BA"/>${Array.from({length: 40}, (_, i) => `<rect x="${(i % 8)*65 + (Math.floor(i/8) % 2)*32 - 16}" y="${y0 + Math.floor(i/8)*92}" width="62" height="88" rx="4" style="fill:none;stroke:#B9B0A4" stroke-width="2"/>`).join("")}`;
const crate = (x, y, fill = TANG, n = 3) => g(sk(`<rect x="${x - 18}" y="${y - 16}" width="36" height="16" style="fill:#C9A27E"/>${Array.from({length: n}, (_, i) => `<circle cx="${x - 10 + i*10}" cy="${y - 17}" r="4.6" style="fill:${fill}"/>`).join("")}`, `<rect x="${x - 18}" y="${y - 16}" width="36" height="16"/><path d="M${x - 18} ${y - 8} h36" opacity=".5"/>`));
const stack = (x, y, rows = 3) => Array.from({length: rows}, (_, r) => crate(x, y - r*16, r === rows - 1 ? TANG : null, r === rows - 1 ? 3 : 0)).join("");
const float = (x, y, r = 9) => g(sk(`<circle cx="${x}" cy="${y}" r="${r}" style="fill:#F08A2E"/><path d="M${x - r} ${y} h${r*2}" style="stroke:#3A3430" stroke-width=".8"/>`, `<circle cx="${x}" cy="${y}" r="${r}"/>`));
const bulbs = (x1, x2, y) => g(`<path d="M${x1} ${y} Q${(x1 + x2)/2} ${y + 18} ${x2} ${y}" style="fill:none;stroke:#3A3430" stroke-width="1"/>${Array.from({length: 7}, (_, i) => { const t = (i + .5)/7, x = x1 + (x2 - x1)*t, yy = y + 18*4*t*(1 - t); return lampGlow(x, yy + 3, 12) + `<circle cx="${x}" cy="${yy + 3}" r="3" fill="#FFF3C4" stroke="#3b3530" stroke-width=".6"/>`; }).join("")}`);
const lowTable = (x, y, w = 70) => g(sk(`<rect x="${x - w/2}" y="${y - 10}" width="${w}" height="14" rx="3" style="fill:#8A6A52"/><rect x="${x - w/2 + 4}" y="${y + 4}" width="5" height="8" style="fill:#6B5444"/><rect x="${x + w/2 - 9}" y="${y + 4}" width="5" height="8" style="fill:#6B5444"/>`, `<rect x="${x - w/2}" y="${y - 10}" width="${w}" height="14" rx="3"/>`));
const cushion = (x, y, col = "#5E7A8A") => g(sk(`<rect x="${x - 13}" y="${y - 6}" width="26" height="11" rx="4" style="fill:${col}"/>`, `<rect x="${x - 13}" y="${y - 6}" width="26" height="11" rx="4"/>`));
const pot = (x, y) => g(sk(`<path d="M${x - 14} ${y} q-4 -22 14 -24 q18 2 14 24z" style="fill:#5A4A3E"/><path d="M${x} ${y - 24} v-10" style="stroke:#3A3430" stroke-width="2"/>`, `<path d="M${x - 14} ${y} q-4 -22 14 -24 q18 2 14 24z"/>`));
const seaWindow = (x, y, w, h) => g(sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#7FB6D6"/><path d="M${x} ${y + h*.62} H${x + w}" style="stroke:#A7D0E6" stroke-width="2"/><path d="M${x + w*.6} ${y + h*.6} q${w*.12} ${-h*.4} ${w*.3} ${-h*.42} q${w*.08} ${h*.1} ${w*.06} ${h*.42}z" style="fill:#8FB46A"/>${[.2, .45].map(f => `<path d="M${x + w*f} ${y + h*.8} q4 -3 8 0 q4 3 8 0" style="fill:none;stroke:#EAF5FA" stroke-width="1.2"/>`).join("")}`,
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x + w/2} ${y} V${y + h}"/>`));

/* ---------- the divers' house ---------- */
function haenyeoRoom(){
  const wall = stoneWall() + beams()
    // the window on the sea, where Halmang Kim teaches the breath song
    + seaWindow(190, 40, 140, 100)
    // wetsuits hung on pegs, a net, masks and the little hooked tools (bitchang)
    + g(sk(`<path d="M24 50 h130" style="stroke:#6B5444" stroke-width="3"/>${[40, 80, 120].map(x => `<path d="M${x - 12} 52 h24 v30 l-4 54 h-6 l-2 -40 l-2 40 h-6 l-4 -54z" style="fill:#2F2B28"/>`).join("")}`, `<path d="M24 50 h130"/>`))
    + g(sk(`<path d="M360 40 q60 70 140 0 v120 q-70 40 -140 0z" style="fill:none;stroke:#C9B27A" stroke-width="2"/>${Array.from({length: 6}, (_, i) => `<path d="M${370 + i*22} 50 l20 100 M${490 - i*22} 50 l-20 100" style="stroke:#C9B27A" stroke-width="1"/>`).join("")}${[[380, 160], [430, 172], [470, 160]].map(([x, y]) => `<rect x="${x - 8}" y="${y - 5}" width="16" height="10" rx="3" style="fill:#9FD3E8"/>`).join("")}`, ""));
  // the stove and the porridge pot (abalone porridge), the low table, the stacked floats
  const stove = g(sk(`<rect x="300" y="300" width="170" height="56" rx="4" style="fill:#8A6A52"/><rect x="320" y="282" width="56" height="22" rx="3" style="fill:#3A3430"/><ellipse cx="348" cy="282" rx="30" ry="8" style="fill:#5A4A3E"/>`, `<rect x="300" y="300" width="170" height="56" rx="4"/><ellipse cx="348" cy="282" rx="30" ry="8"/>`)
    + `<path class="smoke" d="M340 274 q-4 -8 0 -14 q4 -6 0 -12" fill="none" style="stroke:#FFFDF6" stroke-width="1.6" opacity=".7"/>`) + g(`${[400, 430, 456].map(x => `<ellipse cx="${x}" cy="296" rx="10" ry="4" style="fill:#F3ECDD;stroke:var(--line)" stroke-width=".8"/>`).join("")}`);
  const floats = [[60, 300], [80, 286], [42, 286], [62, 272], [56, 330], [80, 346], [40, 346], [60, 362], [70, 394], [50, 404]].map(([x, y]) => float(x, y)).join("");
  // the breath song: the cushion by the sea window (Halmang Kim sits here)
  const lesson = spot("jj_haenyeo", 260, 300, "The breath song with Halmang Kim", hovE(260, 250, 80, 20),
    cushion(230, 240, "#F08A2E") + cushion(290, 240, "#5E7A8A") + lab(260, 270, "The breath song", "#C3DDF3", 10));
  const edges = lowTable(456, 470, 60) + cushion(430, 500) + cushion(482, 500) + g(sk(`<rect x="420" y="430" width="70" height="20" rx="3" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<ellipse cx="${436 + i*20}" cy="430" rx="7" ry="4" style="fill:${["#8A9A8A", "#3E5E4A", "#C9B8C8"][i]}"/>`).join("")}`, `<rect x="420" y="430" width="70" height="20" rx="3"/>`))
    + g(sk(`<rect x="36" y="530" width="60" height="40" rx="4" style="fill:#5E7A8A"/><path d="M40 530 q26 -16 52 0" style="fill:#3E5E7A"/>`, `<rect x="36" y="530" width="60" height="40" rx="4"/>`))   // a basket of the day's catch
    + g(sk(`<rect x="430" y="560" width="54" height="34" rx="4" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<circle cx="${444 + i*14}" cy="560" r="5" style="fill:#E6D3B8"/>`).join("")}`, `<rect x="430" y="560" width="54" height="34" rx="4"/>`));   // a bowl of sea snail shells
  const porridge = spot("jjjuk", 380, 380, "A bowl of abalone porridge", hovE(384, 366, 70, 14), lab(384, 378, "Porridge pot", "#F3E1A0", 9));
  const more = g(sk(`<rect x="470" y="236" width="40" height="150" rx="3" style="fill:#8A6A52"/>${[0, 1, 2, 3].map(r => `<path d="M474 ${266 + r*34} h32" style="stroke:#6B5444" stroke-width="2"/>${[0, 1].map(c => `<ellipse cx="${482 + c*16}" cy="${262 + r*34}" rx="7" ry="3.4" style="fill:#F3ECDD"/>`).join("")}`).join("")}`, `<rect x="470" y="236" width="40" height="150" rx="3"/>`))
    + g(sk(`<path d="M160 590 l-10 30 h16 z M178 590 l-6 30 h16 z" style="fill:#2F2B28"/>`, ``))   // flippers by the door
    + g(sk(`<path d="M120 470 h34 l-4 30 h-26z" style="fill:#7A7980"/>${[0, 1, 2].map(i => `<circle cx="${128 + i*9}" cy="468" r="5" style="fill:#3A2A3A"/>`).join("")}`, `<path d="M120 470 h34 l-4 30 h-26z"/>`))   // a bucket of sea urchins
    + lowTable(70, 470, 50) + cushion(52, 500, "#C8324A") + cushion(90, 500, "#5E7A8A");
  return flags(200) + wall + stove + floats + edges + more + lesson + porridge + exit();
}

/* ---------- the packing shed ---------- */
function shedRoom(){
  const wall = g(`<rect width="520" height="200" style="fill:#E6DED0"/><rect y="0" width="520" height="14" style="fill:#3E7CC0"/>${Array.from({length: 26}, (_, i) => `<path d="M${i*20} 14 V200" style="stroke:#D6CCBA" stroke-width="1"/>`).join("")}`)
    + stack(40, 196, 4) + stack(78, 196, 3) + stack(450, 196, 4) + stack(488, 196, 3) + stack(410, 196, 2)
    // the noticeboard of orders, the old radio on a shelf, the scales
    + g(sk(`<rect x="150" y="40" width="96" height="70" style="fill:#C9A27E"/>${[[160, 50], [196, 54], [168, 80], [210, 84]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="26" height="20" style="fill:${["#FFFDF6", "#FBE0B8", "#C3DDF3", "#FFFDF6"][i]}"/>`).join("")}`, `<rect x="150" y="40" width="96" height="70"/>`))
    + g(sk(`<rect x="280" y="96" width="90" height="8" style="fill:#8A6A52"/><rect x="290" y="74" width="40" height="22" rx="3" style="fill:#C8643B"/><circle cx="300" cy="85" r="5" style="fill:#3A3430"/><rect x="310" y="80" width="14" height="8" style="fill:#F3ECDD"/>`, `<rect x="290" y="74" width="40" height="22" rx="3"/><path d="M322 74 l10 -14"/>`));
  // the sorting table down the middle: tangerines in three crates, small, medium, large
  const table = spot("jj_shed", 260, 430, "Sort tangerines with Mr Ko", hovE(260, 420, 120, 18),
    sk(`<rect x="150" y="340" width="220" height="60" rx="4" style="fill:#B98A5A"/>${Array.from({length: 12}, (_, i) => `<circle cx="${170 + (i*17) % 180}" cy="${356 + (i % 3)*12}" r="${4 + (i % 3)*1.5}" style="fill:${TANG}"/>`).join("")}`, `<rect x="150" y="340" width="220" height="60" rx="4"/>`)
    + crate(190, 420, TANG, 2) + crate(260, 420, TANG, 3) + crate(330, 420, "#F28C28", 2) + lab(260, 448, "Sorting table", "#FBE0B8", 10));
  const radio = spot("jjradio", 310, 220, "The radio", hovE(310, 112, 30, 8), "");
  const edges = stack(70, 560, 2) + stack(450, 560, 2) + g(sk(`<rect x="420" y="470" width="80" height="40" rx="3" style="fill:#C9A27E"/><path d="M420 482 h80" style="stroke:#8A6A52"/><rect x="440" y="458" width="40" height="12" rx="2" style="fill:#FFFDF6"/>`, `<rect x="420" y="470" width="80" height="40" rx="3"/>`))
    + g(sk(`<rect x="34" y="474" width="70" height="60" rx="3" style="fill:#8A6A52"/><rect x="44" y="480" width="50" height="10" style="fill:#5E7A8A"/><path d="M69 474 v-14 l14 -6" style="stroke:#3A3430" stroke-width="2" fill="none"/>`, `<rect x="34" y="474" width="70" height="60" rx="3"/>`));   // the scales
  const sides = stack(44, 290, 2) + stack(44, 360, 3) + stack(482, 300, 3) + stack(482, 400, 2) + crate(110, 300) + crate(420, 300, "#F28C28")
    + g(sk(`<path d="M138 210 l-14 120 M166 210 l-14 120" style="stroke:#8A6A52" stroke-width="4"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${136 - i*2.8} ${228 + i*22} h28" style="stroke:#8A6A52" stroke-width="3"/>`).join("")}`, ``))   // a ladder up to the top crates
    + g(sk(`<rect x="160" y="540" width="30" height="40" rx="10" style="fill:#D9C9A0"/><rect x="194" y="548" width="28" height="34" rx="10" style="fill:#D9C9A0"/>`, `<rect x="160" y="540" width="30" height="40" rx="10"/><rect x="194" y="548" width="28" height="34" rx="10"/>`))   // sacks
    + g(sk(`<rect x="320" y="548" width="44" height="30" style="fill:#E6DED0"/><rect x="330" y="530" width="44" height="22" style="fill:#E6DED0"/><path d="M320 560 h44 M330 540 h44" style="stroke:#3E7CC0" stroke-width="2"/>`, `<rect x="320" y="548" width="44" height="30"/><rect x="330" y="530" width="44" height="22"/>`));   // boxes to post, taped in blue
  return boards(200, "#C9B8A0", "#B9A890") + wall + sides + edges + table + radio + exit("#3E7CC0");
}

/* ---------- the stone-house café ---------- */
function cafeRoom(){
  const wall = stoneWall() + beams()
    + seaWindow(150, 34, 220, 120)
    // shelves of jars and cups, a hanging plant, a framed tangerine
    + g(sk(`<rect x="24" y="60" width="100" height="8" style="fill:#8A6A52"/><rect x="24" y="110" width="100" height="8" style="fill:#8A6A52"/>${[34, 58, 82, 106].map((x, i) => `<rect x="${x}" y="${44 - (i % 2)*4}" width="14" height="${16 + (i % 2)*4}" rx="2" style="fill:${["#F29A2E", "#C8324A", "#5E8A48", "#F3D9A8"][i]}"/><circle cx="${x + 7}" cy="104" r="6" style="fill:#FFFDF6"/>`).join("")}`, `<rect x="24" y="60" width="100" height="8"/><rect x="24" y="110" width="100" height="8"/>`))
    + g(sk(`<rect x="404" y="50" width="70" height="70" style="fill:#FFFDF6"/><circle cx="439" cy="88" r="18" style="fill:${TANG}"/><path d="M439 70 q6 -8 14 -6" style="fill:none;stroke:#4E7A3A" stroke-width="3"/>`, `<rect x="404" y="50" width="70" height="70"/>`));
  // the counter, piled with tangerines (Ha-eun takes orders here)
  const counter = spot("jj_cafe", 260, 300, "The café counter", hovE(260, 262, 110, 16),
    sk(`<rect x="160" y="210" width="200" height="44" rx="4" style="fill:#8A6A52"/><rect x="160" y="206" width="200" height="8" rx="2" style="fill:#C9A27E"/>${Array.from({length: 9}, (_, i) => `<circle cx="${200 + (i % 5)*10 + (i > 4 ? 5 : 0)}" cy="${200 - (i > 4 ? 8 : 0)}" r="5" style="fill:${TANG}"/>`).join("")}<rect x="300" y="186" width="26" height="22" rx="3" style="fill:#3A3430"/><rect x="336" y="192" width="14" height="16" rx="2" style="fill:#F3ECDD"/>`, `<rect x="160" y="210" width="200" height="44" rx="4"/>`)
    + lab(260, 278, "Order at the counter", "#FBE0B8", 10));
  const tables = [[110, 346], [410, 346], [110, 486], [410, 486]].map(([x, y], i) => lowTable(x, y, 60) + cushion(x - 26, y + 26, ["#F08A2E", "#5E7A8A", "#C8324A", "#5E8A48"][i]) + cushion(x + 26, y + 26, "#C9A27E")
    + g(`<circle cx="${x - 10}" cy="${y - 12}" r="4" fill="#FFFDF6" stroke="#3b3530" stroke-width=".8"/><circle cx="${x + 12}" cy="${y - 12}" r="3.6" fill="${TANG}" stroke="#3b3530" stroke-width=".8"/>`)).join("");
  const plant = g(sk(`<rect x="476" y="560" width="26" height="30" rx="3" style="fill:#C8643B"/><path d="M489 560 q-14 -30 -4 -50 M489 560 q12 -26 6 -46 M489 560 q0 -30 0 -54" style="fill:none;stroke:#5E8A48" stroke-width="3"/>`, `<rect x="476" y="560" width="26" height="30" rx="3"/>`))
    + g(sk(`<rect x="22" y="560" width="26" height="30" rx="3" style="fill:#5E7A8A"/><circle cx="35" cy="546" r="16" style="fill:#6A9A48"/>${[[28, 540], [42, 546], [34, 554]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" style="fill:${TANG}"/>`).join("")}`, `<rect x="22" y="560" width="26" height="30" rx="3"/><circle cx="35" cy="546" r="16"/>`));   // a potted tangerine tree
  const view = spot("jjwindow", 260, 300, "The window on the sea", hovE(260, 156, 60, 8), "");
  const books = g(sk(`<rect x="470" y="230" width="40" height="120" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${474 + c*8}" y="${238 + r*38}" width="7" height="28" style="fill:${["#C8324A", "#5E7A8A", "#F3D9A8", "#5E8A48"][(r + c) % 4]}"/>`).join("")).join("")}`, `<rect x="470" y="230" width="40" height="120" rx="3"/>`))
    + g(sk(`<rect x="14" y="250" width="40" height="80" rx="4" style="fill:#C9A27E"/><rect x="18" y="246" width="32" height="10" rx="3" style="fill:#F08A2E"/>`, `<rect x="14" y="250" width="40" height="80" rx="4"/>`));   // a cushioned window seat
  return boards(200, "#B98A5A", "#9E7650") + wall + books + counter + tables + plant + view + exit();
}

/* ---------- the market hall ---------- */
function marketRoom(){
  const wall = g(`<rect width="520" height="200" style="fill:#E6DED0"/><rect y="0" width="520" height="14" style="fill:#5F5E64"/>`) + bulbs(20, 250, 30) + bulbs(270, 500, 30)
    // seaweed hanging in long sheets, dried fish on a line
    + g(sk(`${[40, 70, 100, 130].map(x => `<rect x="${x}" y="60" width="18" height="${60 + (x % 3)*10}" rx="2" style="fill:#2E3A2E"/>`).join("")}<path d="M300 70 h180" style="stroke:#3A3430" stroke-width="1"/>${[310, 340, 370, 400, 430, 460].map(x => `<path d="M${x} 70 l6 4 v22 l-6 6 l-6 -6 v-22z" style="fill:#C9B8A0"/>`).join("")}`, ""))
    + g(sk(`<rect x="190" y="70" width="100" height="40" rx="3" style="fill:#FFFDF6"/>`, `<rect x="190" y="70" width="100" height="40" rx="3"/>`) + `<text x="240" y="88" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="10" fill="#2F2B28">동문시장</text><text x="240" y="102" text-anchor="middle" font-family="Klee One,serif" font-size="8" fill="#2F2B28">MARKET HALL</text>`);
  const stall = (x, y, cloth, goods, name) => g(sk(`<rect x="${x}" y="${y}" width="100" height="44" rx="3" style="fill:#8A6A52"/><path d="M${x - 6} ${y - 20} h112 v12 h-112z" style="fill:${cloth}"/>${Array.from({length: 7}, (_, i) => `<rect x="${x - 6 + i*16}" y="${y - 20}" width="8" height="12" style="fill:#FFFDF6"/>`).join("")}${goods}`, `<rect x="${x}" y="${y}" width="100" height="44" rx="3"/>`)) + lab(x + 50, y + 58, name, "#F6E3B4", 9);
  const stalls = stall(30, 256, "#2E5E3A", [0, 1, 2, 3].map(i => `<rect x="${40 + i*22}" y="244" width="16" height="12" rx="2" style="fill:#2E3A2E"/>`).join(""), "Seaweed and fish")
    + stall(390, 256, TANG, Array.from({length: 8}, (_, i) => `<circle cx="${402 + (i % 4)*22}" cy="${248 - Math.floor(i/4)*8}" r="5" style="fill:${TANG}"/>`).join(""), "Tangerines and sweets")
    + stall(30, 386, "#C8324A", [0, 1, 2].map(i => `<rect x="${44 + i*26}" y="${370}" width="16" height="16" rx="3" style="fill:${["#C8324A", "#5E8A48", "#F3D9A8"][i]}"/>`).join(""), "Omija and tea")
    + stall(390, 386, "#3A3430", `<rect x="404" y="372" width="72" height="12" rx="2" style="fill:#3A3430"/>${[0, 1, 2].map(i => `<rect x="${410 + i*22}" y="366" width="14" height="6" rx="2" style="fill:#C9877A"/>`).join("")}`, "Black pork grill") + `<path class="smoke" d="M440 360 q-4 -8 0 -14 q4 -6 0 -12" fill="none" style="stroke:#FFFDF6" stroke-width="1.6" opacity=".7"/>`;
  // the middle: the slow-post box and the shopping (tap the counter by the door)
  const shop = spot("jj_market", 260, 500, "The market stalls", hovE(260, 470, 90, 18), g(sk(`<rect x="214" y="430" width="92" height="30" rx="4" style="fill:#C9A27E"/>${[0, 1, 2, 3].map(i => `<circle cx="${228 + i*20}" cy="430" r="6" style="fill:${[TANG, "#C8324A", "#5E8A48", "#C9877A"][i]}"/>`).join("")}`, `<rect x="214" y="430" width="92" height="30" rx="4"/>`)) + lab(260, 476, "Shop the stalls", "#FBE0B8", 10));
  const post = spot("jjpost", 470, 560, "The slow-post box", hovE(470, 586, 26, 8), g(sk(`<rect x="456" y="530" width="28" height="50" rx="6" style="fill:#F08A2E"/><rect x="462" y="542" width="16" height="4" style="fill:#3A3430"/>`, `<rect x="456" y="530" width="28" height="50" rx="6"/>`)) + lab(470, 600, "Slow post", "#F6D3DC", 9));
  return flags(200) + wall + stalls + shop + post + crate(70, 590) + exit();
}

/* ---------- the dye workshop ---------- */
function dyeRoom(){
  const wall = stoneWall(200, "#6B6A70") + beams()
    // cloth hung from the beams in every shade from pale green to rust, and a doorway full of sun
    + g(sk(`<rect x="380" y="30" width="110" height="170" style="fill:#F6E3B4"/><path d="M380 200 l40 -40 h70 v40z" style="fill:#F3D98A" opacity=".8"/>`, `<rect x="380" y="30" width="110" height="170"/>`))
    + g(sk(`<path d="M20 34 h340" style="stroke:#6B5444" stroke-width="4"/>${Array.from({length: 9}, (_, i) => `<rect x="${28 + i*36}" y="36" width="26" height="${90 + (i % 3)*24}" style="fill:${CLOTH[i % 5]}"/>`).join("")}`, `<path d="M20 34 h340"/>`));
  // the dye tubs (the activity), the persimmon basket
  const tubs = spot("jj_dye", 260, 420, "Dye a scarf with Mr Moon", hovE(260, 400, 120, 18),
    sk(`<ellipse cx="200" cy="350" rx="48" ry="18" style="fill:#8A6A52"/><ellipse cx="200" cy="346" rx="40" ry="12" style="fill:#9DAF5A"/><ellipse cx="350" cy="350" rx="48" ry="18" style="fill:#8A6A52"/><ellipse cx="350" cy="346" rx="40" ry="12" style="fill:#B26A36"/>`, `<ellipse cx="200" cy="350" rx="48" ry="18"/><ellipse cx="350" cy="350" rx="48" ry="18"/>`)
    + g(sk(`<rect x="248" y="296" width="54" height="30" rx="6" style="fill:#C9A27E"/>${Array.from({length: 6}, (_, i) => `<circle cx="${258 + (i % 3)*16}" cy="${296 - Math.floor(i/3)*7}" r="6" style="fill:#8FB46A"/>`).join("")}`, `<rect x="248" y="296" width="54" height="30" rx="6"/>`))
    + lab(275, 396, "The dye tubs", "#F3E1A0", 10));
  const edges = g(sk(`<rect x="34" y="470" width="66" height="70" rx="3" style="fill:#8A6A52"/>${[0, 1, 2, 3].map(i => `<rect x="40" y="${476 + i*15}" width="54" height="10" style="fill:${CLOTH[i]}"/>`).join("")}`, `<rect x="34" y="470" width="66" height="70" rx="3"/>`))   // folded cloth, ready to sell
    + g(sk(`<rect x="420" y="490" width="70" height="40" rx="3" style="fill:#8A6A52"/><path d="M430 490 l8 -30 h34 l8 30" style="fill:#B26A36"/>`, `<rect x="420" y="490" width="70" height="40" rx="3"/>`))   // a galot shirt on a stand
    + g(sk(`<rect x="440" y="570" width="40" height="22" rx="4" style="fill:#C9A27E"/>${[0, 1, 2].map(i => `<circle cx="${450 + i*10}" cy="570" r="5" style="fill:#8FB46A"/>`).join("")}`, `<rect x="440" y="570" width="40" height="22" rx="4"/>`));
  const rack = g(sk(`<path d="M30 240 v190 M110 240 v190 M30 246 h80 M30 300 h80" style="stroke:#6B5444" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<rect x="${36 + i*18}" y="248" width="14" height="44" style="fill:${CLOTH[i + 1]}"/><rect x="${36 + i*18}" y="302" width="14" height="${50 + (i % 2)*16}" style="fill:${CLOTH[(i + 3) % 5]}"/>`).join("")}`, `<path d="M30 246 h80 M30 300 h80"/>`))
    + g(sk(`${[[160, 480], [360, 480]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" style="fill:#8A6A52"/><rect x="${x - 3}" y="${y}" width="6" height="16" style="fill:#6B5444"/>`).join("")}`, ``))   // stools
    + g(sk(`<path d="M420 300 h66 l-6 40 h-54z" style="fill:#C9A27E"/>${Array.from({length: 7}, (_, i) => `<circle cx="${430 + (i % 4)*14}" cy="${298 - Math.floor(i/4)*8}" r="6" style="fill:#8FB46A"/>`).join("")}`, `<path d="M420 300 h66 l-6 40 h-54z"/>`))   // green persimmons
    + g(sk(`<rect x="130" y="560" width="56" height="30" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(i => `<rect x="${134 + i*16}" y="548" width="14" height="12" style="fill:${CLOTH[i]}"/>`).join("")}`, `<rect x="130" y="560" width="56" height="30" rx="3"/>`));
  return flags(200) + wall + rack + tubs + edges + exit("#9E5A2E");
}

export function jejuRoomArt(scene){
  return scene === "jj_haenyeo" ? haenyeoRoom() : scene === "jj_shed" ? shedRoom() : scene === "jj_cafe" ? cafeRoom() : scene === "jj_market" ? marketRoom() : dyeRoom();
}
// the persimmon cloth drying on the washing line at home (round 129): its colour deepens over three days
export const DYE_COLS = ["#D9CFA0", "#D9A66A", "#C9874A", "#9E5A2E"];
export const dyeCloth = days => `<g data-rdspot="dyecloth" data-x="414" data-y="410" aria-label="Your persimmon scarf, drying"><ellipse class="hov" cx="414" cy="400" rx="22" ry="6" style="fill:var(--butter)"/>
  <g class="washing">${sk(`<path d="M404 356 h20 v34 l-4 -4 l-6 6 l-6 -6 l-4 4z" style="fill:${DYE_COLS[Math.min(3, days)]}"/>`, `<path d="M404 356 h20 v34 l-4 -4 l-6 6 l-6 -6 l-4 4z"/>`)}</g></g>`;
