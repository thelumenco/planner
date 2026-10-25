// Honeybrook Green: the village green, south of Mel's home. A hedge arch at the top leads home, wooden gates
// east to the lower vineyard and west to the Stables, and round the green a duck pond, a Victorian bandstand,
// the cricket lawn and the allotments. Paths cross in the middle, which stays open for walking.
import { southShore } from "./southshore.js";
import { sk, tapeLabel, tree, flowers } from "./scenes.js";

// a little old lamp post (decoration only)
const lamp = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x-2}" y="${y-44}" width="4" height="44" style="fill:#5E6B72"/><path d="M${x-7} ${y-46} h14 l-3 -10 h-8z" style="fill:#FFF1C2"/><path d="M${x-8} ${y-56} h16 l-8 -6z" style="fill:#5E6B72"/><rect x="${x-5}" y="${y-2}" width="10" height="4" style="fill:#5E6B72"/>`,
  `<rect x="${x-2}" y="${y-44}" width="4" height="44"/><path d="M${x-7} ${y-46} h14 l-3 -10 h-8z M${x-8} ${y-56} h16 l-8 -6z"/>`)}</g>`;
// a plain wooden bench (decoration only)
const bench = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x-22}" y="${y-14}" width="44" height="6" rx="2" style="fill:#B98A5A"/><rect x="${x-22}" y="${y-4}" width="44" height="7" rx="2" style="fill:#A8754F"/>`,
  `<rect x="${x-22}" y="${y-14}" width="44" height="6" rx="2"/><rect x="${x-22}" y="${y-4}" width="44" height="7" rx="2"/><path d="M${x-18} ${y+3} v8 M${x+18} ${y+3} v8"/>`)}</g>`;
// a five-bar field gate on a side edge; side -1 = west, 1 = east
function sideGate(id, label, x, tag, col, side){
  const g0 = side < 0 ? x : x - 34, p = side < 0 ? x + 34 : x - 40;
  return `<g data-place="${id}" aria-label="${label}"><ellipse class="hov" cx="${side < 0 ? 22 : 498}" cy="330" rx="28" ry="20" style="fill:var(--butter)"/>
    ${sk(`<rect x="${g0}" y="306" width="6" height="40" style="fill:var(--wood)"/><rect x="${g0 + 34}" y="306" width="6" height="40" style="fill:var(--wood)"/><rect x="${g0 + 4}" y="312" width="32" height="24" style="fill:#C9A27E" opacity=".55"/>`,
      `<rect x="${g0}" y="306" width="6" height="40"/><rect x="${g0 + 34}" y="306" width="6" height="40"/><path d="M${g0+6} 314 h28 M${g0+6} 322 h28 M${g0+6} 330 h28 M${g0+6} 338 h28 M${g0+6} 338 L${g0+34} 314"/>`)}
    ${tapeLabel(p + (side < 0 ? 10 : -10), 290, tag, col, 10)}</g>`;
}

export function greenArt(){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="340" rx="190" ry="120" style="fill:var(--grass2)"/><ellipse cx="420" cy="600" rx="110" ry="50" style="fill:var(--grass2)"/><ellipse cx="80" cy="90" rx="90" ry="40" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"><path d="M260 24 C258 120 264 240 260 330 M22 330 C140 324 380 336 498 330 M260 330 C230 420 180 470 150 540 M260 330 C290 420 320 480 340 560 M300 330 C340 310 372 290 380 262 M210 328 C170 310 130 290 120 262"/></g>
    <g filter="url(#wob)"><ellipse cx="260" cy="330" rx="44" ry="22" style="fill:var(--path)"/><ellipse cx="260" cy="330" rx="44" ry="22" fill="none" style="stroke:var(--path2)" stroke-width="1.5" stroke-dasharray="3 7"/></g>
    ${flowers([[40, 260, "#EFA3A6"], [480, 250, "#F3C969"], [470, 400, "#C3CDEE"], [30, 410, "#F3C969"], [240, 470, "#EFA3A6"], [460, 560, "#C3CDEE"], [250, 600, "#F3C969"], [60, 600, "#EFA3A6"], [300, 120, "#C3CDEE"], [210, 90, "#EFA3A6"]])}
    ${tree(30, 90, .9)}${tree(486, 96, .95)}${tree(44, 548, .8)}${tree(484, 556, .8)}${tree(470, 470, .75)}`;

  // the hedge arch at the top: two short hedges and a rose-covered arch over the path home
  const home = `<g data-place="toBaseG" aria-label="Path up home"><ellipse class="hov" cx="260" cy="26" rx="28" ry="16" style="fill:var(--butter)"/>
    ${sk(`<rect x="196" y="6" width="44" height="26" rx="12" style="fill:var(--tree2)"/><rect x="280" y="6" width="44" height="26" rx="12" style="fill:var(--tree2)"/><path d="M240 34 V14 Q260 -6 280 14 V34 h-5 V15 Q260 0 245 15 V34z" style="fill:var(--tree)"/><circle cx="247" cy="10" r="2.5" style="fill:#EFA3A6"/><circle cx="268" cy="5" r="2.5" style="fill:#EFA3A6"/><circle cx="278" cy="18" r="2.5" style="fill:#F3C969"/>`,
      `<rect x="196" y="6" width="44" height="26" rx="12"/><rect x="280" y="6" width="44" height="26" rx="12"/><path d="M240 34 V14 Q260 -6 280 14 V34 M245 34 V15 Q260 0 275 15 V34"/>`)}
    ${tapeLabel(330, 46, "Home", "var(--sage)", 10)}</g>`;

  // the allotments: six raised beds, canes, a potting shed and a water butt
  const veg = ["#7FB069", "#A7C957", "#E8A0A0", "#6A994E", "#F2C14E", "#8CB369"];
  const beds = [0, 1, 2, 3, 4, 5].map(i => { const x = 40 + (i % 3)*44, y = 134 + Math.floor(i/3)*38;
    return { art: `<rect x="${x}" y="${y}" width="38" height="26" rx="2" style="fill:#A8754F"/><rect x="${x+3}" y="${y+3}" width="32" height="20" style="fill:#7A5A40"/>${[0, 1, 2].map(k => `<circle cx="${x+9+k*10}" cy="${y+13}" r="4" style="fill:${veg[i]}"/>`).join("")}`,
      lines: `<rect x="${x}" y="${y}" width="38" height="26" rx="2"/>` }; });
  const allot = `<g data-place="gallot" aria-label="The allotments"><ellipse class="hov" cx="120" cy="250" rx="44" ry="12" style="fill:var(--butter)"/>
    ${sk(beds.map(b => b.art).join("") + `<rect x="180" y="146" width="40" height="40" style="fill:#B7C9A8"/><path d="M174 148 L200 126 L226 148z" style="fill:#C98A6A"/><rect x="194" y="160" width="14" height="26" style="fill:var(--wood)"/><rect x="183" y="152" width="9" height="8" style="fill:var(--sky)"/>
      <rect x="226" y="166" width="16" height="22" rx="4" style="fill:#5E7C8A"/>`,
      beds.map(b => b.lines).join("") + `<rect x="180" y="146" width="40" height="40"/><path d="M174 148 L200 126 L226 148z"/><rect x="194" y="160" width="14" height="26"/><rect x="183" y="152" width="9" height="8"/><rect x="226" y="166" width="16" height="22" rx="4"/><path d="M226 172 h16"/>
      <path d="M144 134 l4 -22 M152 134 l-4 -22 M146 120 h6 M60 172 l3 -18 M66 172 l-3 -18" style="stroke:#A8754F"/>`)}
    ${tapeLabel(120, 228, "Allotments", "var(--moss)", 10)}</g>`;

  // the bandstand: octagonal platform, white railings, slender posts and a pointed roof with a finial
  const xs = [-52, -36, -14, 14, 36, 52];
  const band = `<g data-place="gband" aria-label="The bandstand"><ellipse class="hov" cx="380" cy="258" rx="60" ry="12" style="fill:var(--butter)"/>
    ${sk(`<path d="M324 232 L340 222 H420 L436 232 V246 L420 254 H340 L324 246z" style="fill:#E9E1D2"/><path d="M324 232 L340 240 H420 L436 232" style="fill:#D9CFBD"/>
      ${xs.map(d => `<rect x="${378 + d}" y="172" width="4" height="${d*d > 900 ? 60 : 66}" style="fill:#FFFDF6"/>`).join("")}
      <rect x="326" y="212" width="108" height="16" style="fill:#FFFDF6" opacity=".55"/>
      <path d="M318 176 L380 120 L442 176 Q380 186 318 176z" style="fill:var(--peri)"/><path d="M318 176 Q380 186 442 176 l-4 6 Q380 192 322 182z" style="fill:var(--rose)"/>
      <circle cx="380" cy="116" r="4" style="fill:var(--butter)"/>`,
      `<path d="M324 232 L340 222 H420 L436 232 V246 L420 254 H340 L324 246z M324 232 L340 240 H420 L436 232 M340 240 V254 M420 240 V254"/>
      ${xs.map(d => `<path d="M${378 + d} 176 v${d*d > 900 ? 56 : 62}"/>`).join("")}
      <path d="M326 212 H434 M326 228 H434 ${[336, 346, 356, 366, 394, 404, 414, 424].map(x => `M${x} 212 v16`).join(" ")}" opacity=".7"/>
      <path d="M318 176 L380 120 L442 176 Q380 186 318 176z M380 120 L360 180 M380 120 L400 180 M380 112 v-6"/>
      <path d="M330 196 q8 6 16 0 q8 6 16 0 M398 196 q8 6 16 0 q8 6 16 0" opacity=".5"/>`)}
    <g pointer-events="none">${[338, 354, 370, 390, 406, 422].map((x, k) => `<path d="M${x} 186 l4 7 l4 -7z" style="fill:${["#EFA3A6", "#F3C969", "#C3CDEE"][k % 3]}"/>`).join("")}</g>
    ${tapeLabel(380, 280, "Bandstand", "var(--peri)", 10)}</g>`;

  // the duck pond: reeds, a little duck house on a post, three ducks
  const duck = (x, y, f) => `<g transform="translate(${x} ${y}) scale(${f} 1)">${sk(`<ellipse cx="0" cy="0" rx="9" ry="5" style="fill:#FFFDF6"/><circle cx="7" cy="-6" r="4" style="fill:#FFFDF6"/><path d="M10 -6 l5 1 l-5 2z" style="fill:#F3A64A"/>`, `<path d="M-9 0 q0 5 9 5 q9 0 9 -5 q-2 -3 -5 -3 M3 -6 a4 4 0 1 1 8 0 a4 4 0 0 1 -4 3"/>`)}</g>`;
  const pond = `<g data-place="gpond" aria-label="The duck pond"><ellipse class="hov" cx="150" cy="536" rx="44" ry="11" style="fill:var(--butter)"/>
    ${sk(`<ellipse cx="150" cy="470" rx="92" ry="50" style="fill:#C9B99A"/><ellipse cx="150" cy="470" rx="86" ry="45" style="fill:var(--water)"/>
      <rect x="192" y="430" width="4" height="34" style="fill:var(--wood)"/><rect x="180" y="416" width="28" height="18" style="fill:#F2D9A8"/><path d="M176 418 L194 402 L212 418z" style="fill:#C98A6A"/><path d="M188 434 v-9 a6 6 0 0 1 12 0 v9z" style="fill:#6B4E3A"/>`,
      `<ellipse cx="150" cy="470" rx="92" ry="50"/><ellipse cx="150" cy="470" rx="86" ry="45" opacity=".5"/><rect x="180" y="416" width="28" height="18"/><path d="M176 418 L194 402 L212 418z M194 434 v30 M182 440 h24"/>
      <path d="M70 450 l-2 -24 M76 452 l3 -22 M82 446 l-1 -18 M224 488 l2 -22 M230 486 l-2 -20 M90 512 l-3 -18 M96 514 l2 -16" style="stroke:var(--moss2)"/>`)}
    <g pointer-events="none"><ellipse cx="68" cy="426" rx="2" ry="5" style="fill:#8A6A4E"/><ellipse cx="226" cy="466" rx="2" ry="5" style="fill:#8A6A4E"/>${duck(118, 462, 1)}${duck(146, 490, -1)}${duck(102, 498, 1)}
      <path class="ripple" d="M120 474 q6 -3 12 0 M160 456 q6 -3 12 0 M188 500 q6 -3 12 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/></g>
    ${tapeLabel(150, 560, "Duck pond", "var(--sky)", 10)}</g>`;

  // the cricket lawn: mowing stripes, stumps and bails, a gingham picnic blanket
  const lawn = `<g data-place="glawn" aria-label="The cricket lawn"><ellipse class="hov" cx="340" cy="558" rx="44" ry="11" style="fill:var(--butter)"/>
    ${sk(`<rect x="270" y="404" width="170" height="130" rx="14" style="fill:#9FCB86"/>${[0, 2, 4].map(k => `<rect x="${270 + k*34}" y="404" width="34" height="130" style="fill:#B3D79C"/>`).join("")}
      <rect x="400" y="440" width="3" height="20" style="fill:#E9D7B0"/><rect x="406" y="440" width="3" height="20" style="fill:#E9D7B0"/><rect x="412" y="440" width="3" height="20" style="fill:#E9D7B0"/><circle cx="380" cy="470" r="3" style="fill:#C4473A"/>
      <path d="M288 478 L338 470 L348 508 L296 516z" style="fill:#FFFDF6"/><path d="M300 476 l10 38 M312 474 l10 38 M324 472 l10 38 M290 490 l52 -8 M293 502 l52 -8" style="stroke:#EFA3A6" stroke-width="4" opacity=".7"/>`,
      `<rect x="270" y="404" width="170" height="130" rx="14"/><path d="M398 440 h19 M398 440 v20 M404 440 v20 M410 440 v20 M416 440 v20 M400 439 h6 M408 439 h6"/><path d="M288 478 L338 470 L348 508 L296 516z"/><circle cx="380" cy="470" r="3"/>`)}
    ${tapeLabel(340, 582, "Cricket lawn", "var(--peach)", 10)}</g>`;

  return ground + southShore() + home + allot + band + pond + lawn
    + sideGate("toVineG", "Gate to the lower vineyard", 512, "Lower vines", "#E8B4C0", 1)
    + sideGate("toStablesG", "Gate to the Stables", 6, "The Stables", "var(--butter)", -1)
    + lamp(222, 304) + lamp(300, 304) + bench(470, 210) + bench(470, 380) + bench(52, 390);
}
