// Honeybrook Woods: the wooded hill east of the cottage lane, above Makers' Lane. Along the top, the railway runs on
// from Honeybrook station into a tunnel under the hill. Under the cliff, the waterfall: the source of all the village's
// water. Its pool feeds the Honeybrook (west along the top row, under the station) and the river (south, down past
// Makers' Lane to the vineyard, home, the orchard and the lake). The ranger's cabin, the bike hire, a foraging patch,
// the lookout, a picnic bench, and the river taxi's first stop. Gates: west to the cottage lane, south to Makers' Lane.
import { ink } from "../util.js";
import { sk, tapeLabel, tree, flowers } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";
import { archGate } from "./orchard.js";
import { track, brook, trainLayer, RAIL_Y } from "./railway.js";
import { fishSpotArt } from "./fishing.js";
import { bikeRack, taxiStop } from "./transport.js";

const W = ink;
// a dark conifer, for the deep woods (the round village trees are for the edges)
const pine = (x, y, s = 1) => `<g pointer-events="none">${sk(`<rect x="${x - 3*s}" y="${y - 12*s}" width="${6*s}" height="${12*s}" style="fill:#7A5638"/><path d="M${x} ${y - 70*s} L${x + 22*s} ${y - 30*s} H${x + 12*s} L${x + 26*s} ${y - 10*s} H${x - 26*s} L${x - 12*s} ${y - 30*s} H${x - 22*s}z" style="fill:#5E8A5A"/>`,
  `<path d="M${x} ${y - 70*s} L${x + 22*s} ${y - 30*s} H${x + 12*s} L${x + 26*s} ${y - 10*s} H${x - 26*s} L${x - 12*s} ${y - 30*s} H${x - 22*s}z"/>`)}</g>`;
// the river: a wide wavy ribbon through the given points (it flows from the pool down to the south-west corner)
export function riverPath(pts, w = 22, col = "#9FD3E8"){
  const d = pts.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ");
  return `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:var(--line)" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" style="stroke:#FFFDF6" stroke-width="1.6" stroke-dasharray="8 22" opacity=".8"><animate attributeName="stroke-dashoffset" from="0" to="-60" dur="3s" repeatCount="indefinite"/></path></g>`;
}
export const RIVER = [[214, 236], [176, 286], [120, 336], [84, 410], [44, 500], [20, 580], [14, 650]];
const plank = (x, y, w = 40) => sk(`<rect x="${x - w/2}" y="${y - 10}" width="${w}" height="20" rx="2" style="fill:#C9A27E"/>`, `<rect x="${x - w/2}" y="${y - 10}" width="${w}" height="20" rx="2"/><path d="M${x - w/2 + 8} ${y - 10} v20 M${x} ${y - 10} v20 M${x + w/2 - 8} ${y - 10} v20" opacity=".5"/>`);

export function hwoodsArt(){
  const ground = `<rect width="520" height="640" style="fill:#DCE8CC"/>
    <g filter="url(#wash)" opacity=".8"><ellipse cx="400" cy="420" rx="160" ry="200" style="fill:#C9DDB4"/><ellipse cx="120" cy="560" rx="120" ry="60" style="fill:#C9DDB4"/><ellipse cx="270" cy="150" rx="140" ry="70" style="fill:#B9D2A0"/></g>
    <g filter="url(#wob)"><path d="M22 330 C90 330 140 322 200 318 C260 314 330 300 400 290 M300 262 C306 330 320 420 330 640 M330 420 C380 430 410 450 430 474 M200 318 C190 400 160 460 140 520" fill="none" style="stroke:var(--path)" stroke-width="16" stroke-linecap="round"/></g>
    ${flowers([[90, 260, "#C3CDEE"], [470, 380, "#F3C969"], [240, 560, "#EFA3A6"], [400, 590, "#C3CDEE"], [60, 410, "#F3C969"]])}`;
  // along the top: the track runs into a tunnel under the hill (the hill is drawn after the train, so it disappears in)
  const top = track(0, 450) + brook(0, 170);
  const hill = sk(`<path d="M420 0 H520 V118 C480 120 450 100 430 70 C424 50 420 30 420 0z" style="fill:#9CB98A"/><path d="M432 64 V30 q22 -24 44 0 V64z" style="fill:#3A3430"/><path d="M428 66 V28 q26 -30 52 0 V66" style="fill:none;stroke:#B9B0A4" stroke-width="6"/>`,
    `<path d="M420 0 C420 30 424 50 430 70 C450 100 480 120 520 118"/><path d="M428 66 V28 q26 -30 52 0 V66"/>`) + pine(470, 112, .7) + pine(500, 90, .6);
  // the cliff and the waterfall, tumbling into the pool; the brook leaves the pool west, the river south-west
  const fall = sk(`<path d="M190 182 C186 140 196 104 222 92 H312 C336 104 344 140 340 186 C320 172 300 168 262 168 C228 168 206 172 190 182z" style="fill:#B9B0A4"/><path d="M204 150 l16 -8 M318 140 l12 10 M214 116 l10 6 M310 112 l-10 8" style="stroke:#8A8279" stroke-width="2"/>`,
    `<path d="M190 182 C186 140 196 104 222 92 H312 C336 104 344 140 340 186"/>`)
    + `<g pointer-events="none" filter="url(#wob)"><path d="M248 96 h30 l4 112 h-38z" style="fill:#CFE8F4;stroke:var(--line)" stroke-width="1.2"/>${[0, 1, 2, 3].map(i => `<path d="M${252 + i*7} 100 v100" style="stroke:#FFFDF6" stroke-width="1.6" stroke-dasharray="10 14"><animate attributeName="stroke-dashoffset" from="0" to="-48" dur="${.8 + i*.15}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
  const brookDown = riverPath([[170, 92], [196, 130], [200, 196], [226, 214]], 14);
  const pool = riverPath(RIVER, 22) + `<g filter="url(#wob)"><ellipse cx="262" cy="222" rx="74" ry="28" style="fill:#9FD3E8;stroke:var(--line)" stroke-width="1.2"/><ellipse cx="262" cy="212" rx="26" ry="7" style="fill:#FFFDF6" opacity=".7"><animate attributeName="rx" values="22;30;22" dur="2.4s" repeatCount="indefinite"/></ellipse></g>`
    + plank(120, 330, 46);   // the footbridge on the trail in from the west gate
  const cabin = `<g data-place="ranger" aria-label="The ranger's cabin"><ellipse class="hov" cx="414" cy="286" rx="50" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="364" y="224" width="100" height="58" style="fill:#A8754F"/>${[234, 246, 258, 270].map(y => `<path d="M364 ${y} h100" style="stroke:#7A5638" stroke-width="1.4"/>`).join("")}<path d="M354 226 L414 186 L474 226z" style="fill:#5E8A5A"/><rect x="404" y="250" width="20" height="32" rx="2" style="fill:#6B4430"/><rect x="376" y="238" width="18" height="14" rx="2" style="fill:#F3E1A0"/><rect x="436" y="238" width="18" height="14" rx="2" style="fill:#F3E1A0"/><rect x="448" y="196" width="8" height="20" style="fill:#8A6A52"/>`,
      `<rect x="364" y="224" width="100" height="58"/><path d="M354 226 L414 186 L474 226z"/><rect x="404" y="250" width="20" height="32" rx="2"/><rect x="376" y="238" width="18" height="14" rx="2"/><rect x="436" y="238" width="18" height="14" rx="2"/>`)}
    ${sk(`<rect x="378" y="200" width="44" height="14" rx="2" style="fill:#FFFDF6"/>`, `<rect x="378" y="200" width="44" height="14" rx="2"/>`)}<text x="400" y="210" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="#5E8A5A" pointer-events="none">RANGER</text>
    ${tapeLabel(414, 304, "Ranger's cabin", "#C3E8DA", 10)}</g>`;
  // the foraging patch: brambles, a mushroom ring, a chestnut tree and wild garlic, whatever's in season shows
  const forage = `<g data-place="forage" aria-label="The foraging patch"><ellipse class="hov" cx="132" cy="560" rx="56" ry="12" style="fill:var(--butter)"/>
    ${sk(`<path d="M84 548 q20 -34 48 -10 q22 -26 46 6 q4 12 -6 16 h-82 q-12 -2 -6 -12z" style="fill:#7FA35A"/>`, `<path d="M84 548 q20 -34 48 -10 q22 -26 46 6"/>`)}
    <g ${W} stroke-width=".8" pointer-events="none">${[[100, 540], [118, 532], [142, 538], [160, 544]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" style="fill:#4A3550"/>`).join("")}${[[96, 560], [114, 566], [150, 564]].map(([x, y]) => `<path d="M${x - 5} ${y} q5 -8 10 0z" style="fill:#C98A4A"/><rect x="${x - 1.4}" y="${y}" width="2.8" height="5" style="fill:#F6EBC8"/>`).join("")}</g>
    ${tapeLabel(132, 588, "Foraging", "#E3EED2", 10)}</g>`;
  const lookout = `<g data-place="lookout" aria-label="The lookout"><ellipse class="hov" cx="460" cy="500" rx="34" ry="9" style="fill:var(--butter)"/>
    ${sk(`<path d="M440 496 l6 -70 M480 496 l-6 -70" style="stroke:#8A6A52" stroke-width="5"/><rect x="432" y="412" width="56" height="12" style="fill:#C9A27E"/><path d="M432 412 v-16 M488 412 v-16 M432 398 h56" style="stroke:#8A6A52" stroke-width="2.4"/><path d="M428 398 L460 370 L492 398z" style="fill:#B5443A"/><path d="M446 496 l4 -10 M450 486 h20 M454 476 h12 M458 466 h4" style="stroke:#8A6A52" stroke-width="2"/>`,
      `<rect x="432" y="412" width="56" height="12"/><path d="M428 398 L460 370 L492 398z"/>`)}${tapeLabel(460, 520, "Lookout", "#F3E1A0", 10)}</g>`;
  const bench = `<g pointer-events="none">${sk(`<rect x="224" y="456" width="44" height="7" rx="2" style="fill:#C9A27E"/><rect x="228" y="463" width="4" height="10" style="fill:#8A6A52"/><rect x="260" y="463" width="4" height="10" style="fill:#8A6A52"/>`, `<rect x="224" y="456" width="44" height="7" rx="2"/>`)}</g>`;
  const trees = [[30, 150, .9], [70, 230, .8], [500, 170, .9], [492, 330, .8], [40, 640, .9], [500, 640, .85], [200, 640, .7]].map(([x, y, s]) => tree(x, y, s)).join("")
    + [[96, 120, 1], [370, 150, .9], [150, 200, .8], [480, 250, .9], [240, 400, .9], [400, 360, .8], [60, 300, .7], [220, 520, .8], [400, 560, .9], [500, 450, .7], [300, 610, .75], [160, 420, .7]].map(([x, y, s]) => pine(x, y, s)).join("");
  return lampDefs + ground + top + trainLayer("hwoods") + hill + brookDown + fall + pool + trees + cabin + bikeRack("bikeswoods", 478, 330) + forage + lookout + bench
    + fishSpotArt("hwoods") + taxiStop("taxiwoods", 156, 262, "hwoods")
    + archGate("toLaneW", 22, 330, "Cottage lane", 66, 300, "var(--butter)", "West to the cottage lane and the station")
    + archGate("toMakersW", 330, 620, "Makers' Lane", 390, 600, "var(--peri)", "Down the hill to Makers' Lane")
    + streetLamp(330, 330);
}
