// The vineyard screen (east of home base, over the footbridge): vine rows on trellises, the barrel shed, the stall,
// the wine shop and a little playground. Reads live vine state through the art context (G.vine()).
import { ink, esc } from "../util.js";
import { sk, tapeLabel, tree, flowers, artCtx } from "./scenes.js";
import { streetLamp, lampDefs, bunting, festivalOn } from "./village-extras.js";
import { growth, barrelLeft, shelfStock, STYLES, vineyardName, shopName } from "../game/vineyard.js";
import { oliveTree } from "./wine.js";
import { potsIn } from "./orchard.js";

// a name on a tape label: "The" dropped, kept short enough to sit on the map
const tag = n => { const t = n.replace(/^the\s+/i, ""), c = t[0].toUpperCase() + t.slice(1); return esc(c.length > 16 ? c.slice(0, 15) + "…" : c); };
export const VINE_ROWS = [370, 420, 470], VINE_XS = [262, 340, 418];
export const vineSpot = (r, i) => ({x: VINE_XS[i], y: VINE_ROWS[r] + 16});

const grapes = (x, y, col, s) => { let g = ""; const pts = [[0, 0], [-3, -3], [3, -3], [-5, -7], [0, -6], [5, -7], [-2, -10], [3, -10]];
  pts.forEach(([dx, dy]) => { g += `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2.4*s}" style="fill:${col}"/>`; }); return g; };

function vineArt(vn, x, y){
  if (!vn) return sk(`<ellipse cx="${x}" cy="${y}" rx="12" ry="4" style="fill:#B08A6A"/>`, `<ellipse cx="${x}" cy="${y}" rx="12" ry="4"/><path d="M${x-4} ${y-1} q4 -3 8 0" opacity=".5"/>`);
  const g = growth(vn), ripe = g >= 1, col = vn.v === "red" ? "#6B2A55" : "#B9CF6A", unripe = "#A9C98A";
  const leaf = (lx, ly, r) => `<path d="M${lx} ${ly} q${-r} ${-r*.4} ${-r*.5} ${-r} q${r*.5} ${r*.1} ${r*.5} ${r} q${r*.1} ${-r*.7} ${r*.6} ${-r*.9} q${-r*.1} ${r*.6} ${-r*.6} ${r*.9}z" style="fill:var(--moss)"/>`;
  const n = vn.wateredAt ? 3 + Math.round(g*3) : 2;
  let leaves = ""; for (let k = 0; k < n; k++) { const lx = x - 16 + (k*32/(n - 1 || 1)), ly = y - 30 - (k % 2)*8; leaves += leaf(lx, ly, 7 + g*3); }
  const bunch = !vn.wateredAt ? "" : ripe ? grapes(x - 8, y - 22, col, 1.1) + grapes(x + 9, y - 20, col, 1) : g > .35 ? grapes(x, y - 21, unripe, .5 + g*.5) : "";
  return `<ellipse cx="${x}" cy="${y}" rx="12" ry="4" style="fill:${vn.wateredAt ? "#8A6A4E" : "#C9A27E"}" filter="url(#wob)"/>`
    + sk(`${leaves}`, `<path d="M${x} ${y} q-2 -12 2 -22 q3 -6 -1 -12 M${x+1} ${y-22} q8 -4 14 -10 M${x} ${y-24} q-8 -2 -14 -8"/>`)
    + (bunch ? `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width=".8">${bunch}</g>` : "")
    + (ripe ? `<g class="twinkle" pointer-events="none"><path d="M${x+18} ${y-38} l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#FFE38A"/></g>` : "")
    + (!vn.wateredAt ? `<path d="M${x+14} ${y-30} q3 -6 0 -9 q-3 3 0 9" fill="#9CC3E0" opacity=".9" style="stroke:var(--line)" stroke-width=".8"/>` : "");
}
function rowArt(row, r){
  const y = VINE_ROWS[r];
  const trellis = row.trellis
    ? sk("", `<path d="M222 ${y-4} v-40 M301 ${y-4} v-40 M379 ${y-4} v-40 M458 ${y-4} v-40" stroke-width="2.2" style="stroke:var(--wood)"/><path d="M222 ${y-40} H458 M222 ${y-26} H458" stroke-width="1" opacity=".7"/>`)
    : sk("", `<path d="M222 ${y-4} v-10 M458 ${y-4} v-10" stroke-width="2"/><path d="M222 ${y-8} H458" stroke-dasharray="4 6" opacity=".55"/>`);
  return trellis + row.vines.map((vn, i) => { const x = VINE_XS[i];
    return `<g data-vine="${r}-${i}" aria-label="Vine ${r + 1}.${i + 1}"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="32" ry="9" style="fill:var(--butter)"/>${row.trellis ? vineArt(vn, x, y) : `<rect x="${x-30}" y="${y-44}" width="60" height="50" fill="transparent"/>`}</g>`; }).join("");
}
// the barrel shed: an open-fronted timber shed, one barrel per barrel owned (chalk ticks while it ferments)
function shedArt(v){
  const bx = [78, 112, 146], bar = (x, b) => { const ready = b && !barrelLeft(b) && !(b.style === "sparkling" && b.stage === 1);
    return sk(`<ellipse cx="${x}" cy="${206}" rx="14" ry="18" style="fill:#A8754F"/>`, `<ellipse cx="${x}" cy="206" rx="14" ry="18"/><path d="M${x-13} 198 h26 M${x-13} 214 h26" style="stroke:#5C4A3E" stroke-width="2"/>`)
      + (b ? `<circle cx="${x}" cy="206" r="4.5" fill="${STYLES[b.style].col}" stroke="#3a2e28" stroke-width=".8"/>` : "")
      + (ready ? `<g class="twinkle" pointer-events="none"><path d="M${x+10} 186 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#FFE38A"/></g>` : ""); };
  return `<g data-place="barrels" aria-label="Barrel shed"><ellipse class="hov" cx="112" cy="234" rx="70" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M44 160 L112 126 L180 160z" style="fill:#B4553F"/><rect x="52" y="160" width="120" height="68" style="fill:#7B5A42"/><rect x="60" y="168" width="104" height="60" style="fill:#5C4535"/>`,
      `<path d="M44 160 L112 126 L180 160z"/><path d="M60 152 l10 -5 M84 140 l10 -5 M130 140 l10 5 M154 152 l10 5" opacity=".5"/><rect x="52" y="160" width="120" height="68"/><path d="M52 228 h120"/>`)}
    ${v.barrels.map((b, i) => bar(bx[i], b)).join("")}
    ${tapeLabel(112, 252, "Barrel shed", "var(--peach)", 11)}</g>`;
}
function shopArt(v){
  const n = Math.min(8, shelfStock(v)), bottles = Array.from({length: n}, (_, i) => `<rect x="${338 + i*5.5}" y="${170 - (i % 2)*2}" width="4" height="12" rx="1.5" style="fill:${i % 3 === 1 ? "#9DBF8A" : "#5B2338"}"/>`).join("");
  return `<g data-place="wineshop" aria-label="${esc(shopName(artCtx().F()))}"><ellipse class="hov" cx="390" cy="218" rx="86" ry="11" style="fill:var(--butter)"/>
    ${sk(`<rect x="318" y="118" width="144" height="96" style="fill:#F1E2C6"/><path d="M306 120 L340 78 H440 L474 120z" style="fill:#C46A4A"/>
      <path d="M326 150 h50 l-4 12 h-42z M404 150 h50 l-4 12 h-42z" style="fill:#8E2C48"/><rect x="332" y="162" width="46" height="26" style="fill:#DCE8F0"/>${bottles}<rect x="410" y="162" width="38" height="26" style="fill:#DCE8F0"/>
      <path d="M376 214 v-40 a14 14 0 0 1 28 0 v40z" style="fill:#7B4A36"/><rect x="368" y="92" width="44" height="18" rx="3" style="fill:#FFFDF6"/>
      <circle cx="430" cy="206" r="9" style="fill:#A8754F"/><rect x="420" y="190" width="20" height="5" rx="2" style="fill:#A8754F"/>`,
      `<rect x="318" y="118" width="144" height="96"/><path d="M306 120 L340 78 H440 L474 120z"/><path d="M318 104 h144 M326 92 h128" opacity=".45"/>
      <path d="M326 150 h50 l-4 12 h-42z M404 150 h50 l-4 12 h-42z"/><path d="M336 150 l-2 12 M348 150 l-1 12 M360 150 v12 M414 150 l-2 12 M426 150 l-1 12 M438 150 v12" style="stroke:#F6E3C6" stroke-width="3"/>
      <rect x="332" y="162" width="46" height="26"/><rect x="410" y="162" width="38" height="26"/><path d="M429 162 v26" opacity=".6"/>
      <path d="M376 214 v-40 a14 14 0 0 1 28 0 v40z"/><circle cx="398" cy="196" r="1.4"/><rect x="368" y="92" width="44" height="18" rx="3"/><circle cx="430" cy="206" r="9"/><path d="M430 195 v2"/>`)}
    <g filter="url(#wob)" style="stroke:var(--line)" stroke-width=".8">${grapes(390, 97, "#6B2A55", .7)}</g><path d="M390 92 q4 -4 8 -2" fill="none" style="stroke:var(--moss2)" stroke-width="1.4"/>
    ${tapeLabel(390, 240, tag(shopName(artCtx().F())), "#E8B4C0", 11.5)}</g>`;
}
function stallArt(){
  return `<g data-place="vinestall" aria-label="Vineyard stall"><ellipse class="hov" cx="90" cy="446" rx="44" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="58" y="412" width="64" height="26" rx="2" style="fill:var(--wood)"/><path d="M52 384 h76 l-6 12 h-64z" style="fill:#F6E3C6"/>
      <rect x="66" y="404" width="10" height="8" style="fill:#C9A27E"/><rect x="80" y="400" width="12" height="12" style="fill:#7FA36E"/><rect x="96" y="404" width="14" height="8" style="fill:#A8754F"/>`,
      `<rect x="58" y="412" width="64" height="26" rx="2"/><path d="M52 384 h76 l-6 12 h-64z"/><path d="M62 384 l-2 12 M78 384 l-1 12 M94 384 v12 M110 384 l1 12" style="stroke:#8E2C48" stroke-width="5"/><path d="M60 396 v16 M120 396 v16"/>`)}
    ${tapeLabel(90, 472, "Stall", "var(--sage)", 11)}</g>`;
}
function playArt(){
  // each seat swings from its own hook on the top bar (pivot set per seat; .map .pswing in npcs.css)
  const seat = (x, col, d) => `<g class="pswing" style="transform-origin:${x + 6}px 527px;animation-delay:${d}s">${sk(`<rect x="${x - 2}" y="574" width="16" height="4" rx="2" style="fill:${col}"/>`, `<path d="M${x} 527 v47 M${x + 12} 527 v47"/><rect x="${x - 2}" y="574" width="16" height="4" rx="2"/>`)}</g>`;
  const swing = `<g data-place="pswing" aria-label="Swings"><ellipse class="hov" cx="110" cy="592" rx="40" ry="9" style="fill:var(--butter)"/>
    ${sk("", `<path d="M76 590 l10 -64 l10 64 M124 590 l10 -64 l10 64 M86 526 h48" stroke-width="2.2" style="stroke:#C46A4A"/>`)}
    ${seat(92, "var(--rose)", 0)}${seat(116, "var(--sky)", -1.4)}
    ${tapeLabel(110, 618, "Swings", "var(--peach)", 10)}</g>`;
  const slide = `<g data-place="pslide" aria-label="Slide"><ellipse class="hov" cx="262" cy="590" rx="46" ry="9" style="fill:var(--butter)"/>
    ${sk(`<path d="M252 586 L262 532 L286 532 Q300 560 322 586 h-12 Q292 566 280 544 h-14 l-8 42z" style="fill:#F3C969"/><rect x="258" y="526" width="30" height="8" rx="2" style="fill:#7FB8E8"/>`,
      `<path d="M252 586 L262 532 M266 586 l8 -42 M256 568 h12 M259 552 h12"/><rect x="258" y="526" width="30" height="8" rx="2"/><path d="M286 532 Q300 560 322 586 h-12 Q292 566 280 544"/>`)}
    ${tapeLabel(262, 616, "Slide", "var(--butter)", 10)}</g>`;
  const seesaw = `<g data-place="pseesaw" aria-label="Seesaw"><ellipse class="hov" cx="410" cy="598" rx="50" ry="9" style="fill:var(--butter)"/>
    <g class="seesaw">${sk(`<rect x="364" y="572" width="92" height="7" rx="3" style="fill:#7FA36E" transform="rotate(-8 410 576)"/><circle cx="368" cy="578" r="5" style="fill:var(--rose)"/><circle cx="452" cy="566" r="5" style="fill:var(--rose)"/>`,
      `<rect x="364" y="572" width="92" height="7" rx="3" transform="rotate(-8 410 576)"/>`)}</g>
    ${sk(`<path d="M402 592 l8 -16 l8 16z" style="fill:#C46A4A"/>`, `<path d="M402 592 l8 -16 l8 16z"/>`)}
    ${tapeLabel(410, 620, "Seesaw", "var(--sky)", 10)}</g>`;
  // the roundabout (a little nod to Swings & Roundabouts), between the swings and the slide: it turns slowly
  const round = `<g data-place="pround" aria-label="Roundabout"><g transform="translate(-282 82)"><ellipse class="hov" cx="470" cy="508" rx="34" ry="9" style="fill:var(--butter)"/>
    ${sk(`<ellipse cx="470" cy="502" rx="28" ry="9" style="fill:#E8566C"/><ellipse cx="470" cy="498" rx="28" ry="9" style="fill:#F3C969"/>`, `<ellipse cx="470" cy="502" rx="28" ry="9"/><ellipse cx="470" cy="498" rx="28" ry="9"/><path d="M470 498 v-16 M458 488 h24"/>`)}
    <g transform="translate(470 498)"><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.6" fill="none"><path d="M0 0 l20 -3 M0 0 l-20 -3 M0 0 l8 6 M0 0 l-8 6"><animateTransform attributeName="transform" type="scale" values="1 1; -1 1; 1 1" dur="6s" repeatCount="indefinite"/></path></g></g>
    ${tapeLabel(472, 462, "Roundabout", "var(--peri)", 10)}</g></g>`;
  return `<g filter="url(#wob)"><ellipse cx="262" cy="584" rx="236" ry="48" style="fill:#EAD9B0"/></g>` + swing + slide + seesaw + round;
}
export function vineyardArt(){
  const G = artCtx(), v = G.vine();
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="60" rx="260" ry="60" style="fill:var(--grass2)"/><ellipse cx="340" cy="420" rx="160" ry="80" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)" fill="none" opacity=".45" style="stroke:var(--moss2)" stroke-width="3" stroke-dasharray="2 7">${[24, 44, 64].map(y => `<path d="M190 ${y} Q300 ${y - 8} 510 ${y + 4}"/>`).join("")}</g>
    <g filter="url(#wob)"><path d="M14 0 C6 110 26 210 16 300 C8 390 28 500 14 640" fill="none" style="stroke:var(--water)" stroke-width="16"/><path d="M8 0 C0 110 20 210 10 300 C2 390 22 500 8 640 M22 0 C14 110 34 210 24 300 C16 390 36 500 22 640" fill="none" style="stroke:var(--line)" stroke-width="1" opacity=".5"/></g>
    <path class="ripple" d="M10 150 q4 -3 8 0 M14 460 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/>
    <g filter="url(#wob)"><path d="M24 300 H486 M112 300 V238 M390 300 V222 M186 300 C186 400 190 480 210 548 M290 0 C296 100 284 200 296 300" fill="none" style="stroke:var(--path)" stroke-width="22" stroke-linecap="round"/></g>
    ${flowers([[30,140,"#EFA3A6"],[200,140,"#F3C969"],[480,250,"#C3CDEE"],[490,330,"#EFA3A6"],[150,350,"#F3C969"],[40,520,"#C3CDEE"],[480,520,"#F3C969"],[300,250,"#EFA3A6"]])}
    ${tree(250,130,.9)}${tree(495,150,.9)}${tree(26,620,.8)}${tree(500,620,.85)}${tree(40,380,.8)}`;
  const gate = `<g data-place="toBaseV" aria-label="Gate home"><ellipse class="hov" cx="24" cy="300" rx="26" ry="30" style="fill:var(--butter)"/>
    ${sk(`<rect x="0" y="290" width="40" height="22" rx="2" style="fill:var(--wood)"/><rect x="42" y="262" width="6" height="52" style="fill:var(--wood)"/><path d="M38 266 q12 -14 20 0" style="fill:var(--moss)"/>`,
      `<rect x="0" y="290" width="40" height="22" rx="2"/><path d="M8 290 v22 M16 290 v22 M24 290 v22 M32 290 v22" opacity=".6"/><rect x="42" y="262" width="6" height="52"/>`)}
    ${tapeLabel(66, 344, "Home", "var(--butter)", 11)}</g>`;
  // the path north to Makers' Lane, under a little vine arch at the top edge
  const lgate = `<g data-place="toLaneV" aria-label="Path to Makers' Lane"><ellipse class="hov" cx="290" cy="22" rx="30" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="268" y="0" width="6" height="40" style="fill:var(--wood)"/><rect x="306" y="0" width="6" height="40" style="fill:var(--wood)"/><path d="M264 6 q26 -14 52 0 v6 q-26 -12 -52 0z" style="fill:#9CC27E"/>`,
      `<rect x="268" y="0" width="6" height="40"/><rect x="306" y="0" width="6" height="40"/><path d="M264 6 q26 -14 52 0 v6 q-26 -12 -52 0z"/>`)}
    ${tapeLabel(290, 58, "Makers' Lane", "var(--peri)", 11)}</g>`;
  const sign = sk(`<rect x="124" y="340" width="52" height="16" rx="2" style="fill:#FFFDF6"/>`, `<rect x="124" y="340" width="52" height="16" rx="2"/><path d="M150 356 v14"/>`)
    + `<text x="150" y="351.5" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="9.5" style="fill:var(--line)" pointer-events="none">the vines</text>`;
  // the olive tree by the path (an empty, marked spot until one's bought at the stall)
  const ol = v.olive, ripe = ol && Date.now() - (ol.pickedAt || ol.planted) >= 8*3600e3;
  const olive = `<g data-place="olive" aria-label="Olive tree"><ellipse class="hov" cx="250" cy="258" rx="34" ry="9" style="fill:var(--butter)"/>${ol ? `<g filter="url(#wob)">${oliveTree(250, 254, 1, ripe ? "ripe" : "growing")}</g>` + (ripe ? `<g class="twinkle" pointer-events="none"><path d="M276 196 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5z" fill="#FFE38A" stroke="#3b3530" stroke-width="1"/></g>` : "")
    : sk(`<ellipse cx="250" cy="252" rx="16" ry="5" style="fill:#9C7A5C"/>`, `<ellipse cx="250" cy="252" rx="16" ry="5"/><path d="M262 252 v-18 M256 236 h14 v8 h-14z"/>`)}${tapeLabel(250, 276, "Olive tree", "var(--sage)", 10)}</g>`;
  return lampDefs + ground + gate + lgate + [[176, 286], [470, 286]].map(([x, y]) => streetLamp(x, y)).join("") + olive
    + shedArt(v) + shopArt(v) + potsIn("vineyard") + stallArt() + sign + v.rows.map((row, r) => rowArt(row, r)).join("") + playArt()
    // the shop terrace (bought at the stall): a vine-covered pergola and two little tables beside the shop
    + (v.terrace ? sk(`<path d="M466 132 h48 l-4 -10 h-40z" style="fill:#9CC27E"/><ellipse cx="478" cy="196" rx="11" ry="4" style="fill:#FFFDF6"/><ellipse cx="502" cy="206" rx="11" ry="4" style="fill:#FFFDF6"/><circle cx="474" cy="128" r="2.4" style="fill:#6B2A55"/><circle cx="500" cy="128" r="2.4" style="fill:#6B2A55"/>`,
        `<path d="M466 132 h48 l-4 -10 h-40z M470 132 v80 M510 132 v80"/><ellipse cx="478" cy="196" rx="11" ry="4"/><path d="M478 200 v12 M502 210 v10"/><ellipse cx="502" cy="206" rx="11" ry="4"/>`) : "")
    // harvest week: bunting strung over the vines
    + ((festivalOn(G.day()) || {}).id === "harvest" ? bunting(214, 318, 466, 318, ["#8E2C48", "#F3C969", "#9CC27E"]) + bunting(214, 498, 466, 498, ["#F3C969", "#8E2C48", "#F6E3C6"]) : "");
}
// the home-base end: a footbridge over the stream and a vine-wrapped gate (tap to go to the vineyard)
export function vineGate(){
  return `<g filter="url(#wob)"><path d="M290 332 C320 450 420 476 486 470" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"/></g>
    <g data-place="toVine" aria-label="Gate to the vineyard"><ellipse class="hov" cx="484" cy="470" rx="34" ry="22" style="fill:var(--butter)"/>
    ${sk(`<rect x="450" y="460" width="40" height="20" rx="2" style="fill:var(--wood)"/><rect x="494" y="432" width="6" height="50" style="fill:var(--wood)"/><path d="M490 436 q10 -12 22 -2" style="fill:var(--moss)"/><circle cx="504" cy="444" r="3" style="fill:#6B2A55"/><circle cx="499" cy="447" r="3" style="fill:#6B2A55"/>`,
      `<rect x="450" y="460" width="40" height="20" rx="2"/><path d="M458 460 v20 M466 460 v20 M474 460 v20 M482 460 v20" opacity=".6"/><rect x="494" y="432" width="6" height="50"/>`)}
    ${tapeLabel(470, 504, tag(vineyardName(artCtx().F())), "#E8B4C0", 11)}</g>`;
}
