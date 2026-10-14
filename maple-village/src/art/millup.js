// Upstairs in the old mill (round 154: a more detailed second floor: the shop and the workbench, shelves round
// the walls lined with your products, a corner for workshops, and olive oil tastings: bottles down the middle of a
// long table, little coloured glasses, bread to dip). Up the wooden stairs from the
// press. Whitewashed walls and the old beams; shelves all round the walls filled from the mill's actual stock (oils on
// the back wall, soaps down the left, lotions down the right); Hazel's counter at the top of the stairs; the workbench
// and curing rack under the little round window; the tasting table in the middle (cobalt glasses at every place, a
// bread board, dipping saucers, bottles down the centre); and the workshop corner, a square table with six stools and
// soap moulds. Calm: the edges carry the detail, the middle stays clear around the table.
import { sk, tapeLabel } from "./scenes.js";

const OIL = ["#B9B04A", "#9FB04A", "#C9B84A", "#A8A040"], SOAP = ["#E8D5C4", "#C9B3E3", "#F4C7CF", "#FFF3D6", "#D9E8C4"], LOT = ["#FFFDF6", "#F4E3EC", "#EAF2E6"];
// cr: {shop, oils, soaps, lotions, steep, cure, tasting, workshop}
export function millUpArt(cr = {}){
  const floor = `<rect width="520" height="640" style="fill:#D9C7A8"/>${Array.from({length: 12}, (_, r) => `<path d="M0 ${180 + r*40} H520" style="stroke:#C4B08E" stroke-width="1.2"/>${Array.from({length: 5}, (_, c) => `<path d="M${(c*120 + (r % 2)*60) % 520} ${180 + r*40} v40" style="stroke:#C4B08E"/>`).join("")}`).join("")}`;
  const wall = `<g pointer-events="none"><rect width="520" height="170" style="fill:#F3ECDD"/><path d="M0 170 H520" style="stroke:var(--line)" stroke-width="1.4"/>${[60, 200, 340, 470].map(x => `<rect x="${x}" y="0" width="12" height="170" style="fill:#8A6A52" opacity=".55"/>`).join("")}<rect x="0" y="0" width="520" height="14" style="fill:#7A5638"/>
    <circle cx="260" cy="62" r="30" style="fill:#BFE0F2;stroke:#8A6A52" stroke-width="5"/><path d="M260 32 v60 M230 62 h60" style="stroke:#8A6A52" stroke-width="3"/></g>`;
  // the back wall: two long shelves of oil bottles, more the more there are
  const backN = Math.min(28, cr.oils || 0), back = `<g pointer-events="none">${sk(`<rect x="40" y="96" width="160" height="7" style="fill:#A8754F"/><rect x="320" y="96" width="160" height="7" style="fill:#A8754F"/><rect x="40" y="146" width="160" height="7" style="fill:#A8754F"/><rect x="320" y="146" width="160" height="7" style="fill:#A8754F"/>`,
      `<rect x="40" y="96" width="160" height="7"/><rect x="320" y="96" width="160" height="7"/><rect x="40" y="146" width="160" height="7"/><rect x="320" y="146" width="160" height="7"/>`)}
    ${Array.from({length: backN}, (_, i) => { const row = Math.floor(i/7) % 4, j = i % 7, x = (row % 2 ? 330 : 50) + j*21, y = row < 2 ? 96 : 146; return `<rect x="${x}" y="${y - 22}" width="9" height="22" rx="3" fill="${OIL[i % 4]}" stroke="#3a2e28" stroke-width=".7"/><rect x="${x + 2.5}" y="${y - 27}" width="4" height="6" fill="#5A3A2A"/>`; }).join("")}</g>`;
  // the side walls: tall shelves, soaps down the left, lotions down the right
  const side = (x, n, cols, round) => `<g pointer-events="none">${sk(`<rect x="${x}" y="190" width="34" height="300" style="fill:#A8754F"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${x}" y="${232 + k*58}" width="34" height="5" style="fill:#7A5638"/>`).join("")}`, `<rect x="${x}" y="190" width="34" height="300"/>`)}
    ${Array.from({length: Math.min(20, n)}, (_, i) => { const k = Math.floor(i/4), j = i % 4, yy = 230 + k*58; return round ? `<ellipse cx="${x + 5 + j*8}" cy="${yy - 5}" rx="3.6" ry="5" fill="${cols[i % cols.length]}" stroke="#3a2e28" stroke-width=".6"/>` : `<rect x="${x + 2 + (j % 2)*16}" y="${yy - 7 - Math.floor(j/2)*7}" width="14" height="6.5" rx="2" fill="${cols[i % cols.length]}" stroke="#3a2e28" stroke-width=".6"/>`; }).join("")}</g>`;
  // the workbench and curing rack, under the window's corner (top right)
  const bench = `<g data-millspot="bench" aria-label="The workbench: oils, soaps and lotions"><rect x="244" y="184" width="214" height="110" fill="transparent"/><ellipse class="hov" cx="400" cy="262" rx="60" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="340" y="222" width="110" height="12" rx="2" style="fill:#A8754F"/><path d="M346 234 v24 M444 234 v24" style="stroke:#7A5638" stroke-width="4"/>${[0, 1, 2].map(i => `<rect x="${352 + i*16}" y="${(i < (cr.steep || 0) ? 200 : 206)}" width="12" height="${i < (cr.steep || 0) ? 22 : 16}" rx="3" style="fill:${i < (cr.steep || 0) ? "#B9B04A" : "#E3EEF0"}"/>`).join("")}<ellipse cx="420" cy="218" rx="14" ry="4" style="fill:#C9A27E"/><path d="M410 218 q10 -12 20 0" style="fill:#7FA35A"/>`,
      `<rect x="340" y="222" width="110" height="12" rx="2"/>`)}
    ${sk(`<rect x="250" y="190" width="70" height="44" rx="2" style="fill:none;stroke:#8A6A52" stroke-width="3"/><path d="M250 204 h70 M250 218 h70" style="stroke:#8A6A52" stroke-width="2"/>${Array.from({length: Math.min(9, (cr.cure || 0)*3)}, (_, i) => `<rect x="${255 + (i % 3)*22}" y="${194 + Math.floor(i/3)*14}" width="15" height="8" rx="2" style="fill:${SOAP[i % 5]}"/>`).join("")}`, `<rect x="250" y="190" width="70" height="44" rx="2"/>`)}
    ${tapeLabel(395, 282, "Workbench", "#E6DDF2", 10)}</g>`;
  // the tasting table: long, in the middle; bottles down the centre, a cobalt glass and a saucer at every place
  const places = [0, 1, 2, 3].flatMap(i => [[190 + i*46, 328], [190 + i*46, 386]]);
  const tasting = `<g data-millspot="tasting" aria-label="The tasting table"><ellipse class="hov" cx="260" cy="408" rx="120" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="160" y="320" width="200" height="74" rx="4" style="fill:#B48A62"/><rect x="164" y="324" width="192" height="66" rx="3" style="fill:#C9A27E"/>`, `<rect x="160" y="320" width="200" height="74" rx="4"/>`)}
    ${places.map(([x, y]) => `<circle cx="${x}" cy="${y + 6}" r="6" fill="#FFFDF6" stroke="#2F2B28" stroke-width=".7"/><circle cx="${x}" cy="${y + 6}" r="3" fill="#C9B84A" opacity=".8"/><path d="M${x + 9} ${y} h7 l-1 9 h-5z" fill="#2E4FA8" stroke="#1E2E6A" stroke-width=".7"/>`).join("")}
    ${[200, 232, 264, 296, 328].map((x, i) => `<rect x="${x - 4}" y="${336}" width="9" height="24" rx="3" fill="${OIL[i % 4]}" stroke="#3a2e28" stroke-width=".7"/><rect x="${x - 1.5}" y="330" width="4" height="7" fill="#5A3A2A"/>`).join("")}
    <rect x="246" y="364" width="30" height="12" rx="3" fill="#8A6A52"/>${[0, 1, 2].map(i => `<ellipse cx="${252 + i*9}" cy="${367}" rx="5" ry="3.2" fill="#E3B47A" stroke="#2F2B28" stroke-width=".5"/>`).join("")}
    ${[0, 1, 2, 3].map(i => `<rect x="${184 + i*46}" y="304" width="14" height="10" rx="3" fill="#7A5638"/><rect x="${184 + i*46}" y="400" width="14" height="10" rx="3" fill="#7A5638"/>`).join("")}
    ${tapeLabel(260, 428, cr.tasting ? "Tasting now!" : "Tasting table", cr.tasting ? "#F3C969" : "#F3E1A0", 10)}</g>`;
  // the workshop corner: a square table, six stools, soap moulds and a jug
  const shop2 = `<g data-millspot="workshop" aria-label="The workshop corner"><ellipse class="hov" cx="410" cy="548" rx="70" ry="12" style="fill:var(--butter)"/>
    ${sk(`<rect x="364" y="470" width="92" height="60" rx="4" style="fill:#C9A27E"/>${[[372, 462], [400, 462], [428, 462], [372, 540], [400, 540], [428, 540]].map(([x, y]) => `<circle cx="${x + 8}" cy="${y}" r="7" style="fill:#7A5638"/>`).join("")}`, `<rect x="364" y="470" width="92" height="60" rx="4"/>`)}
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${372 + (i % 3)*26}" y="${480 + Math.floor(i/3)*24}" width="18" height="12" rx="2" fill="${SOAP[i % 5]}" stroke="#3a2e28" stroke-width=".6"/>`).join("")}<path d="M444 488 h8 v14 h-8z" fill="#E3EEF0" stroke="#2F2B28" stroke-width=".6"/>
    ${tapeLabel(410, 566, cr.workshop ? "Workshop on!" : "Workshop corner", cr.workshop ? "#F3C969" : "#EFE6D6", 10)}</g>`;
  // Hazel's counter at the top of the stairs (dust sheets until the shop's open)
  const counter = cr.shop ? `<g data-millspot="shop" aria-label="The Mill Shop counter"><ellipse class="hov" cx="214" cy="566" rx="64" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="156" y="528" width="116" height="34" rx="3" style="fill:#C9A27E"/><rect x="152" y="522" width="124" height="8" rx="2" style="fill:#8A6A52"/><rect x="246" y="510" width="20" height="12" rx="2" style="fill:#5F5E64"/>`, `<rect x="156" y="528" width="116" height="34" rx="3"/>`)}
    ${[0, 1, 2].map(i => `<rect x="${164 + i*22}" y="${510}" width="16" height="12" rx="2" fill="#E3C59F" stroke="#3a2e28" stroke-width=".6"/><path d="M${164 + i*22} ${514} h16" stroke="#C8432F" stroke-width="1.2"/>`).join("")}
    ${tapeLabel(214, 584, "The Mill Shop", "#F3E1A0", 10)}</g>`
    : `<g data-millspot="shop" aria-label="The dusty counter"><ellipse class="hov" cx="214" cy="566" rx="54" ry="10" style="fill:var(--butter)"/>${sk(`<rect x="164" y="530" width="100" height="32" rx="2" style="fill:#E6DCC8"/><path d="M170 534 l88 24 M258 534 l-88 24" style="stroke:#B8A884" stroke-width="2"/>`, `<rect x="164" y="530" width="100" height="32" rx="2"/>`)}${tapeLabel(214, 584, "Shop, one day?", "#EFE6D6", 9)}</g>`;
  // the stairs back down: the top of the stairwell, bottom left, with a rail
  const stairs = `<g data-exit="1" aria-label="Down the stairs to the press"><ellipse class="hov" cx="80" cy="590" rx="46" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="36" y="520" width="90" height="96" style="fill:#7A5638"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${40 + i*4}" y="${528 + i*17}" width="${82 - i*8}" height="12" style="fill:#A8754F"/>`).join("")}<path d="M130 520 v96 M126 520 h8" style="stroke:#5A3A2A" stroke-width="3"/>`, `<rect x="36" y="520" width="90" height="96"/>`)}
    <text class="lab" x="80" y="636" text-anchor="middle" pointer-events="none">Downstairs</text></g>`;
  return floor + wall + back + side(0, cr.soaps || 0, SOAP, false) + side(486, cr.lotions || 0, LOT, true) + bench + tasting + shop2 + counter + stairs;
}
