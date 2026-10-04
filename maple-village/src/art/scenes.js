// SVG scene builders: village, interiors, garden. Generated strings, hand-drawn look via #wob / #marker / #wash.
// Scene builders read live game state through the `G` context set by core (setArtContext).
import { ink } from "../util.js";
import { VILLAGE, ROOMS, stationsOf } from "../data/world.js";
import { CROPS, PLOTS } from "../data/items.js";
import { roomShell } from "./interiors.js";
import { iconAt } from "./icons.js";
import { runArt } from "../game/pets.js";
import { jarArt } from "../game/jars.js";
import { upgradesArt, festivalArt, festivalOn, pondLanterns, streetLamp, lampDefs } from "./village-extras.js";
import { trophySVG } from "../game/trophies.js";
import { townHall, chordWorkshop, library, chicoCottage, postOffice } from "./buildings.js";

let G = null;
export const setArtContext = g => { G = g; };
export const artCtx = () => G;

export function tapeLabel(x, y, text, col, size){
  const w = text.length*(size ? size*.56 : 8.2) + 22;
  if (col === "var(--card)") col = "#F6EFE3";   // a cream tape in both themes, so the dark names stay readable
  return `<g transform="translate(${x} ${y}) rotate(-2)" pointer-events="none"><path d="M${-w/2} -11 l4 -1.5 l${w-8} 1 l4 -1 l-2 11 l2 11 l-4 1 l${-(w-8)} -1 l-4 1 l2 -11z" style="fill:${col}" opacity=".94"/><text class="lab" x="0" y="5" text-anchor="middle"${size ? ` style="font-size:${size}px"` : ""}>${text}</text></g>`;
}
export const sk = (art, lines) => `<g filter="url(#marker)">${art}</g><g filter="url(#wob)" fill="none" ${ink}>${lines}</g>`;
export function house(id, x, y, w, h, wall, roof, label, tapeCol, extra){
  const rx = x - 9, rw = w + 18, apex = y - h*0.62;
  const roofP = `M${rx} ${y} L${x + w/2} ${apex} L${rx + rw} ${y}Z`;
  const dx = x + w/2 - 11, dy = y + h - 30;
  const art = `<path d="${roofP}" style="fill:${roof}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${wall}"/>
    <rect x="${dx}" y="${dy}" width="22" height="30" rx="10" style="fill:var(--wood)"/>
    <rect x="${x+12}" y="${y+14}" width="20" height="18" rx="2" style="fill:var(--sky)"/><rect x="${x+w-32}" y="${y+14}" width="20" height="18" rx="2" style="fill:var(--sky)"/>`;
  const lines = `<path d="${roofP}"/><rect x="${x}" y="${y}" width="${w}" height="${h}"/>
    <rect x="${dx}" y="${dy}" width="22" height="30" rx="10"/><circle cx="${dx+16}" cy="${dy+16}" r="1.4"/>
    <rect x="${x+12}" y="${y+14}" width="20" height="18" rx="2"/><path d="M${x+22} ${y+14} v18 M${x+12} ${y+23} h20"/>
    <rect x="${x+w-32}" y="${y+14}" width="20" height="18" rx="2"/><path d="M${x+w-22} ${y+14} v18 M${x+w-32} ${y+23} h20"/>`;
  return `<g data-place="${id}" aria-label="${label}"><ellipse class="hov" cx="${x+w/2}" cy="${y+h+4}" rx="${w/2+14}" ry="10" style="fill:var(--butter)"/>
    ${sk(art + (extra ? extra.art : ""), lines + (extra ? extra.lines : ""))}${tapeLabel(x + w/2, y + h + 22, label, tapeCol)}</g>`;
}
export function tree(x, y, s){ s = s || 1;
  return `<g filter="url(#wob)" ${ink}><rect x="${x-3*s}" y="${y-6*s}" width="${6*s}" height="${14*s}" style="fill:var(--wood)"/>
    <circle cx="${x}" cy="${y-18*s}" r="${15*s}" style="fill:var(--tree)"/><circle cx="${x-10*s}" cy="${y-10*s}" r="${10*s}" style="fill:var(--tree2)"/><circle cx="${x+10*s}" cy="${y-11*s}" r="${10*s}" style="fill:var(--tree)"/></g>`; }
export const flowers = pts => pts.map(([x,y,c]) => `<circle cx="${x}" cy="${y}" r="2.6" style="fill:${c}"/><circle cx="${x}" cy="${y}" r="1" fill="#FFF6D8"/>`).join("");

export function villageArt(){
  const D = VILLAGE;
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="120" cy="120" rx="90" ry="50" style="fill:var(--grass2)"/><ellipse cx="420" cy="420" rx="100" ry="60" style="fill:var(--grass2)"/><ellipse cx="200" cy="560" rx="80" ry="40" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M260 322 L260 ${D.hall.door[1]} M260 322 C200 300 120 290 ${D.fresh.door[0]} ${D.fresh.door[1]} M260 322 C200 380 120 430 ${D.news.door[0]} ${D.news.door[1]} M260 322 C320 380 410 420 ${D.post.door[0]} ${D.post.door[1]} M290 316 C350 290 400 250 ${D.toLane.door[0]} ${D.toLane.door[1]} M260 322 L260 ${D.toBase.door[1]} M260 540 C290 560 310 570 ${D.bench.door[0]} ${D.bench.door[1]}" fill="none" style="stroke:var(--path)" stroke-width="24" stroke-linecap="round"/>
      <ellipse cx="260" cy="326" rx="70" ry="40" style="fill:var(--path)"/><ellipse cx="260" cy="326" rx="70" ry="40" fill="none" style="stroke:var(--path2)" stroke-width="1.5" stroke-dasharray="3 7"/></g>
    ${flowers([[30,262,"#EFA3A6"],[44,270,"#F3C969"],[150,206,"#C3CDEE"],[372,206,"#EFA3A6"],[488,270,"#F3C969"],[300,448,"#EFA3A6"],[214,450,"#C3CDEE"],[470,540,"#C3CDEE"],[20,430,"#F3C969"],[505,380,"#EFA3A6"]])}
    ${tree(170,64,1)}${tree(350,64,1)}${tree(26,96,1.05)}${tree(494,96,1.05)}${tree(24,350,.9)}${tree(498,330,.9)}${tree(504,520,.85)}${tree(190,470,.8)}${tree(330,470,.8)}
    ${flowers([[170,540,"#F3C969"],[184,548,"#EFA3A6"],[206,520,"#C3CDEE"],[300,520,"#F3C969"],[400,560,"#EFA3A6"],[150,580,"#C3CDEE"]])}`;
  const places =
    townHall() + `<g transform="translate(-350 0)">${library()}</g>` + postOffice() +
    // east gate to Makers' Lane (Chord and Chico live there now)
    `<g data-place="toLane" aria-label="Gate to Makers' Lane" transform="translate(-56 -112)"><ellipse class="hov" cx="496" cy="330" rx="26" ry="30" style="fill:var(--butter)"/>
      ${sk(`<rect x="484" y="292" width="6" height="56" style="fill:var(--wood)"/><rect x="508" y="292" width="6" height="56" style="fill:var(--wood)"/><path d="M480 296 q19 -14 38 0 v6 q-19 -12 -38 0z" style="fill:var(--sage)"/>`,
        `<rect x="484" y="292" width="6" height="56"/><rect x="508" y="292" width="6" height="56"/><path d="M480 296 q19 -14 38 0 v6 q-19 -12 -38 0z"/>`)}
      ${tapeLabel(458, 366, "Makers' Lane", "var(--sage)", 11)}</g>` +
    `<g data-place="board" aria-label="Quest board"><ellipse class="hov" cx="260" cy="330" rx="40" ry="8" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><path d="M238 330 v-40 M282 330 v-40"/><rect x="230" y="282" width="60" height="38" rx="3" style="fill:var(--wood)"/>${notesArt(236, 288, G.remaining().length)}</g>
      ${tapeLabel(260, 280, "Quests", "var(--butter)", 11)}</g>
    <g data-place="well" aria-label="Well"><ellipse class="hov" cx="160" cy="342" rx="26" ry="7" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><path d="M146 312 v20 M174 312 v20"/><path d="M140 314 l20 -12 l20 12z" style="fill:var(--peach)"/><ellipse cx="160" cy="334" rx="17" ry="7" style="fill:var(--stone)"/><path d="M143 334 v6 a17 7 0 0 0 34 0 v-6" style="fill:var(--stone)"/><ellipse cx="160" cy="333" rx="11" ry="4" style="fill:var(--water)"/></g>
      ${tapeLabel(160, 360, "Well", "var(--sky)", 11)}</g>
    <g data-place="market" aria-label="Market"><ellipse class="hov" cx="362" cy="342" rx="32" ry="8" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><path d="M340 306 v30 M384 306 v30"/><rect x="336" y="320" width="52" height="16" style="fill:var(--wood)"/>
        <path d="M332 306 h60 l-4 10 h-52z" style="fill:var(--card)"/><path d="M340 306 l-2 10 M352 306 l-1 10 M364 306 v10 M376 306 l1 10" style="stroke:var(--rose)" stroke-width="5"/>
        <circle cx="350" cy="317" r="3.2" style="fill:var(--rose)"/><circle cx="362" cy="317" r="3.2" style="fill:var(--butter)"/><circle cx="374" cy="317" r="3.2" style="fill:var(--sage)"/></g>
      ${tapeLabel(362, 358, "Market", "var(--blush)", 11)}</g>
    <g transform="translate(-132 32)"><g data-place="news" aria-label="Good news board"><ellipse class="hov" cx="222" cy="450" rx="34" ry="8" style="fill:var(--butter)"/>
      ${sk(`<rect x="194" y="402" width="56" height="36" rx="3" style="fill:#F6E3A1"/><rect x="200" y="408" width="14" height="12" style="fill:#FFFDF6"/><rect x="218" y="410" width="12" height="14" style="fill:#F4C7CF"/><rect x="233" y="407" width="12" height="11" style="fill:#DCE8C8"/>`,
        `<path d="M202 438 v12 M242 438 v12"/><rect x="194" y="402" width="56" height="36" rx="3"/><rect x="200" y="408" width="14" height="12"/><rect x="218" y="410" width="12" height="14"/><rect x="233" y="407" width="12" height="11"/><path d="M194 402 q28 -10 56 0" opacity=".6"/>`)}
      ${G.goodNews && G.goodNews() ? `<g class="twinkle">${iconAt("sparkle", 252, 398, 14)}</g>` : ""}${dogArt(270, 450, !!(G.goodNews && G.goodNews()))}${tapeLabel(222, 470, "Good news", "var(--butter)", 11)}</g></g>
    ${townRiver()}`;
  const L = {green: "#7FB069", amber: "#F3B54A", red: "#E8574C", grey: "#B9B0A4"};
  const light = (app, x, y) => { const h = G.health ? G.health(app) : null; if (!h) return "";
    return `<g pointer-events="none"><circle cx="${x}" cy="${y}" r="7.5" fill="#FFFDF6" style="stroke:var(--line)" stroke-width="1.2"/><circle class="${h.status === "red" ? "twinkle" : ""}" cx="${x}" cy="${y}" r="4.5" fill="${L[h.status]}"/></g>`; };
  const lamps = [[204, 424], [384, 432], [400, 252], [236, 524], [284, 524], [120, 560], [440, 572]].map(([x, y]) => streetLamp(x, y)).join("");
  return lampDefs + ground + lamps + places + upgradesArt(G.F().totalQuests || 0, "village") + festivalArt(festivalOn(G.day()));
}
/* ---------- the river between the two screens ---------- */
const waterBand = (y1, y2) => `<path d="M0 ${y1+4} Q65 ${y1-4} 130 ${y1+3} T260 ${y1+2} T390 ${y1+4} T520 ${y1} V${y2} ${y2 >= 640 ? "H0" : `Q455 ${y2+5} 390 ${y2-2} T260 ${y2} T130 ${y2-3} T0 ${y2+2}`}z" style="fill:var(--water)"/>`;
function bridge(id, x, y1, y2, label, tapeX, tapeY, size){
  let planks = ""; for (let y = y1 + 8; y < y2 - 2; y += 9) planks += `<path d="M${x-22} ${y} h44"/>`;
  return `<g data-place="${id}" aria-label="${label}"><ellipse class="hov" cx="${x}" cy="${(y1 + y2)/2}" rx="40" ry="${(y2 - y1)/2 + 6}" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x-24}" y="${y1}" width="48" height="${y2 - y1}" rx="3" style="fill:var(--wood)"/>`,
      `<rect x="${x-24}" y="${y1}" width="48" height="${y2 - y1}" rx="3"/>${planks}<path d="M${x-28} ${y1-4} v${y2 - y1 + 8} M${x+28} ${y1-4} v${y2 - y1 + 8}" stroke-width="2.2"/><path d="M${x-28} ${y1+2} v0 M${x-28} ${(y1+y2)/2} h-2 M${x+28} ${(y1+y2)/2} h2"/>`)}
    ${tapeLabel(tapeX, tapeY, label, "var(--sky)", size)}</g>`;
}
const ripples = (pts) => `<g filter="url(#wob)" fill="none" style="stroke:var(--line)" stroke-width="1" opacity=".45">${pts.map(([x, y]) => `<path class="ripple" d="M${x} ${y} q8 -4 16 0"/>`).join("")}</g>`;
// A mother duck and her ducklings paddle along the river now and then (CSS "ducks": a long loop, mostly off screen),
// drawn under the bridge so they swim beneath it. rtl: right to left.
function ducks(y, rtl, delay){
  const duck = (x, s, body, kid) => `<g class="dbob" style="animation-delay:-${(x/40).toFixed(2)}s" transform="translate(${x} 0) scale(${s})"><path d="M-14 -2 q14 10 28 0 q4 -8 -2 -10 q-12 -2 -22 2 q-6 2 -4 8z" style="fill:${body}" stroke="var(--line)" stroke-width="1"/><circle cx="10" cy="-14" r="6" style="fill:${kid ? body : "#3E6B4E"}" stroke="var(--line)" stroke-width="1"/><path d="M15 -14 l6 1.5 l-6 1.8z" fill="#F0A33A" stroke="var(--line)" stroke-width=".8"/><circle cx="11.5" cy="-15.5" r="1" fill="var(--line)"/>${kid ? "" : `<path d="M4 -6 q-6 2 -10 0" fill="none" stroke="var(--line)" stroke-width=".8" opacity=".6"/>`}</g>`;
  const fam = duck(0, 1, "#B89A7A") + duck(-34, .55, "#F6D86B", true) + duck(-56, .55, "#F6D86B", true) + duck(-78, .5, "#F6D86B", true);
  return `<g class="ducks${rtl ? " rtl" : ""}" style="animation-delay:-${delay}s" pointer-events="none"><g transform="translate(0 ${y})${rtl ? " scale(-1 1)" : ""}">${fam}<path d="M-96 2 q50 6 110 0" fill="none" stroke="#FFFDF6" stroke-width="1.2" opacity=".7"/></g></g>`;
}
function townRiver(){
  return `<g filter="url(#wob)">${waterBand(600, 640)}</g>${ripples([[60, 620], [150, 628], [370, 618], [450, 630]])}${ducks(626, true, 70)}
    <g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.1"><path d="M0 604 Q65 596 130 603 T260 602 T390 604 T520 600" fill="none"/></g>
    ${bridge("toBase", 260, 584, 640, "To home", 410, 624, 11)}
    <g data-place="bench" aria-label="Riverside bench"><ellipse class="hov" cx="334" cy="572" rx="30" ry="8" style="fill:var(--butter)"/>
      ${sk(`<rect x="314" y="560" width="40" height="7" rx="2" style="fill:var(--wood)"/><rect x="314" y="548" width="40" height="6" rx="2" style="fill:var(--wood)"/>`, `<rect x="314" y="560" width="40" height="7" rx="2"/><rect x="314" y="548" width="40" height="6" rx="2"/><path d="M318 554 v6 M350 554 v6 M318 567 v9 M350 567 v9"/>`)}</g>`;
}

/* ---------- home base: the house, garden, pond, shed and Evan's swing ---------- */
export function baseArt(){
  const D = VILLAGE;
  const grown = (G.F().plots || []).filter(p => p && p.crop).length;
  const sprouts = Array.from({length:Math.min(6, grown)}, (_, i) => { const x = 58 + (i % 3)*44, y = 430 + Math.floor(i/3)*24;
    return `<path d="M${x} ${y} v-8" style="stroke:var(--moss2)"/><ellipse cx="${x-3}" cy="${y-7}" rx="3.5" ry="2" style="fill:var(--moss)"/><ellipse cx="${x+3}" cy="${y-9}" rx="3.5" ry="2" style="fill:var(--moss)"/>`; }).join("");
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="120" cy="200" rx="90" ry="50" style="fill:var(--grass2)"/><ellipse cx="400" cy="380" rx="100" ry="60" style="fill:var(--grass2)"/><ellipse cx="160" cy="590" rx="110" ry="40" style="fill:var(--grass2)"/></g>
    ${tree(40,30,.7)}${tree(150,26,.6)}${tree(380,28,.65)}${tree(480,30,.7)}
    <g filter="url(#wob)">${waterBand(40, 98)}<path d="M478 94 C470 180 500 300 470 400 C462 430 458 450 452 474" fill="none" style="stroke:var(--water)" stroke-width="14" stroke-linecap="round"/></g>
    ${ripples([[60, 66], [150, 78], [350, 62], [420, 80]])}${ducks(76, false, 20)}
    <g filter="url(#wob)" fill="none" style="stroke:var(--line)" stroke-width="1.1"><path d="M0 44 Q65 36 130 43 T260 42 T390 44 T520 40 M0 100 Q65 104 130 95 T260 98 T390 96 T520 102"/></g>
    <g filter="url(#wob)"><path d="M260 112 L260 ${D.home.door[1]} M260 326 C200 360 130 420 ${D.farm.door[0]} ${D.farm.door[1]} M260 326 C290 420 300 500 ${D.pond.door[0]} ${D.pond.door[1]} M266 312 C330 300 390 290 ${D.shed.door[0]} ${D.shed.door[1]} M254 318 C200 320 150 320 ${D.swing.door[0]} ${D.swing.door[1]} M290 500 C270 552 240 566 ${D.run.door[0]} ${D.run.door[1]}" fill="none" style="stroke:var(--path)" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="260" cy="322" rx="44" ry="20" style="fill:var(--path)"/></g>
    ${flowers([[30,140,"#EFA3A6"],[44,150,"#F3C969"],[200,140,"#C3CDEE"],[330,150,"#EFA3A6"],[488,180,"#F3C969"],[214,410,"#EFA3A6"],[200,470,"#C3CDEE"],[160,600,"#F3C969"],[176,612,"#EFA3A6"],[300,620,"#C3CDEE"],[24,520,"#F3C969"],[372,600,"#EFA3A6"],[400,170,"#C3CDEE"]])}
    ${tree(26,370,.9)}${tree(500,610,.9)}${tree(26,620,.95)}${tree(360,180,.8)}`;
  // chimney stands on the right-hand roof slope (roof line runs y≈196 at x=290 to y≈204 at x=302)
  const homeX = {art:`<path d="M290 168 h12 v36 l-12 -8.6z" style="fill:var(--stone)"/>`, lines:`<path d="M290 196 v-28 h12 v36"/><path d="M288 168 h16"/><path class="smoke" d="M296 164 q-4 -6 0 -11 q4 -5 0 -10" opacity=".6"/>`};
  const places =
    bridge("toTown", 260, 30, 110, "To town", 336, 124) +
    house("home", 205, 220, 110, 74, "var(--card)", "var(--butter)", "Home", "var(--butter)", homeX) +
    // Darren's repair corner: ladder against the wall, toolbox
    sk(`<rect x="326" y="282" width="20" height="12" rx="2" style="fill:var(--rose)"/>`, `<path d="M316 296 l12 -62 M326 296 l12 -62 M318 284 h10 M320 272 h10 M323 260 h10 M325 248 h10"/><rect x="326" y="282" width="20" height="12" rx="2"/><path d="M332 282 v-4 h8 v4"/>`) +
    // letterbox: the morning paper sticks out of it until it's read (#paperIn is toggled by core's render)
    `<g data-place="letterbox" aria-label="Letterbox"><ellipse class="hov" cx="182" cy="314" rx="20" ry="6" style="fill:var(--butter)"/>
      ${sk(`<rect x="179" y="290" width="5" height="24" style="fill:var(--wood)"/><path d="M168 292 v-10 a13 9 0 0 1 26 0 v10z" style="fill:var(--sky)"/>`, `<path d="M181 314 v-22"/><path d="M168 292 v-10 a13 9 0 0 1 26 0 v10z"/><path d="M168 284 h26" opacity=".5"/>`)}
      <g id="paperIn" filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.2"><path d="M194 278 v-12 h9 l-3 4 l3 4 h-9" style="fill:var(--rose)"/><rect x="160" y="283" width="14" height="7" rx="3" transform="rotate(-14 167 286)" style="fill:#FFFDF6"/><path d="M162 285 h9" transform="rotate(-14 167 286)" opacity=".6"/></g></g>` +
`<g data-place="shed" aria-label="Shed"><ellipse class="hov" cx="430" cy="272" rx="40" ry="9" style="fill:var(--butter)"/>
      ${sk(`<path d="M394 222 l36 -24 l40 22 v4 z" style="fill:var(--sage)"/><rect x="398" y="220" width="66" height="50" style="fill:#C9A27E"/><rect x="420" y="236" width="22" height="34" style="fill:var(--wood)"/><rect x="448" y="230" width="12" height="10" style="fill:var(--sky)"/>`,
        `<path d="M394 222 l36 -24 l40 22"/><rect x="398" y="220" width="66" height="50"/><path d="M398 234 h66 M398 248 h66 M398 262 h66" opacity=".35"/><rect x="420" y="236" width="22" height="34"/><circle cx="438" cy="254" r="1.4"/><rect x="448" y="230" width="12" height="10"/><path d="M404 270 l-6 -12 M406 258 v12" opacity=".8"/>`)}
      ${tapeLabel(430, 296, "Shed", "var(--sage)")}</g>
    <g data-place="swing" aria-label="Tree swing"><ellipse class="hov" cx="104" cy="312" rx="34" ry="9" style="fill:var(--butter)"/>
      ${tree(76, 300, 1.6)}<g filter="url(#wob)" ${ink}><path d="M78 256 Q100 250 130 254" stroke-width="3" style="stroke:var(--wood)"/><path class="swing" d="M104 254 v42 M120 254 v42"/><rect class="swing" x="98" y="295" width="28" height="5" rx="2" style="fill:var(--peach)"/></g>
      ${tapeLabel(112, 336, "Swing", "var(--peach)", 11)}</g>
    <g data-place="farm" aria-label="Garden"><ellipse class="hov" cx="108" cy="482" rx="44" ry="10" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><rect x="40" y="406" width="136" height="66" rx="4" style="fill:#B08A6A"/><path d="M48 430 h120 M48 454 h120" opacity=".35"/>${sprouts}
      <path d="M34 478 V400 H182 V478 M34 478 H94 M122 478 H182" fill="none" style="stroke:var(--wood)" stroke-width="2.6"/>${Array.from({length:7}, (_, i) => `<path d="M${34 + i*24.6} 396 v10" style="stroke:var(--wood)" stroke-width="2"/>`).join("")}</g>
      ${tapeLabel(108, 392, "Garden", "var(--sage)")}</g>
    <g data-place="pond" aria-label="Pond"><ellipse class="hov" cx="390" cy="530" rx="96" ry="46" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><ellipse cx="408" cy="504" rx="72" ry="32" style="fill:var(--water)"/><path class="ripple" d="M380 500 q8 -4 16 0 M414 514 q8 -4 16 0" opacity=".6"/>
        <ellipse cx="446" cy="492" rx="8" ry="4" style="fill:var(--tree)"/><circle cx="446" cy="489" r="2.2" style="fill:var(--rose)"/><ellipse cx="370" cy="516" rx="6" ry="3" style="fill:var(--tree)"/>
        <rect x="300" y="546" width="36" height="6" rx="2" style="fill:var(--wood)"/><path d="M304 552 v8 M332 552 v8 M300 542 h36"/></g>
      ${tapeLabel(430, 554, "Pond", "var(--sky)")}</g>` +
    // evening firepit + washing line, just for cosiness
    sk(`<ellipse cx="276" cy="608" rx="20" ry="8" style="fill:var(--stone)"/><path d="M264 606 l24 -6 M264 600 l24 6" style="stroke:var(--wood)" stroke-width="4"/>`,
      `<ellipse cx="276" cy="608" rx="20" ry="8"/><path class="smoke" d="M276 594 q-4 -6 0 -11 q4 -5 0 -10" opacity=".5"/>`) +
    sk("", `<path d="M362 396 v-46 M466 396 v-46 M362 350 Q414 358 466 350"/>`) +
    [[`<path d="M378 354 h16 v18 h-16z" style="fill:var(--sky)"/>`, `<path d="M378 354 h16 v18 h-16z"/>`, 0], [`<path d="M406 356 h14 l3 14 h-20z" style="fill:var(--rose)"/>`, `<path d="M406 356 h14 l3 14 h-20z"/>`, .7], [`<path d="M434 354 h18 v12 h-18z" style="fill:var(--butter)"/>`, `<path d="M434 354 h18 v12 h-18z"/>`, 1.4]]
      .map(([a, l, d]) => `<g class="washing" style="animation-delay:-${d}s">${sk(a, l)}</g>`).join("");
  const fam = (G.F().fam && G.F().fam.owned) || {};
  const famArt = (fam.sandpit ? `<g aria-label="Sandpit">${sk(`<rect x="208" y="512" width="56" height="24" rx="5" style="fill:#F2DDA8"/><path d="M246 506 h8 l-2 8 h-4z" style="fill:var(--rose)"/>`, `<rect x="208" y="512" width="56" height="24" rx="5"/><path d="M212 518 h48" opacity=".5"/><path d="M246 506 h8 l-2 8 h-4z M250 506 v-6"/><path d="M220 528 q5 -5 10 0" opacity=".6"/>`)}</g>` : "")
    + (fam.hammock ? sk(`<path d="M398 600 q32 18 64 0 z" style="fill:var(--peach)"/>`, `<path d="M392 622 v-34 M468 622 v-34 M392 594 l6 6 M468 594 l-6 6"/><path d="M398 600 q32 18 64 0"/><path d="M410 604 l2 -3 M430 608 l1 -4 M450 604 l-2 -3" opacity=".6"/>`) : "");
  const tools = G.F().tools || {};
  const toolArt = (tools.compost ? sk(`<path d="M192 452 h24 l-3 22 h-18z" style="fill:var(--wood)"/><path d="M196 451 c3 -6 13 -6 16 0" style="fill:var(--moss)"/>`, `<path d="M192 452 h24 l-3 22 h-18z M195 460 h18"/>`) : "")
    + (tools.can ? sk(`<rect x="466" y="262" width="14" height="11" rx="2" style="fill:#9CC3E0"/>`, `<rect x="466" y="262" width="14" height="11" rx="2"/><path d="M480 266 l7 -5 M468 262 c0 -5 9 -5 9 0"/>`) : "")
    + (tools.sprinkler ? sk(`<circle cx="108" cy="438" r="4" style="fill:var(--stone)"/>`, `<circle cx="108" cy="438" r="4"/><path d="M108 434 v-4"/><path class="ripple" d="M96 426 q12 -10 24 0" opacity=".7"/>`) : "");
  return lampDefs + ground + [[192, 380], [328, 380]].map(([x, y]) => streetLamp(x, y)).join("") + places + runArt(G.F()) + famArt + toolArt + upgradesArt(G.F().totalQuests || 0, "base") + pondLanterns(G.lanterns()) + (G.dusk() ? duskArt() : "");
}
// After 7pm: the light drops, windows glow, the firepit is lit and stars come out over the river.
function duskArt(){
  const win = (x, y, w, h) => `<rect class="glow" x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#FFD98A"/><rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="10" fill="#FFD98A" opacity=".18"/>`;
  const stars = [[30, 14], [96, 22], [176, 10], [330, 18], [420, 12], [500, 22], [250, 8]].map(([x, y]) => `<circle class="twinkle" cx="${x}" cy="${y}" r="1.6" fill="#FFF3C4"/>`).join("");
  return `<rect class="dusk" width="520" height="640" fill="#A3A9DC" style="mix-blend-mode:multiply" pointer-events="none"/>
    <g pointer-events="none">${stars}${win(217, 234, 20, 18)}${win(283, 234, 20, 18)}${win(448, 230, 12, 10)}
      <circle cx="276" cy="602" r="36" fill="#FFB65C" opacity=".28"/>
      <g filter="url(#wob)"><path class="flame" d="M268 604 q-2 -12 8 -20 q-1 8 6 10 q2 6 -2 10z" fill="#F6A23A" style="stroke:var(--line)" stroke-width="1"/><path class="flame" d="M274 604 q0 -7 4 -10 q1 6 3 7 q0 3 -2 3z" fill="#FFE08A"/></g></g>`;
}
// Pancake, the village dog who minds the good news board: sits up wagging when fresh news is pinned, naps otherwise.
function dogArt(x, y, awake){
  const fur = "#E3B07A", ear = "#A9744A", I2 = `style="stroke:var(--line)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"`;
  // no SVG filter here: Safari mis-paints a filtered group that contains text (it showed a copy of the board instead)
  return `<g transform="translate(${x} ${y})" aria-label="Pancake the village dog"><g ${I2}>` + (awake
    ? `<path class="wag" d="M-9 -6 q-9 -4 -8 -14" fill="none"/><ellipse cx="-2" cy="-7" rx="9" ry="7" fill="${fur}"/><path d="M-6 0 v-4 M3 0 v-5" /><ellipse cx="5" cy="-17" rx="6.5" ry="6" fill="${fur}"/><ellipse cx="10" cy="-15" rx="3" ry="2.2" fill="#F2D3AE"/><circle cx="12.4" cy="-15.6" r="1.1" fill="var(--line)" stroke="none"/><path d="M1 -22 q-5 2 -3 9 q4 -2 3 -9z" fill="${ear}"/><circle cx="6.5" cy="-18.5" r=".9" fill="var(--line)" stroke="none"/><path d="M-3 -2 q6 3 11 -1" style="stroke:var(--rose)" stroke-width="2.2"/>`
    : `<path d="M-14 -3 q-4 -6 2 -9" fill="none"/><ellipse cx="0" cy="-5" rx="13" ry="6" fill="${fur}"/><ellipse cx="10" cy="-6" rx="6" ry="4.6" fill="${fur}"/><path d="M5 -10 q-4 1 -3 6 q3 -1 3 -6z" fill="${ear}"/><path d="M10 -7 q1.5 1 3 0" fill="none"/><path d="M15 -19 h4 l-4 5 h4 M21 -25 h3 l-3 4 h3" fill="none" stroke-width="1" opacity=".6"/>`)
    + `</g></g>`;
}
/* ---------- Makers' Lane: the apps ---------- */
export function laneArt(){
  const L = {green: "#7FB069", amber: "#F3B54A", red: "#E8574C", grey: "#B9B0A4"};
  const light = (app, x, y) => { const h = G.health ? G.health(app) : null; if (!h) return "";
    return `<g pointer-events="none"><circle cx="${x}" cy="${y}" r="7.5" fill="#FFFDF6" style="stroke:var(--line)" stroke-width="1.2"/><circle class="${h.status === "red" ? "twinkle" : ""}" cx="${x}" cy="${y}" r="4.5" fill="${L[h.status]}"/></g>`; };
  const D = VILLAGE;
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="140" cy="420" rx="110" ry="60" style="fill:var(--grass2)"/><ellipse cx="420" cy="520" rx="90" ry="50" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M20 330 C120 334 200 340 262 344 C330 346 380 320 ${D.chico.door[0]} ${D.chico.door[1]} M150 336 L${D.chord.door[0]} ${D.chord.door[1]} M262 344 L262 420 M262 420 C230 470 190 500 ${D.plot3.door[0]} ${D.plot3.door[1]} M262 420 C300 470 340 500 ${D.plot4.door[0]} ${D.plot4.door[1]}" fill="none" style="stroke:var(--path)" stroke-width="22" stroke-linecap="round"/></g>
    ${flowers([[40,200,"#EFA3A6"],[60,214,"#F3C969"],[480,330,"#C3CDEE"],[300,420,"#EFA3A6"],[200,600,"#F3C969"],[90,560,"#C3CDEE"],[460,600,"#EFA3A6"],[330,250,"#F3C969"]])}
    ${tree(30,120,1)}${tree(250,80,.9)}${tree(490,110,1)}${tree(40,620,.95)}${tree(490,620,.9)}${tree(470,430,.85)}${tree(60,440,.9)}`;
  const gate = `<g data-place="toTownE" aria-label="Gate to the town square"><ellipse class="hov" cx="22" cy="330" rx="24" ry="30" style="fill:var(--butter)"/>
    ${sk(`<rect x="6" y="292" width="6" height="56" style="fill:var(--wood)"/><rect x="30" y="292" width="6" height="56" style="fill:var(--wood)"/><path d="M2 296 q19 -14 38 0 v6 q-19 -12 -38 0z" style="fill:var(--sage)"/>`,
      `<rect x="6" y="292" width="6" height="56"/><rect x="30" y="292" width="6" height="56"/><path d="M2 296 q19 -14 38 0 v6 q-19 -12 -38 0z"/>`)}
    ${tapeLabel(62, 366, "Town square", "var(--butter)", 11)}</g>`;
  // plots for the next apps: fenced patches of turned earth, each with a little "coming soon" sign
  const plotArt = (id, x, name, col) => `<g data-place="${id}" aria-label="${name}'s plot"><ellipse class="hov" cx="${x}" cy="530" rx="56" ry="11" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x-50}" y="456" width="100" height="66" rx="4" style="fill:#C9A27E"/><rect x="${x-32}" y="432" width="64" height="22" rx="2" style="fill:#FFFDF6"/>`,
      `<path d="M${x-54} 526 V452 H${x+54} V526 M${x-54} 526 H${x-12} M${x+12} 526 H${x+54}" fill="none"/><path d="M${x-44} 474 h88 M${x-44} 492 h88 M${x-44} 508 h88" opacity=".35"/><rect x="${x-32}" y="432" width="64" height="22" rx="2"/>`)}
    <text x="${x}" y="447" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="10" textLength="52" lengthAdjust="spacingAndGlyphs" style="fill:var(--line)">coming soon</text>
    ${tapeLabel(x, 552, name, col, 11)}</g>`;
  const plot = plotArt("plot3", 160, "Luna", "var(--peri)") + plotArt("plot4", 362, "Ohayo", "var(--peach)");
  return lampDefs + ground + gate + [[70, 352], [250, 352], [460, 352], [260, 560]].map(([x, y]) => streetLamp(x, y)).join("")
    + `<g transform="translate(60 0)">${chordWorkshop()}</g><g transform="translate(295 -230)">${chicoCottage()}</g>` + plot
    + light("chord", 200, 196) + light("chico", 433, 206)
    + userGarden("chord", 214, 216, 4, 3, 12) + userGarden("chico", 330, 324, 8, 2, 12)
    + upgradesArt(G.F().totalQuests || 0, "lane");
}
export function notesArt(x, y, n){
  const c = ["#FFFDF6","#F6E3A1","#F4C7CF","#C3CDEE","#DCE8C8"];
  return Array.from({length:Math.min(5, n)}, (_, i) => `<rect x="${x + i*10}" y="${y + (i%2)*6}" width="12" height="14" transform="rotate(${(i%2 ? 6 : -5)} ${x + 6 + i*10} ${y + 7})" style="fill:${c[i]}"/>`).join("");
}

/* ---------- furniture (x,y = centre of the front edge) ---------- */
export function furn(kind, x, y){
  const W2 = "var(--wood)";
  const legs = (w, h) => `<path d="M${x-w/2+6} ${y} v${h} M${x+w/2-6} ${y} v${h}"/>`;
  switch (kind){
    case "desk": return sk(`<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3" style="fill:${W2}"/><rect x="${x-18}" y="${y-50}" width="36" height="20" rx="2" style="fill:#DCE3EE"/><rect x="${x+22}" y="${y-38}" width="16" height="10" rx="1" style="fill:var(--card)"/><circle cx="${x-34}" cy="${y-36}" r="5" style="fill:var(--sky)"/>`,
      `<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3"/><rect x="${x-18}" y="${y-50}" width="36" height="20" rx="2"/><path d="M${x-22} ${y-30} h44"/><rect x="${x+22}" y="${y-38}" width="16" height="10" rx="1"/><circle cx="${x-34}" cy="${y-36}" r="5"/><path d="M${x-46} ${y-6} v14 M${x+46} ${y-6} v14"/>`);
    case "typewriter": return sk(`<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3" style="fill:${W2}"/><rect x="${x-26}" y="${y-48}" width="52" height="22" rx="5" style="fill:var(--peach)"/><rect x="${x-16}" y="${y-64}" width="32" height="18" style="fill:#FFFDF6"/>`,
      `<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3"/><rect x="${x-26}" y="${y-48}" width="52" height="22" rx="5"/><rect x="${x-16}" y="${y-64}" width="32" height="18"/><path d="M${x-10} ${y-58} h20 M${x-10} ${y-53} h14"/><path d="M${x-18} ${y-36} h36 M${x-18} ${y-31} h36" stroke-dasharray="2 3"/><path d="M${x-46} ${y-6} v14 M${x+46} ${y-6} v14"/>`);
    case "table": return sk(`<ellipse cx="${x}" cy="${y-22}" rx="58" ry="24" style="fill:${W2}"/><rect x="${x-26}" y="${y-36}" width="22" height="16" transform="rotate(-8 ${x-15} ${y-28})" style="fill:#FFFDF6"/><circle cx="${x+22}" cy="${y-26}" r="6" style="fill:var(--sky)"/>`,
      `<ellipse cx="${x}" cy="${y-22}" rx="58" ry="24"/><path d="M${x-30} ${y} v12 M${x+30} ${y} v12"/><rect x="${x-26}" y="${y-36}" width="22" height="16" transform="rotate(-8 ${x-15} ${y-28})"/><circle cx="${x+22}" cy="${y-26}" r="6"/>`);
    case "whiteboard": return sk(`<rect x="${x-46}" y="${y-92}" width="92" height="58" rx="3" style="fill:#FFFFFF"/><path d="M${x-30} ${y-76} q14 -8 28 0 t28 0" style="stroke:var(--peri2)" stroke-width="2" fill="none"/><path d="M${x-30} ${y-58} h40" style="stroke:var(--rose)" stroke-width="2"/>`,
      `<rect x="${x-46}" y="${y-92}" width="92" height="58" rx="3"/><path d="M${x-30} ${y-34} l-8 34 M${x+30} ${y-34} l8 34 M${x-46} ${y-30} h92"/>`);
    case "phone": return sk(`<rect x="${x-26}" y="${y-100}" width="52" height="100" rx="6" style="fill:var(--peri)"/><rect x="${x-16}" y="${y-86}" width="32" height="40" rx="3" style="fill:var(--sky)"/><rect x="${x-6}" y="${y-38}" width="12" height="16" rx="3" style="fill:var(--sock)"/>`,
      `<rect x="${x-26}" y="${y-100}" width="52" height="100" rx="6"/><rect x="${x-16}" y="${y-86}" width="32" height="40" rx="3"/><rect x="${x-6}" y="${y-38}" width="12" height="16" rx="3"/>`);
    case "shelf": case "craft": {
      const cols = kind === "craft" ? ["var(--rose)","var(--butter)","var(--sage)","var(--peri)","var(--peach)","var(--sky)"] : ["var(--peri2)","var(--rose)","var(--moss)","var(--honey)","var(--peach)","var(--sky)"];
      let b = ""; for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) b += `<rect x="${x-38 + i*12.5}" y="${y-88 + r*28}" width="${kind === "craft" ? 11 : 8}" height="${kind === "craft" ? 12 : 20}" style="fill:${cols[(i + r) % 6]}"/>`;
      return sk(`<rect x="${x-44}" y="${y-96}" width="88" height="96" rx="3" style="fill:${W2}"/>${b}`, `<rect x="${x-44}" y="${y-96}" width="88" height="96" rx="3"/><path d="M${x-44} ${y-68} h88 M${x-44} ${y-40} h88 M${x-44} ${y-12} h88"/>`); }
    case "bench": return sk(`<rect x="${x-56}" y="${y-30}" width="112" height="24" rx="2" style="fill:${W2}"/><circle cx="${x+30}" cy="${y-40}" r="9" style="fill:var(--stone)"/><rect x="${x-40}" y="${y-44}" width="30" height="6" rx="2" style="fill:var(--sock)"/>`,
      `<rect x="${x-56}" y="${y-30}" width="112" height="24" rx="2"/><circle cx="${x+30}" cy="${y-40}" r="9"/><circle cx="${x+30}" cy="${y-40}" r="3"/><rect x="${x-40}" y="${y-44}" width="30" height="6" rx="2"/><path d="M${x-12} ${y-44} v-8 h8 v8"/><path d="M${x-50} ${y-6} v14 M${x+50} ${y-6} v14"/>`);
    case "press": return sk(`<rect x="${x-44}" y="${y-30}" width="88" height="30" rx="3" style="fill:var(--sage)"/><circle cx="${x-14}" cy="${y-46}" r="14" style="fill:var(--stone)"/><circle cx="${x+18}" cy="${y-46}" r="14" style="fill:var(--stone)"/><rect x="${x-30}" y="${y-70}" width="40" height="14" style="fill:#FFFDF6"/>`,
      `<rect x="${x-44}" y="${y-30}" width="88" height="30" rx="3"/><circle cx="${x-14}" cy="${y-46}" r="14"/><circle cx="${x+18}" cy="${y-46}" r="14"/><rect x="${x-30}" y="${y-70}" width="40" height="14"/><path d="M${x+40} ${y-30} l14 -30"/>`);
    case "cork": { let p = ""; const c = ["#FFFDF6","#F6E3A1","#F4C7CF","#C3CDEE","#DCE8C8","#FFFDF6"];
      for (let i = 0; i < 6; i++) p += `<rect x="${x-36 + (i%3)*26}" y="${y-86 + Math.floor(i/3)*24}" width="18" height="18" style="fill:${c[i]}"/><circle cx="${x-27 + (i%3)*26}" cy="${y-81 + Math.floor(i/3)*24}" r="2" style="fill:var(--rose)"/>`;
      return sk(`<rect x="${x-46}" y="${y-96}" width="92" height="62" rx="3" style="fill:#D9B893"/>${p}`, `<rect x="${x-46}" y="${y-96}" width="92" height="62" rx="3"/><path d="M${x-34} ${y-34} l-6 34 M${x+34} ${y-34} l6 34"/>`); }
    case "nook": return sk(`<path d="M${x-40} ${y} v-34 q0 -22 22 -22 h20 q22 0 22 22 v34z" style="fill:var(--peach)"/><rect x="${x-30}" y="${y-30}" width="44" height="18" rx="6" style="fill:var(--cream)"/><circle cx="${x+44}" cy="${y-70}" r="12" style="fill:var(--butter)"/>`,
      `<path d="M${x-40} ${y} v-34 q0 -22 22 -22 h20 q22 0 22 22 v34z"/><rect x="${x-30}" y="${y-30}" width="44" height="18" rx="6"/><path d="M${x+44} ${y-58} v58 M${x+36} ${y} h16"/><path d="M${x+32} ${y-70} h24 l-4 -12 h-16z"/>`);
    case "sofa": return sk(`<rect x="${x-56}" y="${y-44}" width="112" height="28" rx="12" style="fill:var(--sage)"/><rect x="${x-60}" y="${y-24}" width="120" height="24" rx="10" style="fill:var(--sage)"/><rect x="${x-40}" y="${y-38}" width="24" height="18" rx="6" style="fill:var(--butter)"/><rect x="${x+16}" y="${y-38}" width="24" height="18" rx="6" style="fill:var(--rose)"/>`,
      `<rect x="${x-56}" y="${y-44}" width="112" height="28" rx="12"/><rect x="${x-60}" y="${y-24}" width="120" height="24" rx="10"/><rect x="${x-40}" y="${y-38}" width="24" height="18" rx="6"/><rect x="${x+16}" y="${y-38}" width="24" height="18" rx="6"/>`);
    case "kitchen": return sk(`<rect x="${x-56}" y="${y-40}" width="112" height="40" rx="3" style="fill:var(--card)"/><rect x="${x-56}" y="${y-46}" width="112" height="8" style="fill:${W2}"/><circle cx="${x-24}" cy="${y-52}" r="9" style="fill:var(--stone)"/><path d="M${x+8} ${y-62} h28 v14 h-28z" style="fill:var(--rose)"/>`,
      `<rect x="${x-56}" y="${y-40}" width="112" height="40" rx="3"/><path d="M${x-56} ${y-46} h112 v6"/><circle cx="${x-24}" cy="${y-52}" r="9"/><path d="M${x+8} ${y-62} h28 v14 h-28z M${x+36} ${y-58} h6"/><path d="M${x} ${y-40} v40" opacity=".5"/><path class="smoke" d="M${x+20} ${y-66} q-3 -5 0 -9 q3 -4 0 -8" opacity=".6"/>`);
    case "laundry": return sk(`<path d="M${x-30} ${y-34} h60 l-6 34 h-48z" style="fill:#E8D3B0"/><path d="M${x-24} ${y-34} q10 -14 22 -4 q10 -12 26 0z" style="fill:var(--sky)"/><path d="M${x-8} ${y-38} q8 -10 18 -2z" style="fill:var(--rose)"/>`,
      `<path d="M${x-30} ${y-34} h60 l-6 34 h-48z"/><path d="M${x-26} ${y-24} h52 M${x-24} ${y-14} h48" opacity=".5"/><path d="M${x-24} ${y-34} q10 -14 22 -4 q10 -12 26 0"/>`);
    // Mel's room (and its door in the house)
    case "sidedoor": return sk(`<path d="M${x-40} ${y-108} L${x-12} ${y-96} L${x-12} ${y+4} L${x-40} ${y+14}z" style="fill:var(--blush)"/><path d="M${x-36} ${y-80} l20 6 v14 l-20 -6z" style="fill:#FFFDF6"/>`,
      `<path d="M${x-40} ${y-108} L${x-12} ${y-96} L${x-12} ${y+4} L${x-40} ${y+14}z"/><circle cx="${x-17}" cy="${y-42}" r="1.8"/><path d="M${x-36} ${y-80} l20 6 v14 l-20 -6z"/><path d="M${x-27} ${y-70} c-2 -3 -5 -1 -3 2 l3 3 l3 -2 c2 -3 -1 -5 -3 -3" />`);
    // Evan's room (and its door on the east wall of the house)
    // the town hall's kind-words corkboard, hung on the back wall (x,y = the wall's foot below it)
    // Mel's routines noticeboard (her room's back wall): pinned lists, one ticked
    case "routineboard": return sk(`<rect x="${x-46}" y="${y-116}" width="92" height="92" rx="4" style="fill:#FFFDF6"/><rect x="${x-38}" y="${y-104}" width="36" height="44" rx="1" transform="rotate(-3 ${x-20} ${y-82})" style="fill:#D6E8F7"/><rect x="${x+2}" y="${y-102}" width="36" height="48" rx="1" transform="rotate(2 ${x+20} ${y-78})" style="fill:#FAD4DC"/><rect x="${x-24}" y="${y-56}" width="48" height="26" rx="1" style="fill:#FFF3B8"/>`,
      `<rect x="${x-46}" y="${y-116}" width="92" height="92" rx="4"/><path d="M${x-32} ${y-92} h22 M${x-32} ${y-84} h18 M${x-32} ${y-76} h22 M${x+8} ${y-90} h22 M${x+8} ${y-82} h18 M${x+8} ${y-74} h22 M${x+8} ${y-66} h14 M${x-16} ${y-46} h30 M${x-16} ${y-38} h22" opacity=".55"/><path d="M${x-36} ${y-93} l2 2 l4 -4"/><circle cx="${x-20}" cy="${y-104}" r="2" style="fill:var(--rose)"/><circle cx="${x+20}" cy="${y-102}" r="2" style="fill:var(--peri2)"/><circle cx="${x}" cy="${y-56}" r="2" style="fill:var(--honey)"/>`);
    // the trophy room: its door in the town hall, the affirmations board, the book on its lectern, pedestals
    // an open archway in the town hall's west wall, sunlit courtyard and greenery beyond
    case "trophydoor": return sk(`<path d="M${x-40} ${y-104} q14 -12 28 -4 L${x-12} ${y+4} L${x-40} ${y+14}z" style="fill:#F3E3B8"/><path d="M${x-40} ${y-20} q8 -10 14 -2 q6 -9 14 0 L${x-12} ${y+4} L${x-40} ${y+14}z" style="fill:#9EBE8C"/><circle cx="${x-28}" cy="${y-62}" r="5" style="fill:#F08FB4"/><circle cx="${x-20}" cy="${y-70}" r="4" style="fill:#E86AA0"/>`,
      `<path d="M${x-40} ${y-104} q14 -12 28 -4 L${x-12} ${y+4} L${x-40} ${y+14}z"/><path d="M${x-44} ${y-106} q16 -14 34 -4" />`);
    case "fountain": return sk(`<ellipse cx="${x}" cy="${y-14}" rx="58" ry="20" style="fill:#D9D2C6"/><ellipse cx="${x}" cy="${y-18}" rx="48" ry="14" style="fill:#9CC3E0"/><rect x="${x-7}" y="${y-58}" width="14" height="40" style="fill:#D9D2C6"/><ellipse cx="${x}" cy="${y-58}" rx="22" ry="7" style="fill:#D9D2C6"/><ellipse cx="${x}" cy="${y-60}" rx="16" ry="4" style="fill:#9CC3E0"/>`,
      `<ellipse cx="${x}" cy="${y-14}" rx="58" ry="20"/><path d="M${x-58} ${y-14} v8 a58 20 0 0 0 116 0 v-8"/><ellipse cx="${x}" cy="${y-18}" rx="48" ry="14"/><rect x="${x-7}" y="${y-58}" width="14" height="40"/><ellipse cx="${x}" cy="${y-58}" rx="22" ry="7"/>
        <path class="smoke" d="M${x} ${y-66} q-10 -14 -20 4 M${x} ${y-66} q10 -14 20 4 M${x} ${y-68} v-10" opacity=".75" style="stroke:#7FB8E8"/>`);
    case "parkbench": return sk(`<rect x="${x-52}" y="${y-44}" width="104" height="10" rx="3" style="fill:var(--wood)"/><rect x="${x-56}" y="${y-22}" width="112" height="10" rx="3" style="fill:var(--wood)"/>`,
      `<rect x="${x-52}" y="${y-44}" width="104" height="10" rx="3"/><path d="M${x-44} ${y-34} v12 M${x+44} ${y-34} v12"/><rect x="${x-56}" y="${y-22}" width="112" height="10" rx="3"/><path d="M${x-48} ${y-12} v14 M${x+48} ${y-12} v14"/>`);
    case "affirmboard": return sk(`<rect x="${x-50}" y="${y-116}" width="100" height="92" rx="4" style="fill:#FFFDF6"/><circle cx="${x}" cy="${y-96}" r="9" style="fill:#FFE38A"/>`,
      `<rect x="${x-50}" y="${y-116}" width="100" height="92" rx="4"/><path d="M${x} ${y-110} v-3 M${x} ${y-79} v-3 M${x-15} ${y-96} h3 M${x+12} ${y-96} h3"/><circle cx="${x}" cy="${y-96}" r="9"/><path d="M${x-36} ${y-70} q8 -5 16 0 t16 0 t16 0 t16 0 M${x-36} ${y-56} q8 -5 16 0 t16 0 t16 0 M${x-36} ${y-42} q8 -5 16 0 t16 0 t16 0 t16 0" opacity=".6"/>`);
    case "lectern": return sk(`<path d="M${x-30} ${y-62} h60 l-8 18 h-44z" style="fill:var(--wood)"/><path d="M${x-8} ${y-44} h16 v38 h-16z" style="fill:var(--wood)"/><path d="M${x-26} ${y-6} h52 v6 h-52z" style="fill:#8B5E3C"/>
        <path d="M${x-36} ${y-66} q18 -10 36 -4 q18 -6 36 4 l-2 8 q-17 -8 -34 -2 q-17 -6 -34 2z" style="fill:#FFFDF6"/><path d="M${x-38} ${y-62} q19 -6 38 -1 q19 -5 38 1 l0 4 q-19 -6 -38 -1 q-19 -5 -38 1z" style="fill:#8E2C48"/>`,
      `<path d="M${x-30} ${y-62} h60 l-8 18 h-44z"/><path d="M${x-8} ${y-44} h16 v38 h-16z"/><path d="M${x-26} ${y-6} h52 v6 h-52z"/><path d="M${x-36} ${y-66} q18 -10 36 -4 q18 -6 36 4 M${x} ${y-70} v8"/><path d="M${x-28} ${y-68} h20 M${x+8} ${y-68} h20" opacity=".5"/><path d="M${x+20} ${y-64} v10 l3 -2 l3 2 v-10" style="fill:var(--honey)"/>`);
    case "pedestal": { const t = G.ped ? G.ped(x, y) : null;
      return sk(`<rect x="${x-30}" y="${y-62}" width="60" height="10" rx="2" style="fill:#F3EEE6"/><rect x="${x-24}" y="${y-52}" width="48" height="44" style="fill:#EAE3D8"/><rect x="${x-30}" y="${y-8}" width="60" height="8" rx="2" style="fill:#F3EEE6"/>`,
        `<rect x="${x-30}" y="${y-62}" width="60" height="10" rx="2"/><rect x="${x-24}" y="${y-52}" width="48" height="44"/><path d="M${x-14} ${y-50} v40 M${x} ${y-50} v40 M${x+14} ${y-50} v40" opacity=".35"/><rect x="${x-30}" y="${y-8}" width="60" height="8" rx="2"/>`)
        + (t ? trophySVG(t, 64).replace("<svg ", `<svg x="${x-32}" y="${y-62-72}" class="ptrophy" `) : `<ellipse cx="${x}" cy="${y-64}" rx="16" ry="3" fill="#000" opacity=".06"/>`); }
    case "kindboard": { const n = G.kudos ? G.kudos() : 0, cols = ["#FFF3B8", "#FAD4DC", "#D6E8F7", "#DCEFD2", "#F7DCC4", "#E6DAF5"];
      const spots = [[-36, -98], [-8, -102], [20, -97], [-30, -70], [0, -66], [26, -72], [-20, -44], [12, -44]];
      const notes = spots.slice(0, Math.min(8, n)).map(([dx, dy], i) => `<rect x="${x+dx}" y="${y+dy}" width="20" height="18" rx="1" transform="rotate(${(i % 3) - 1} ${x+dx+10} ${y+dy+9})" style="fill:${cols[i % 6]}"/>`).join("");
      return sk(`<rect x="${x-52}" y="${y-118}" width="104" height="96" rx="4" style="fill:var(--wood)"/><rect x="${x-46}" y="${y-112}" width="92" height="84" rx="2" style="fill:#D9B893"/>${notes}
        <path d="M${x} ${y-12} c-5 -7 -14 -1 -8 5 l8 8 l8 -8 c6 -6 -3 -12 -8 -5z" style="fill:var(--rose)"/>`,
        `<rect x="${x-52}" y="${y-118}" width="104" height="96" rx="4"/><rect x="${x-46}" y="${y-112}" width="92" height="84" rx="2"/>${spots.slice(0, Math.min(8, n)).map(([dx, dy]) => `<circle cx="${x+dx+10}" cy="${y+dy+2}" r="1.6"/>`).join("")}
        <path d="M${x} ${y-12} c-5 -7 -14 -1 -8 5 l8 8 l8 -8 c6 -6 -3 -12 -8 -5z"/>`); }
    case "kiddoor": return sk(`<path d="M${x+40} ${y-108} L${x+12} ${y-96} L${x+12} ${y+4} L${x+40} ${y+14}z" style="fill:#F7D35A"/><path d="M${x+36} ${y-80} l-20 6 v14 l20 -6z" style="fill:#FFFDF6"/><path d="M${x+21} ${y-62} q2 -9 9 -10 q4 0 3 4 q-2 2 -4 1 l1 5z" style="fill:#7BB37A"/>`,
      `<path d="M${x+40} ${y-108} L${x+12} ${y-96} L${x+12} ${y+4} L${x+40} ${y+14}z"/><circle cx="${x+17}" cy="${y-42}" r="1.8"/><path d="M${x+36} ${y-80} l-20 6 v14 l20 -6z"/><path d="M${x+21} ${y-62} q2 -9 9 -10 q4 0 3 4 q-2 2 -4 1 l1 5z"/>`);
    case "carbed": { const k = G.kid ? G.kid() : {}, sl = !!k.sleep;
      return sk(`<rect x="${x-62}" y="${y-92}" width="118" height="22" rx="8" style="fill:#FFFDF6"/><ellipse cx="${x-44}" cy="${y-90}" rx="18" ry="9" style="fill:#DCEBF6"/>
        <path d="M${x-80} ${y-14} V${y-66} q0 -8 8 -8 H${x+28} l20 -22 h16 q8 0 8 8 V${y-14}z" style="fill:#E86A5C"/><path d="M${x+50} ${y-92} h12 v18 h-28z" style="fill:#DCEBF6"/>
        <rect x="${x-72}" y="${y-48}" width="96" height="10" rx="5" style="fill:#FFFDF6"/>${sl ? `<path d="M${x-62} ${y-78} h86 v12 h-86z" style="fill:#7FB8E8"/><circle cx="${x-46}" cy="${y-92}" r="9" style="fill:var(--skin)"/><path d="M${x-55} ${y-94} q2 -9 10 -9 q7 0 8 7 q-5 -3 -10 -1z" style="fill:var(--hair)"/>` : ""}
        <circle cx="${x-50}" cy="${y-12}" r="15" style="fill:#3B3B44"/><circle cx="${x+42}" cy="${y-12}" r="15" style="fill:#3B3B44"/><circle cx="${x-50}" cy="${y-12}" r="5" style="fill:#D9D9D9"/><circle cx="${x+42}" cy="${y-12}" r="5" style="fill:#D9D9D9"/><circle cx="${x+74}" cy="${y-52}" r="5" style="fill:#FFE38A"/>`,
        `<rect x="${x-62}" y="${y-92}" width="118" height="22" rx="8"/><path d="M${x-80} ${y-14} V${y-66} q0 -8 8 -8 H${x+28} l20 -22 h16 q8 0 8 8 V${y-14}z"/><path d="M${x+50} ${y-92} h12 v18 h-28z"/><rect x="${x-72}" y="${y-48}" width="96" height="10" rx="5"/>
        ${sl ? `<path d="M${x-62} ${y-78} h86 v12 h-86z"/><path d="M${x-50} ${y-92} q2 1.6 4 0 M${x-43} ${y-92} q2 1.6 4 0"/>` : ""}<circle cx="${x-50}" cy="${y-12}" r="15"/><circle cx="${x+42}" cy="${y-12}" r="15"/>`)
        + (sl ? `<text x="${x-20}" y="${y-108}" font-size="12" fill="#3b3530" class="zz" pointer-events="none">z z z</text>` : ""); }
    case "snacks": return sk(`<rect x="${x-38}" y="${y-96}" width="76" height="96" rx="5" style="fill:#F7C6A3"/><rect x="${x-32}" y="${y-88}" width="31" height="80" rx="3" style="fill:#FBD9BD"/><rect x="${x+1}" y="${y-88}" width="31" height="80" rx="3" style="fill:#FBD9BD"/>
        <circle cx="${x-16}" cy="${y-62}" r="9" style="fill:#F26D6D"/><path d="M${x-16} ${y-71} q3 -5 7 -4" style="stroke:#5C8A3A" stroke-width="2" fill="none"/><path d="M${x+9} ${y-74} h14 l3 6 v20 h-20 v-20z" style="fill:#FFFDF6"/><path d="M${x+6} ${y-68} h20" style="stroke:#7FB8E8" stroke-width="3"/>`,
      `<rect x="${x-38}" y="${y-96}" width="76" height="96" rx="5"/><rect x="${x-32}" y="${y-88}" width="31" height="80" rx="3"/><rect x="${x+1}" y="${y-88}" width="31" height="80" rx="3"/><circle cx="${x-6}" cy="${y-30}" r="2.2"/><circle cx="${x+6}" cy="${y-30}" r="2.2"/><circle cx="${x-16}" cy="${y-62}" r="9"/><path d="M${x+9} ${y-74} h14 l3 6 v20 h-20 v-20z"/>`);
    case "balloons": return `<g class="floaty">${sk(`<path d="M${x-22} ${y-58} q-6 -40 -18 -60 M${x} ${y-36} q2 -50 6 -78 M${x+22} ${y-58} q8 -30 24 -54" fill="none"/><ellipse cx="${x-40}" cy="${y-130}" rx="16" ry="19" style="fill:#F26D6D"/><ellipse cx="${x+6}" cy="${y-136}" rx="16" ry="19" style="fill:#7FB8E8"/><ellipse cx="${x+46}" cy="${y-124}" rx="16" ry="19" style="fill:#F7C548"/>`,
        `<path d="M${x-22} ${y-36} q-6 -50 -18 -75 M${x} ${y-36} q2 -50 6 -81 M${x+22} ${y-36} q8 -40 24 -69"/><ellipse cx="${x-40}" cy="${y-130}" rx="16" ry="19"/><ellipse cx="${x+6}" cy="${y-136}" rx="16" ry="19"/><ellipse cx="${x+46}" cy="${y-124}" rx="16" ry="19"/>`)}</g>`
      + sk(`<rect x="${x-44}" y="${y-38}" width="88" height="38" rx="4" style="fill:#7BB37A"/><path d="M${x} ${y-30} l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" style="fill:#F7C548"/>`,
        `<rect x="${x-44}" y="${y-38}" width="88" height="38" rx="4"/><path d="M${x-44} ${y-28} h88"/><path d="M${x} ${y-30} l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z"/>`);
    case "trainset": { let sl = ""; for (let i = 0; i < 18; i++) { const a = i/18*Math.PI*2, cx = x + Math.cos(a)*92, cy = y - 34 + Math.sin(a)*34; sl += `<path d="M${(cx - Math.sin(a)*6).toFixed(1)} ${(cy + Math.cos(a)*6*.4).toFixed(1)} l${(Math.sin(a)*12).toFixed(1)} ${(-Math.cos(a)*12*.4).toFixed(1)}" opacity=".7"/>`; }
      return sk(`<ellipse cx="${x}" cy="${y-34}" rx="92" ry="34" fill="none" style="stroke:#B98B5E" stroke-width="7"/>
        <rect x="${x-34}" y="${y-14}" width="24" height="16" rx="3" style="fill:#7FB8E8"/><rect x="${x-6}" y="${y-14}" width="24" height="16" rx="3" style="fill:#F7C548"/><path d="M${x+22} ${y+2} v-18 h12 v-8 h8 v8 h6 q6 0 6 6 v12z" style="fill:#E86A5C"/>`,
        `${sl}<rect x="${x-34}" y="${y-14}" width="24" height="16" rx="3"/><rect x="${x-6}" y="${y-14}" width="24" height="16" rx="3"/><path d="M${x+22} ${y+2} v-18 h12 v-8 h8 v8 h6 q6 0 6 6 v12z"/><circle cx="${x-26}" cy="${y+3}" r="3.4"/><circle cx="${x+10}" cy="${y+3}" r="3.4"/><circle cx="${x+30}" cy="${y+3}" r="4"/><circle cx="${x+46}" cy="${y+3}" r="4"/>`); }
    case "dinonest": return sk(`<ellipse cx="${x-14}" cy="${y-10}" rx="40" ry="13" style="fill:#C9A27E"/><ellipse cx="${x-28}" cy="${y-22}" rx="9" ry="12" style="fill:#FFF6E2"/><ellipse cx="${x-12}" cy="${y-24}" rx="9" ry="12" style="fill:#FFF6E2"/><ellipse cx="${x+4}" cy="${y-21}" rx="9" ry="12" style="fill:#FFF6E2"/>
        <path d="M${x+20} ${y} q-4 -28 12 -34 q2 -22 16 -20 q10 2 8 12 q-2 6 -10 6 q4 12 2 36z" style="fill:#7BB37A"/><path d="M${x+28} ${y-36} l-4 -6 l6 1 l1 -6 l5 4" style="fill:#F7C548"/><circle cx="${x-12}" cy="${y-26}" r="2.2" style="fill:#F2A65A"/><circle cx="${x-28}" cy="${y-20}" r="2" style="fill:#A8CF8E"/>`,
      `<ellipse cx="${x-14}" cy="${y-10}" rx="40" ry="13"/><path d="M${x-48} ${y-12} l6 -4 M${x-36} ${y-4} l5 -6 M${x+12} ${y-6} l6 -4" opacity=".6"/><ellipse cx="${x-28}" cy="${y-22}" rx="9" ry="12"/><ellipse cx="${x-12}" cy="${y-24}" rx="9" ry="12"/><ellipse cx="${x+4}" cy="${y-21}" rx="9" ry="12"/>
        <path d="M${x+20} ${y} q-4 -28 12 -34 q2 -22 16 -20 q10 2 8 12 q-2 6 -10 6 q4 12 2 36z"/><circle cx="${x+50}" cy="${y-46}" r="1.6"/>`);
    case "garage": return sk(`<path d="M${x-40} ${y-14} v-38 l40 -22 l40 22 v38z" style="fill:#9BC1E6"/><path d="M${x-22} ${y-14} v-26 h44 v26z" style="fill:#4A5568"/><path d="M${x-46} ${y-52} l46 -26 l46 26" style="fill:none"/>
        <path d="M${x-58} ${y+6} v-8 q0 -3 3 -3 h7 l5 -6 h12 q3 0 4 3 l4 6 q4 0 4 4 v4z" style="fill:#E86A5C"/><path d="M${x+20} ${y+8} v-8 q0 -3 3 -3 h7 l5 -6 h12 q3 0 4 3 l4 6 q4 0 4 4 v4z" style="fill:#F7C548"/>`,
      `<path d="M${x-40} ${y-14} v-38 l40 -22 l40 22 v38z"/><path d="M${x-22} ${y-14} v-26 h44 v26z M${x-22} ${y-32} h44 M${x-22} ${y-24} h44"/><path d="M${x-58} ${y+6} v-8 q0 -3 3 -3 h7 l5 -6 h12 q3 0 4 3 l4 6 q4 0 4 4 v4z"/><circle cx="${x-50}" cy="${y+7}" r="3.4"/><circle cx="${x-32}" cy="${y+7}" r="3.4"/>
        <path d="M${x+20} ${y+8} v-8 q0 -3 3 -3 h7 l5 -6 h12 q3 0 4 3 l4 6 q4 0 4 4 v4z"/><circle cx="${x+28}" cy="${y+9}" r="3.4"/><circle cx="${x+46}" cy="${y+9}" r="3.4"/>`);
    case "bed": { const sl = G.S && G.S().sleep, d = (G.F().decor || {}), pj = d.me_pj ? "#3B4A86" : "var(--tank)";
      return sk(`<rect x="${x-78}" y="${y-132}" width="156" height="40" rx="10" style="fill:var(--wood)"/><rect x="${x-74}" y="${y-104}" width="148" height="100" rx="6" style="fill:#FFFDF6"/>
        <rect x="${x-66}" y="${y-100}" width="58" height="24" rx="9" style="fill:#F6EEF4"/><rect x="${x+8}" y="${y-100}" width="58" height="24" rx="9" style="fill:#F6EEF4"/>
        <path d="M${x-74} ${y - (sl ? 74 : 60)} h148 v56 a6 6 0 0 1 -6 6 h-136 a6 6 0 0 1 -6 -6z" style="fill:var(--peri)"/>${d.r_throw ? `<path d="M${x+20} ${y-58} h54 v52 h-54z" style="fill:var(--blush)"/>` : ""}
        ${sl ? `<circle cx="${x-36}" cy="${y-84}" r="11" style="fill:var(--skin)"/><path d="M${x-48} ${y-84} c0 -12 8 -15 13 -15 c8 0 13 5 11 13 c-3 -4 -8 -5 -12 -4 c-4 1 -8 3 -12 6z" style="fill:var(--hair)"/><path d="M${x-50} ${y-76} q14 -6 28 0 v6 h-28z" style="fill:${pj}"/>` : ""}`,
        `<rect x="${x-78}" y="${y-132}" width="156" height="40" rx="10"/><rect x="${x-74}" y="${y-104}" width="148" height="100" rx="6"/><rect x="${x-66}" y="${y-100}" width="58" height="24" rx="9"/><rect x="${x+8}" y="${y-100}" width="58" height="24" rx="9"/>
        <path d="M${x-74} ${y - (sl ? 74 : 60)} h148"/>${d.r_throw ? `<path d="M${x+20} ${y-58} h54 v52 h-54z M${x+28} ${y-58} v52 M${x+40} ${y-58} v52 M${x+52} ${y-58} v52 M${x+64} ${y-58} v52" opacity=".7"/>` : ""}${legs(148, 6)}
        ${sl ? `<path d="M${x-40} ${y-84} q2 1.6 4 0 M${x-33} ${y-84} q2 1.6 4 0"/>` : ""}`) + (sl ? `<text x="${x-14}" y="${y-104}" font-size="11" fill="#3b3530" class="zz" pointer-events="none">z z</text>` : ""); }
    case "curtwindow": { const g = G.F() || {}, night = G.dusk(), shut = g.curtains ? g.curtains === "closed" : (night || !!(G.S && G.S().sleep));
      // each curtain hangs from the rod and sways a little (CSS "sway"), pivoting at the top
      const cur = (fill, lines, ox, delay) => `<g class="sway" style="transform-origin:${ox}px ${y-170}px;animation-delay:-${delay}s">${sk(fill, lines)}</g>`;
      const curtains = shut
        ? cur(`<path d="M${x-50} ${y-170} h50 v86 h-50z" style="fill:var(--rose)"/>`, `<path d="M${x-50} ${y-170} h50 v86 h-50z M${x-40} ${y-160} q4 30 0 70 M${x-20} ${y-164} q-4 34 0 74" opacity=".8"/>`, x - 25, 0)
          + cur(`<path d="M${x} ${y-170} h50 v86 h-50z" style="fill:var(--rose)"/>`, `<path d="M${x} ${y-170} h50 v86 h-50z M${x+20} ${y-164} q4 34 0 74 M${x+40} ${y-160} q-4 30 0 70" opacity=".8"/>`, x + 25, 1.7)
        : cur(`<path d="M${x-58} ${y-170} h18 q-6 44 4 86 h-22z" style="fill:var(--rose)"/>`, `<path d="M${x-58} ${y-170} h18 q-6 44 4 86 h-22z M${x-50} ${y-150} q4 30 -2 60" opacity=".8"/>`, x - 49, 0)
          + cur(`<path d="M${x+40} ${y-170} h18 v86 h-22 q10 -42 4 -86z" style="fill:var(--rose)"/>`, `<path d="M${x+40} ${y-170} h18 v86 h-22 q10 -42 4 -86z M${x+50} ${y-150} q-4 30 2 60" opacity=".8"/>`, x + 49, 1.7);
      return sk(`<rect x="${x-48}" y="${y-168}" width="96" height="82" rx="4" style="fill:${night ? "#3E4673" : "var(--sky)"}"/>${night && !shut ? `<circle cx="${x+18}" cy="${y-142}" r="9" style="fill:#FFF3C4"/>` : !shut ? `<ellipse cx="${x-14}" cy="${y-120}" rx="18" ry="7" style="fill:#FFFDF6"/>` : ""}`,
        `<rect x="${x-48}" y="${y-168}" width="96" height="82" rx="4"/><path d="M${x} ${y-168} v82 M${x-48} ${y-128} h96" opacity="${shut ? 0 : 1}"/>`) + curtains + sk("", `<path d="M${x-62} ${y-172} h124" stroke-width="2.4"/><circle cx="${x-62}" cy="${y-172}" r="2.4"/><circle cx="${x+62}" cy="${y-172}" r="2.4"/>`); }
    case "record": { const on = !!(G.music && G.music());
      return sk(`<rect x="${x-28}" y="${y-30}" width="56" height="30" rx="3" style="fill:var(--wood)"/><rect x="${x-26}" y="${y-44}" width="52" height="16" rx="3" style="fill:var(--peach)"/><ellipse cx="${x-4}" cy="${y-37}" rx="13" ry="5" style="fill:#2F2B28"/><ellipse cx="${x-4}" cy="${y-37}" rx="4" ry="1.6" style="fill:var(--rose)"/>`,
        `<rect x="${x-28}" y="${y-30}" width="56" height="30" rx="3"/><rect x="${x-26}" y="${y-44}" width="52" height="16" rx="3"/><ellipse cx="${x-4}" cy="${y-37}" rx="13" ry="5"/><path d="M${x+16} ${y-42} l-6 6"/><path d="M${x-28} ${y-15} h56" opacity=".4"/>${on ? `<path class="note1" d="M${x+20} ${y-58} v-10 l6 -2 v10 M${x+20} ${y-58} m-3 0 a3 2 0 1 0 6 0" /><path class="note2" d="M${x-24} ${y-62} v-9 l5 -1 v9" />` : ""}`); }
    case "calm": { const c = (G.F().decor || {}).r_candle;
      return sk(`<ellipse cx="${x-26}" cy="${y-12}" rx="30" ry="13" style="fill:var(--peri)"/><ellipse cx="${x+22}" cy="${y-8}" rx="26" ry="11" style="fill:var(--blush)"/><ellipse cx="${x-6}" cy="${y-30}" rx="22" ry="12" style="fill:var(--butter)"/>${c ? `<rect x="${x+40}" y="${y-34}" width="10" height="16" rx="2" style="fill:#FFFDF6"/><path class="flame" d="M${x+45} ${y-36} q-4 -6 0 -11 q4 5 0 11z" style="fill:#F6A23A"/><circle cx="${x+45}" cy="${y-40}" r="14" fill="#FFB65C" opacity=".2"/>` : ""}`,
        `<ellipse cx="${x-26}" cy="${y-12}" rx="30" ry="13"/><ellipse cx="${x+22}" cy="${y-8}" rx="26" ry="11"/><ellipse cx="${x-6}" cy="${y-30}" rx="22" ry="12"/><path d="M${x-30} ${y-12} h8 M${x+18} ${y-8} h8" opacity=".5"/>${c ? `<rect x="${x+40}" y="${y-34}" width="10" height="16" rx="2"/>` : ""}`); }
    case "writedesk": return sk(`<rect x="${x-50}" y="${y-36}" width="100" height="14" rx="3" style="fill:${W2}"/><path d="M${x-26} ${y-44} l22 -4 l22 4 v8 l-22 -3 l-22 3z" style="fill:#FFFDF6"/><path d="M${x+28} ${y-62} h14 l5 14 h-24z" style="fill:var(--butter)"/>`,
      `<rect x="${x-50}" y="${y-36}" width="100" height="14" rx="3"/><path d="M${x-44} ${y-22} v30 M${x+44} ${y-22} v30"/><path d="M${x-26} ${y-44} l22 -4 l22 4 v8 l-22 -3 l-22 3z M${x-4} ${y-48} v9"/><path d="M${x-20} ${y-41} h10 M${x+2} ${y-41} h12" opacity=".5"/><path d="M${x+28} ${y-62} h14 l5 14 h-24z M${x+35} ${y-48} v12 M${x+30} ${y-36} h10"/><path d="M${x+10} ${y-46} l12 -8" stroke-width="1.8"/>`);
    // the planning table: a long wooden desk with an open planner and a little vase of flowers
    case "plantable": return sk(`<rect x="${x-62}" y="${y-34}" width="124" height="26" rx="4" style="fill:#C9A27E"/><path d="M${x-40} ${y-44} l26 -4 l26 4 v9 l-26 -3 l-26 3z" style="fill:#FFFDF6"/><path d="M${x+30} ${y-44} q-6 -2 -5 -10 q1 -8 9 -8 q8 0 9 8 q1 8 -5 10z" style="fill:var(--sky)"/>
        <circle cx="${x+30}" cy="${y-72}" r="6" style="fill:var(--rose)"/><circle cx="${x+40}" cy="${y-66}" r="5" style="fill:var(--butter)"/><circle cx="${x+22}" cy="${y-65}" r="5" style="fill:var(--peri)"/><circle cx="${x+30}" cy="${y-72}" r="2" style="fill:var(--honey)"/>`,
      `<rect x="${x-62}" y="${y-34}" width="124" height="26" rx="4"/><path d="M${x-56} ${y-8} v14 M${x+56} ${y-8} v14 M${x-56} ${y-21} h112" opacity=".4"/><path d="M${x-40} ${y-44} l26 -4 l26 4 v9 l-26 -3 l-26 3z M${x-14} ${y-48} v9 M${x-34} ${y-42} h14 M${x-8} ${y-42} h14" />
        <path d="M${x+30} ${y-44} q-6 -2 -5 -10 q1 -8 9 -8 q8 0 9 8 q1 8 -5 10z"/><path d="M${x+30} ${y-62} v-4 M${x+32} ${y-62} q4 -2 7 -3 M${x+28} ${y-62} q-3 -1 -5 -2" style="stroke:var(--moss2)"/><circle cx="${x+30}" cy="${y-72}" r="6"/><circle cx="${x+40}" cy="${y-66}" r="5"/><circle cx="${x+22}" cy="${y-65}" r="5"/>`);
    case "jarshelf": { const js = (G.jars && G.jars()) || [], W = 176, x0 = x - W/2;
      const mini = (j, i) => { const cx = x0 + 16 + (i % 5)*36, top = y - (i < 5 ? 66 : 32) - 22; return j ? `<svg x="${cx - 11}" y="${top}" width="22" height="29" viewBox="0 0 60 80">${jarArt(j)}</svg>` : ""; };
      return sk(`<rect x="${x0}" y="${y-70}" width="${W}" height="70" rx="3" style="fill:#E2CBA8"/><rect x="${x0}" y="${y-38}" width="${W}" height="6" style="fill:var(--wood)"/><rect x="${x0}" y="${y-6}" width="${W}" height="6" style="fill:var(--wood)"/>`,
        `<rect x="${x0}" y="${y-70}" width="${W}" height="70" rx="3"/><path d="M${x0} ${y-38} h${W} M${x0} ${y-32} h${W} M${x0} ${y-6} h${W}"/>`) + `<g pointer-events="none">${js.map(mini).join("")}</g>`; }
    case "chartstand": return sk(`<rect x="${x-36}" y="${y-96}" width="72" height="58" rx="2" style="fill:#FFFDF6"/><rect x="${x-26}" y="${y-60}" width="10" height="16" style="fill:#7FB069"/><rect x="${x-12}" y="${y-70}" width="10" height="26" style="fill:#7FB069"/><rect x="${x+2}" y="${y-66}" width="10" height="22" style="fill:#7FB069"/><rect x="${x+16}" y="${y-84}" width="10" height="40" style="fill:#4E9A4A"/>`,
      `<rect x="${x-36}" y="${y-96}" width="72" height="58" rx="2"/><path d="M${x-30} ${y-44} h60" /><path d="M${x-30} ${y-80} L${x-6} ${y-88} L${x+8} ${y-84} L${x+30} ${y-94}" stroke-dasharray="3 3" opacity=".7"/><path d="M${x-24} ${y-38} L${x-32} ${y} M${x+24} ${y-38} L${x+32} ${y} M${x} ${y-38} v34"/><path d="M${x-40} ${y-97} h80" stroke-width="2.2"/>`);
    case "wardrobe": return sk(`<rect x="${x-30}" y="${y-96}" width="60" height="96" rx="3" style="fill:var(--peri)"/><path d="M${x-34} ${y-96} h68 l-4 -8 h-60z" style="fill:var(--peri2)"/><rect x="${x-24}" y="${y-88}" width="22" height="80" rx="2" style="fill:#DCE3F4"/><rect x="${x+2}" y="${y-88}" width="22" height="80" rx="2" style="fill:#DCE3F4"/>`,
      `<rect x="${x-30}" y="${y-96}" width="60" height="96" rx="3"/><path d="M${x-34} ${y-96} h68 l-4 -8 h-60z"/><rect x="${x-24}" y="${y-88}" width="22" height="80" rx="2"/><rect x="${x+2}" y="${y-88}" width="22" height="80" rx="2"/><circle cx="${x-5}" cy="${y-48}" r="1.6"/><circle cx="${x+5}" cy="${y-48}" r="1.6"/><path d="M${x-24} ${y} v4 M${x+24} ${y} v4"/>`);
    case "cupboard": return sk(`<rect x="${x-36}" y="${y-84}" width="72" height="84" rx="3" style="fill:#F9F7F2"/><rect x="${x+42}" y="${y-30}" width="14" height="30" rx="4" style="fill:var(--sky)"/>`,
      `<rect x="${x-36}" y="${y-84}" width="72" height="84" rx="3"/><path d="M${x} ${y-84} v84"/><circle cx="${x-5}" cy="${y-42}" r="1.8"/><circle cx="${x+5}" cy="${y-42}" r="1.8"/><rect x="${x+42}" y="${y-30}" width="14" height="30" rx="4"/><path d="M${x+46} ${y-30} v-6 h8"/>`);
    case "counter": return sk(`<rect x="${x-58}" y="${y-36}" width="116" height="36" rx="3" style="fill:${W2}"/><rect x="${x-44}" y="${y-52}" width="24" height="16" style="fill:#FFFDF6"/><rect x="${x-14}" y="${y-50}" width="24" height="14" style="fill:var(--butter)"/><rect x="${x+18}" y="${y-54}" width="24" height="18" style="fill:var(--sky)"/>`,
      `<rect x="${x-58}" y="${y-36}" width="116" height="36" rx="3"/><rect x="${x-44}" y="${y-52}" width="24" height="16"/><path d="M${x-44} ${y-52} l12 8 l12 -8"/><rect x="${x-14}" y="${y-50}" width="24" height="14"/><rect x="${x+18}" y="${y-54}" width="24" height="18"/>`);
    case "cabinet": return sk(`<rect x="${x-30}" y="${y-92}" width="60" height="92" rx="3" style="fill:#C9CFC4"/>`,
      `<rect x="${x-30}" y="${y-92}" width="60" height="92" rx="3"/><path d="M${x-30} ${y-62} h60 M${x-30} ${y-32} h60"/><path d="M${x-8} ${y-78} h16 M${x-8} ${y-48} h16 M${x-8} ${y-18} h16" stroke-width="3"/>`);
    case "scales": return sk(`<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3" style="fill:${W2}"/><path d="M${x-36} ${y-30} h28 l-4 -10 h-20z" style="fill:var(--butter)"/><rect x="${x+10}" y="${y-48}" width="12" height="18" rx="2" style="fill:var(--rose)"/><rect x="${x+28}" y="${y-40}" width="20" height="10" style="fill:#FFFDF6"/>`,
      `<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3"/><path d="M${x-36} ${y-30} h28 l-4 -10 h-20z M${x-22} ${y-40} v-10 h-10 h20"/><rect x="${x+10}" y="${y-48}" width="12" height="18" rx="2"/><rect x="${x+28}" y="${y-40}" width="20" height="10"/><path d="M${x-46} ${y-6} v14 M${x+46} ${y-6} v14"/>`);
    case "treadmill": return sk(`<rect x="${x-24}" y="${y-74}" width="48" height="74" rx="8" style="fill:var(--sock)"/><rect x="${x-17}" y="${y-66}" width="34" height="58" rx="4" style="fill:#6B5A52"/><rect x="${x-30}" y="${y-96}" width="60" height="16" rx="4" style="fill:var(--peri)"/><rect x="${x-14}" y="${y-93}" width="20" height="9" rx="2" style="fill:#DCE8C8"/>`,
      `<rect x="${x-24}" y="${y-74}" width="48" height="74" rx="8"/><path d="M${x-17} ${y-56} h34 M${x-17} ${y-44} h34 M${x-17} ${y-32} h34 M${x-17} ${y-20} h34" opacity=".45"/><path d="M${x-26} ${y-80} v28 M${x+26} ${y-80} v28" stroke-width="2.4"/><rect x="${x-30}" y="${y-96}" width="60" height="16" rx="4"/><rect x="${x-14}" y="${y-93}" width="20" height="9" rx="2"/><text x="${x-4}" y="${y-86}" text-anchor="middle" font-family="Klee One,serif" font-size="7" stroke="none" style="fill:var(--line)">1.2</text>`);
    case "healthchord": case "healthchico": {
      // a standing sign: three lights (worst check first) and a big status word from the nightly bug check
      const h = G && G.health ? G.health(kind.slice(6)) : null, L = {green: "#7FB069", amber: "#F3B54A", red: "#E8574C", grey: "#B9B0A4"};
      const st = h ? h.status : "grey", word = {green: "ALL GOOD", amber: "WATCH", red: "NEEDS YOU", grey: "NO REPORT"}[st];
      const lights = (h && h.checks.length ? h.checks.slice(0, 3).map(c => c.state) : [st, st, st]).map((c, i) => `<circle cx="${x-18 + i*18}" cy="${y-62}" r="6" style="fill:${L[c]}"/>`).join("");
      return sk(`<rect x="${x-3}" y="${y-30}" width="6" height="30" style="fill:var(--wood)"/><rect x="${x-34}" y="${y-80}" width="68" height="52" rx="5" style="fill:#FFFDF6"/>${lights}`,
        `<rect x="${x-34}" y="${y-80}" width="68" height="52" rx="5"/><path d="M${x-3} ${y-28} v28 M${x+3} ${y-28} v28 M${x-12} ${y} h24"/>${lights.replace(/ style="[^"]*"/g, "")}`)
        + `<text x="${x}" y="${y-38}" text-anchor="middle" font-family="Mulish,sans-serif" font-weight="800" font-size="9" letter-spacing=".6" style="fill:${L[st] === L.grey ? "var(--line)" : L[st]}">${word}</text>`; }
    case "pobox": { let c = ""; for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) c += `<rect x="${x-20 + i*21}" y="${y-80 + r*24}" width="19" height="20" rx="1" style="fill:${G && G.postCount && G.postCount() > r*2 + i ? "#FFFDF6" : "#9C7A5C"}"/>`;
      return sk(`<rect x="${x-24}" y="${y-84}" width="48" height="84" rx="3" style="fill:var(--wood)"/>${c}`, `<rect x="${x-24}" y="${y-84}" width="48" height="84" rx="3"/>${c.replace(/ style="[^"]*"/g, "")}`); }
    case "fridge": return sk(`<rect x="${x-20}" y="${y-84}" width="40" height="84" rx="5" style="fill:#F4F1EA"/><rect x="${x-14}" y="${y-74}" width="13" height="16" style="fill:#FFFDF6"/><circle cx="${x+9}" cy="${y-70}" r="3" style="fill:var(--rose)"/><circle cx="${x+3}" cy="${y-46}" r="2.6" style="fill:var(--butter)"/>`,
      `<rect x="${x-20}" y="${y-84}" width="40" height="84" rx="5"/><path d="M${x-20} ${y-54} h40"/><path d="M${x+14} ${y-76} v12 M${x+14} ${y-46} v14" stroke-width="2"/><rect x="${x-14}" y="${y-74}" width="13" height="16"/><path d="M${x-12} ${y-69} h9 M${x-12} ${y-64} h7" opacity=".6"/>`);
    case "office": return sk(`<rect x="${x-40}" y="${y-28}" width="72" height="22" rx="3" style="fill:${W2}"/><path d="M${x-22} ${y-30} l4 -18 h26 l-4 18z" style="fill:#DCE3EE"/><rect x="${x-26}" y="${y-32}" width="34" height="4" rx="1" style="fill:var(--stone)"/><circle cx="${x+20}" cy="${y-34}" r="5" style="fill:var(--peach)"/><rect x="${x+38}" y="${y-30}" width="22" height="20" rx="4" style="fill:var(--sage)"/>`,
      `<rect x="${x-40}" y="${y-28}" width="72" height="22" rx="3"/><path d="M${x-22} ${y-30} l4 -18 h26 l-4 18z"/><rect x="${x-26}" y="${y-32}" width="34" height="4" rx="1"/><circle cx="${x+20}" cy="${y-34}" r="5"/><path d="M${x+16} ${y-39} q4 -6 8 0" opacity=".6"/><path d="M${x-34} ${y-6} v12 M${x+26} ${y-6} v12"/><rect x="${x+38}" y="${y-30}" width="22" height="20" rx="4"/><path d="M${x+42} ${y-10} v14 M${x+56} ${y-10} v14"/>`);
    case "bookcase": return furn("shelf", x, y) + sk(`<path d="M${x+20} ${y-104} h30 l-4 8 l4 8 h-30z" style="fill:var(--butter)"/>`,
      `<path d="M${x+20} ${y-104} h30 l-4 8 l4 8 h-30z"/><text x="${x+33}" y="${y-93}" text-anchor="middle" font-family="Klee One,serif" font-size="8" stroke="none" style="fill:var(--line)">new</text>`);
    case "shopcounter": return sk(`<rect x="${x-90}" y="${y-40}" width="180" height="40" rx="4" style="fill:${W2}"/><path d="M${x-96} ${y-118} h192 l-8 18 h-176z" style="fill:#F9F7F2"/><circle cx="${x-50}" cy="${y-52}" r="10" style="fill:var(--rose)"/><circle cx="${x-24}" cy="${y-52}" r="10" style="fill:var(--butter)"/><circle cx="${x+4}" cy="${y-52}" r="10" style="fill:var(--sage)"/><rect x="${x+30}" y="${y-64}" width="40" height="24" rx="3" style="fill:#FFFDF6"/>`,
      `<rect x="${x-90}" y="${y-40}" width="180" height="40" rx="4"/><path d="M${x-96} ${y-118} h192 l-8 18 h-176z"/><path d="M${x-80} ${y-118} l-3 18 M${x-50} ${y-118} l-2 18 M${x-20} ${y-118} l-1 18 M${x+10} ${y-118} v18 M${x+40} ${y-118} l1 18 M${x+70} ${y-118} l2 18" style="stroke:var(--rose)" stroke-width="6"/><path d="M${x-86} ${y-100} v60 M${x+86} ${y-100} v60"/><rect x="${x+30}" y="${y-64}" width="40" height="24" rx="3"/><text x="${x+50}" y="${y-48}" text-anchor="middle" font-family="Klee One,serif" font-size="11" stroke="none" style="fill:var(--line)">open</text>`);
  }
  return "";
}
export function roomArt(id){
  const r = ROOMS[id], st = stationsOf(id);
  let h = roomShell(id);
  if (id !== "market" && !r.noBoard) h += `<g data-spot="board" aria-label="Quest board"><ellipse class="hov" cx="260" cy="204" rx="40" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="222" y="40" width="76" height="56" rx="3" style="fill:var(--wood)"/>`, `<rect x="222" y="40" width="76" height="56" rx="3"/>${notesArt(230, 50, G.questsIn(id).filter(t => !G.S().doneIds.includes(t.id)).length)}`)}${tapeLabel(260, 112, "Quests here", "var(--butter)")}</g>`;
  else if (id === "market") h += sk(`<rect x="40" y="40" width="130" height="80" rx="3" style="fill:var(--wood)"/><rect x="350" y="40" width="130" height="80" rx="3" style="fill:var(--wood)"/>`,
    `<rect x="40" y="40" width="130" height="80" rx="3"/><path d="M40 80 h130"/><rect x="350" y="40" width="130" height="80" rx="3"/><path d="M350 80 h130"/>`) +
    `<g>${[["apple","dumpling","fish","toast"],["tulip","carrot","strawberry","sunflower"]].map((row, r) => row.map((n, i) => iconAt(n, 64 + i*30, 62 + r*38, 26)).join("")).join("")}${[["yarn","ball","brush","crown"],["bath","fort","corn","blueberry"]].map((row, r) => row.map((n, i) => iconAt(n, 374 + i*30, 62 + r*38, 26)).join("")).join("")}</g>`;
  st.forEach(s => {
    // a pedestal's sign names the trophy standing on it (an empty one has no sign)
    const nm = s.kind === "pedestal" ? ((G.ped && G.ped(s.x, s.y)) || {}).label || "" : s.name;
    h += `<g data-spot="${s.id}" aria-label="${s.name || (nm ? "Trophy: " + nm : "Empty pedestal")}"><ellipse class="hov" cx="${s.x}" cy="${s.y + 6}" rx="62" ry="12" style="fill:var(--butter)"/>${furn(s.kind, s.x, s.y)}${nm ? tapeLabel(s.x, s.y + 24, nm.length > 24 ? nm.slice(0, 23) + "…" : nm, "var(--card)", s.kind === "pedestal" ? 10 : undefined) : ""}</g>`;
  });
  if (id === "kidroom") {
    // the door back to the house on the west wall
    const k = G.kid ? G.kid() : {};
    h += `<g data-exit="1" class="kidexit" aria-label="Back to the house"><ellipse class="hov" cx="34" cy="452" rx="34" ry="10" style="fill:var(--butter)"/>
      ${sk(`<path d="M0 346 L28 358 L28 456 L0 466z" style="fill:#F7D35A"/>`, `<path d="M0 346 L28 358 L28 456 L0 466z"/><circle cx="23" cy="410" r="1.8"/>`)}
      ${tapeLabel(50, 492, "To the house", "var(--card)", 11)}</g>`;
    if (k.sleep) h += `<rect width="520" height="640" fill="#2B2F55" opacity=".34" pointer-events="none"/>`;
    return h;
  }
  if (id === "trophy") {
    // the archway back into the town hall (east side), and a few pigeons pecking about (tap one and it flaps)
    h += `<g data-exit="1" aria-label="Back to the town hall"><ellipse class="hov" cx="486" cy="452" rx="34" ry="10" style="fill:var(--butter)"/>
      ${sk(`<path d="M520 346 q-16 -6 -28 8 L492 456 L520 466z" style="fill:#E6E9F5"/>`, `<path d="M520 346 q-16 -6 -28 8 L492 456 L520 466z"/>`)}${tapeLabel(462, 486, "To the town hall", "var(--card)", 11)}</g>`;
    const pigeon = (x, y, d, flip) => `<g data-pigeon="1" class="pigeon" style="--px:${x}px;--py:${y}px;animation-delay:-${d}s"><g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><g class="pbody">
      <ellipse cx="0" cy="-6" rx="9" ry="6" fill="#A7A9B4" stroke="#3A2E28" stroke-width="1.1"/><path d="M-8 -8 q-6 -1 -9 3 q5 1 9 0z" fill="#8E909C" stroke="#3A2E28" stroke-width="1"/>
      <g class="phead"><circle cx="8" cy="-12" r="4.2" fill="#8E909C" stroke="#3A2E28" stroke-width="1.1"/><path d="M8.5 -9.5 q2 1 3 -0.5" fill="#7BB37A" stroke="none"/><circle cx="9.4" cy="-13" r=".9" fill="#3A2E28"/><path d="M12 -12 l2.6 .8 -2.6 .6z" fill="#E3A27E"/></g>
      <path d="M-1 0 v3 M3 0 v3" stroke="#E3A27E" stroke-width="1.3"/></g></g></g>`;
    h += pigeon(196, 520, 0, false) + pigeon(352, 538, 1.7, true) + pigeon(300, 330, 3.1, false);
    return h;
  }
  if (id === "room") {
    // Maple's bed (she sleeps in it while Mel's in here), the door back to the house on the east wall, and night
    const sl = G.S && G.S().sleep;
    const cosy = !!(G.F().decor || {}).bed;   // the market's "Maple's cosy bed" upgrades her basket: plush rim, cushion and a heart
    h += cosy ? sk(`<ellipse cx="238" cy="296" rx="36" ry="16" style="fill:var(--rose)"/><ellipse cx="238" cy="293" rx="25" ry="10" style="fill:#FFFDF6"/><ellipse cx="226" cy="290" rx="9" ry="5" style="fill:var(--peri)"/><path d="M258 278 c-3 -4 -8 0 -5 3 l5 4 l5 -4 c3 -3 -2 -7 -5 -3z" style="fill:var(--rose)"/>`, `<ellipse cx="238" cy="296" rx="36" ry="16"/><ellipse cx="238" cy="293" rx="25" ry="10"/><ellipse cx="226" cy="290" rx="9" ry="5"/>`)
      : sk(`<ellipse cx="238" cy="296" rx="30" ry="13" style="fill:var(--peach)"/><ellipse cx="238" cy="294" rx="20" ry="8" style="fill:var(--cream)"/>`, `<ellipse cx="238" cy="296" rx="30" ry="13"/><ellipse cx="238" cy="294" rx="20" ry="8"/>`);
    h += `<g data-exit="1" aria-label="Back to the house"><ellipse class="hov" cx="486" cy="452" rx="34" ry="10" style="fill:var(--butter)"/>
      ${sk(`<path d="M520 346 L492 358 L492 456 L520 466z" style="fill:var(--blush)"/>`, `<path d="M520 346 L492 358 L492 456 L520 466z"/><circle cx="497" cy="410" r="1.8"/>`)}${tapeLabel(470, 334, "To the house", "var(--card)", 11)}</g>`;
    if (sl) h += `<rect width="520" height="640" fill="#2B2F55" opacity=".32" pointer-events="none"/>`;
    return h;
  }
  h += `<g data-exit="1" aria-label="Exit"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${r.trim}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/><path d="M222 606 h76 M222 620 h76" stroke-dasharray="3 4" opacity=".6"/>`)}
    <text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
  return h;
}
export function farmArt(){
  let h = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="90" rx="200" ry="50" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)" ${ink}><path d="M20 140 H500 M20 140 V600 M500 140 V600 M20 600 H210 M310 600 H500" style="stroke:var(--wood)" stroke-width="3"/>
      ${Array.from({length:17}, (_, i) => `<path d="M${20 + i*30} 132 v16" style="stroke:var(--wood)" stroke-width="2.4"/>`).join("")}</g>
    ${tree(60,110,1)}${tree(460,110,1)}
    ${sk(`<rect x="232" y="40" width="56" height="66" rx="4" style="fill:var(--wood)"/><path d="M226 44 l34 -26 l34 26z" style="fill:var(--sage)"/>`, `<rect x="232" y="40" width="56" height="66" rx="4"/><path d="M226 44 l34 -26 l34 26z"/><path d="M248 106 v-26 h24 v26"/>`)}
    <g filter="url(#wob)" ${ink}><path d="M120 76 v40 M104 86 h32" style="stroke:var(--wood)" stroke-width="3"/><circle cx="120" cy="70" r="9" style="fill:var(--butter)"/><path d="M110 64 l10 -8 l10 8z" style="fill:var(--peach)"/></g>`;
  PLOTS.forEach((p, i) => {
    const s = G.F().plots[i], g = s && s.crop ? G.growth(s) : null;
    const wet = s && s.crop && s.wateredAt;
    h += `<g data-plot="${i}" aria-label="Plot ${i+1}"><rect class="hov" x="${p.x-6}" y="${p.y-6}" width="${p.w+12}" height="${p.h+12}" rx="10" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" style="fill:${wet ? "#8C6A52" : "#B08A6A"}"/>
      <path d="M${p.x+10} ${p.y+22} h${p.w-20} M${p.x+10} ${p.y+44} h${p.w-20}" opacity=".35"/>`;
    if (s && s.crop) {
      const cx = p.x + p.w/2, cy = p.y + p.h/2 + 8;
      if (!wet) h += `<circle cx="${cx-14}" cy="${cy-6}" r="2.4" style="fill:var(--sock)"/><circle cx="${cx}" cy="${cy}" r="2.4" style="fill:var(--sock)"/><circle cx="${cx+14}" cy="${cy-6}" r="2.4" style="fill:var(--sock)"/>`;
      else if (g < .34) h += `<path d="M${cx} ${cy} v-10" style="stroke:var(--moss2)"/><ellipse cx="${cx-5}" cy="${cy-10}" rx="5" ry="3" style="fill:var(--moss)"/><ellipse cx="${cx+5}" cy="${cy-12}" rx="5" ry="3" style="fill:var(--moss)"/>`;
      else if (g < 1) h += `<path d="M${cx} ${cy} v-22" style="stroke:var(--moss2)"/><ellipse cx="${cx-9}" cy="${cy-14}" rx="9" ry="4.5" style="fill:var(--moss)"/><ellipse cx="${cx+9}" cy="${cy-18}" rx="9" ry="4.5" style="fill:var(--moss)"/><ellipse cx="${cx-6}" cy="${cy-26}" rx="6" ry="3.5" style="fill:var(--tree)"/>`;
      h += `</g>`;
      if (wet && g >= 1) h += `<g class="ready">${iconAt(s.crop, cx, cy - 10, 34)}</g>${iconAt("sparkle", cx + 30, cy - 28, 16)}`;
      if (!wet) h += `${iconAt("drop", p.x + p.w - 12, p.y + 12, 15)}`;
    } else h += `</g>`;
    h += `</g>`;
  });
  h += `<g data-exit="1" aria-label="Exit"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
    <g filter="url(#wob)" ${ink}><path d="M212 590 v34 M308 590 v34" style="stroke:var(--wood)" stroke-width="4"/></g>
    <text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Back outside</text></g>`;
  return h;
}

/* ---------- user-count gardens (outside Chord and Chico) ----------
   stats doc: {chord:{users, per?}, chico:{users, per?}}. One flower per `per` users (default 10).
   Bloom type steps up at 100 / 250 users; a blossom tree joins at 500 and sparkles at 1000. */
export const GARDEN_TIERS = [[0, "daisy"], [100, "tulip"], [250, "sunflower"]];
export function userGarden(key, x, y, cols, rows, gap){
  const st = (G.stats() || {})[key];
  if (!st || !(st.users >= 0)) return "";
  const per = st.per > 0 ? st.per : 10, users = Math.floor(st.users), n = Math.min(cols*rows, Math.ceil(users/per));
  const tier = GARDEN_TIERS.reduce((t, [min, k]) => users >= min ? k : t, "daisy");
  const cols4 = key === "chord" ? ["#F3C969", "#FFFDF6", "#C3CDEE"] : ["#EFA3A6", "#F4C7CF", "#FFFDF6"];
  let f = "";
  for (let i = 0; i < n; i++) {
    const cx = x + 4 + (i % cols)*gap + (Math.floor(i/cols) % 2)*gap/2, cy = y + 10 + Math.floor(i/cols)*gap, c = cols4[i % 3];
    f += `<g class="bloom"><path d="M${cx} ${cy} v${tier === "sunflower" ? -9 : -6}" style="stroke:var(--moss2)" stroke-width="1.2"/>`;
    if (tier === "daisy") f += `<circle cx="${cx}" cy="${cy-7}" r="2.6" style="fill:${c}"/><circle cx="${cx}" cy="${cy-7}" r="1" fill="#F3C969"/>`;
    else if (tier === "tulip") f += `<path d="M${cx-3} ${cy-9} q3 -6 6 0 q-1 4 -3 4 q-2 0 -3 -4z" style="fill:${c}" stroke="var(--line)" stroke-width=".6"/>`;
    else f += `<circle cx="${cx}" cy="${cy-11}" r="4.2" fill="#F3C969" stroke="var(--line)" stroke-width=".6"/><circle cx="${cx}" cy="${cy-11}" r="1.8" fill="#8A5A3A"/>`;
    f += `</g>`;
  }
  const w = cols*gap, signX = x + w/2 + (key === "chord" ? 8 : 0), signY = y + rows*gap + 10;
  const tree = users >= 500 ? `<g filter="url(#wob)" ${ink}><rect x="${x+w-6}" y="${y+4}" width="4" height="12" style="fill:var(--wood)"/><circle cx="${x+w-4}" cy="${y}" r="9" style="fill:#F4C7CF"/><circle cx="${x+w-10}" cy="${y+4}" r="6" style="fill:#EFA3A6"/></g>` : "";
  const sparkle = users >= 1000 ? `<g class="twinkle">${iconAt("sparkle", x - 2, y - 2, 12)}${iconAt("sparkle", x + w + 2, y + rows*gap - 4, 11)}</g>` : "";
  const label = `${users.toLocaleString()} ${st.label || (key === "chord" ? "studios" : "families")}`;
  return `<g data-ugarden="${key}" aria-label="${label}">${f}${tree}${sparkle}
    ${tapeLabel(signX, signY, label, key === "chord" ? "var(--sage)" : "var(--blush)", 10)}</g>`;
}
