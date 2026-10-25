// The sea along the bottom of the bottom row (round 266, the creator: "that little water that's flowing east in the lighthouse
// screen... can that carry over on the stables and village green and lower vineyard too?"). The same strip of sand and
// sea on the Stables, the green and the lower vineyard, meeting Lighthouse Point's bottom edge at its east side.
const ripple = ([x, y]) => `<path class="ripple" d="M${x} ${y} q5 -3.5 10 0 q5 3.5 10 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.3" opacity=".8"/>`;
export const SHORE_Y = 592;   // where the water starts at each screen edge (walk no further)
export function southShore(){
  const sand = "M0 554 C120 548 260 562 390 554 C450 550 490 556 520 554 V640 H0Z";
  const sea = "M0 592 C100 604 220 590 330 600 C420 606 480 594 520 592 V640 H0Z";
  const edge = "M0 592 C100 604 220 590 330 600 C420 606 480 594 520 592";
  return `<g pointer-events="none"><g filter="url(#wob)"><path d="${sand}" style="fill:var(--sand)"/><path d="${sea}" style="fill:var(--sea)"/>
    <path d="M0 614 C140 622 300 610 420 620 C470 624 500 616 520 614 V640 H0Z" style="fill:var(--sea2)" opacity=".7"/></g>
    <g filter="url(#wob)" fill="none"><path d="${edge}" style="stroke:#FFFDF6" stroke-width="3.2" stroke-dasharray="10 7" opacity=".9"/><path d="${edge}" style="stroke:var(--line)" stroke-width="1" opacity=".45"/></g>
    ${[[60, 618], [190, 622], [330, 616], [460, 624]].map(ripple).join("")}</g>`;
}

// round 271: the Sunday car boot sale on the green, two little cars with their boots up and a trestle table between
import { sk, tapeLabel } from "./scenes.js";
const car = (x, y, col) => sk(`<rect x="${x - 30}" y="${y - 24}" width="60" height="22" rx="7" style="fill:${col}"/><path d="M${x - 18} ${y - 24} l6 -12 h22 l6 12z" style="fill:#DCE8F0"/><path d="M${x + 30} ${y - 22} l14 -16 h4 l-4 18z" style="fill:${col}"/>
    <rect x="${x + 28}" y="${y - 20}" width="14" height="12" rx="2" style="fill:#F6E3C6"/><circle cx="${x - 16}" cy="${y - 2}" r="6" style="fill:#3B3530"/><circle cx="${x + 16}" cy="${y - 2}" r="6" style="fill:#3B3530"/>`,
  `<rect x="${x - 30}" y="${y - 24}" width="60" height="22" rx="7"/><path d="M${x - 18} ${y - 24} l6 -12 h22 l6 12z"/><path d="M${x + 30} ${y - 22} l14 -16 h4 l-4 18z"/><rect x="${x + 28}" y="${y - 20}" width="14" height="12" rx="2"/><circle cx="${x - 16}" cy="${y - 2}" r="6"/><circle cx="${x + 16}" cy="${y - 2}" r="6"/>`);
export function carBootArt(){
  const table = sk(`<rect x="320" y="372" width="56" height="8" rx="2" style="fill:#F6EFE3"/><circle cx="330" cy="368" r="4" style="fill:#F4C7CF"/><rect x="340" y="362" width="8" height="10" style="fill:#A8754F"/><circle cx="358" cy="367" r="5" style="fill:#9FC3D9"/><rect x="366" y="364" width="6" height="8" style="fill:#C9A04A"/>`,
    `<rect x="320" y="372" width="56" height="8" rx="2"/><path d="M324 380 l-4 12 M372 380 l4 12"/><rect x="340" y="362" width="8" height="10"/><circle cx="358" cy="367" r="5"/>`);
  return `<g data-place="gboot" aria-label="The car boot sale"><g transform="translate(0 -10)"><ellipse class="hov" cx="348" cy="396" rx="90" ry="12" style="fill:var(--butter)"/>${car(286, 392, "#9FC3D9")}${table}${car(410, 392, "#F4C7CF")}</g>
    ${tapeLabel(348, 400, "Car boot sale", "var(--butter)", 10)}</g>`;
}
