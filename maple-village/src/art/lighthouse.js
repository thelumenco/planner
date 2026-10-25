// Lighthouse Point: the bottom-left corner of the village map, where the coast path ends. The sea runs down the
// west side and along the bottom, meeting at a rocky headland with the lighthouse on it. Beach huts on the dunes,
// a fish and chip hatch, rock pools at the water's edge, and a stile east to the Stables.
import { sk, tapeLabel, flowers } from "./scenes.js";
import { bramCottageOut } from "./bramcot.js";
import { perched, flying } from "./gulls.js";

// the sea: a strip x 0 to 60 at the top edge (joins the flower farm), out to the headland, then along the bottom
const SEA = "M0 0 H60 C66 110 56 220 72 320 C80 370 64 410 50 440 C40 480 46 520 72 548 C110 582 170 596 240 596 C330 592 430 600 520 592 V640 H0Z";
const EDGE = "M60 0 C66 110 56 220 72 320 C80 370 64 410 50 440 C40 480 46 520 72 548 C110 582 170 596 240 596 C330 592 430 600 520 592";
const SAND = "M60 0 H96 C104 110 92 220 110 310 C112 340 104 360 96 380 L60 540 C120 560 200 560 270 556 C360 552 440 560 520 552 V600 H0 V0Z";
const ripple = ([x, y]) => `<path class="ripple" d="M${x} ${y} q5 -3.5 10 0 q5 3.5 10 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.3" opacity=".8"/>`;
const tuft = ([x, y]) => `<path d="M${x} ${y} q-3 -10 -7 -14 M${x} ${y} q0 -12 1 -17 M${x} ${y} q3 -9 8 -13" fill="none" style="stroke:#8FA86E" stroke-width="1.4" stroke-linecap="round"/>`;
const gull = ([x, y]) => `<path d="M${x - 7} ${y} q3.5 -4 7 0 q3.5 -4 7 0" fill="none" style="stroke:var(--line)" stroke-width="1.2" stroke-linecap="round"/>`;
const rock = (x, y, rx, ry, c) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${c || "#B9B0A4"}"/>`;
const rockL = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;

export function lighthouseArt(night){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="380" cy="370" rx="140" ry="80" style="fill:var(--grass2)"/><ellipse cx="260" cy="120" rx="110" ry="60" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="${SAND}" style="fill:var(--sand)"/><path d="${SEA}" style="fill:var(--sea)"/>
      <path d="M0 0 H30 C36 140 26 280 34 400 C30 470 24 560 60 600 C200 616 380 618 520 614 V640 H0Z" style="fill:var(--sea2)" opacity=".7"/></g>
    <g filter="url(#wob)" fill="none"><path d="${EDGE}" style="stroke:#FFFDF6" stroke-width="3.2" stroke-dasharray="10 7" opacity=".9"/><path d="${EDGE}" style="stroke:var(--line)" stroke-width="1" opacity=".45"/></g>
    <g pointer-events="none">${[[18, 80], [24, 200], [14, 330], [12, 470], [70, 610], [200, 618], [360, 614], [470, 620]].map(ripple).join("")}</g>
    <g filter="url(#wob)"><path d="M150 0 C152 70 140 140 180 200 C220 250 320 262 390 262 C450 262 480 300 510 330 M200 232 C222 320 232 400 206 456 C190 494 164 512 140 520 M214 430 C300 424 380 456 430 505" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"/>
      <path d="M150 0 C152 70 140 140 180 200 C220 250 320 262 390 262" fill="none" style="stroke:var(--path2)" stroke-width="20" stroke-dasharray="1.4 9" opacity=".6"/></g>
    <g pointer-events="none">${[[100, 120], [112, 136], [104, 250], [118, 268], [250, 300], [480, 400], [300, 540], [356, 548], [500, 540], [80, 30], [470, 150]].map(tuft).join("")}</g>
    <g pointer-events="none">${[[30, 140], [46, 152], [200, 70], [300, 610], [330, 330]].map(gull).join("")}</g>
    ${flowers([[250, 160, "#EFA3A6"], [276, 170, "#F3C969"], [470, 200, "#C3CDEE"], [330, 360, "#EFA3A6"], [470, 380, "#F3C969"], [280, 450, "#C3CDEE"], [350, 120, "#F3C969"], [420, 120, "#EFA3A6"]])}`;

  const up = `<g data-place="toFlowersL" aria-label="Coast path to the flower farm"><ellipse class="hov" cx="150" cy="24" rx="28" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="128" y="0" width="5" height="36" style="fill:var(--wood)"/><rect x="168" y="0" width="5" height="36" style="fill:var(--wood)"/><path d="M124 6 q26 -14 52 0 v5 q-26 -11 -52 0z" style="fill:#F2A0B8"/>`,
      `<rect x="128" y="0" width="5" height="36"/><rect x="168" y="0" width="5" height="36"/><path d="M124 6 q26 -14 52 0 v5 q-26 -11 -52 0z"/>`)}
    ${tapeLabel(150, 56, "Flower farm", "var(--rose)", 10)}</g>`;

  const stile = `<g data-place="toStablesL" aria-label="Path to the Stables"><ellipse class="hov" cx="498" cy="330" rx="24" ry="22" style="fill:var(--butter)"/>
    ${sk(`<rect x="488" y="300" width="6" height="40" style="fill:var(--wood)"/><rect x="510" y="300" width="6" height="40" style="fill:var(--wood)"/><rect x="484" y="312" width="36" height="5" style="fill:#B98A5A"/><rect x="484" y="326" width="36" height="5" style="fill:#B98A5A"/><rect x="480" y="334" width="20" height="5" rx="1" style="fill:#A8754F"/>`,
      `<rect x="488" y="300" width="6" height="40"/><rect x="510" y="300" width="6" height="40"/><rect x="484" y="312" width="36" height="5"/><rect x="484" y="326" width="36" height="5"/><rect x="480" y="334" width="20" height="5" rx="1"/>`)}
    ${tapeLabel(470, 366, "The Stables", "var(--peach)", 10)}</g>`;

  // the lighthouse: white tower, two red bands, a black lamp room with a gallery rail, on rocks on the headland
  const lamp = night ? "#FFD98A" : "#CFE0EE";
  // round 269 (the creator: "Add the lighthouse glow"): at night the lamp, its halo and the beam are tagged nglow, so core.js
  // copies them above the evening darkening (like neon and fairy lights) and they shine instead of going dim
  const beam = night ? `<g class="nglow" pointer-events="none"><path d="M112 372 L0 296 L0 424z" fill="#FFE9A0" opacity=".34"/><path d="M112 378 L0 466 L0 524z" fill="#FFE9A0" opacity=".18"/>
    <circle cx="120" cy="373" r="34" fill="#FFE9A0" opacity=".22"/><circle cx="120" cy="373" r="20" fill="#FFE9A0" opacity=".4"/><rect x="110" y="362" width="20" height="22" rx="2" fill="#FFD98A"/><circle cx="120" cy="373" r="5" fill="#FFF6D8"/></g>` : "";
  const tower = "M104 500 L110 392 H130 L136 500z";
  const light = `<g data-place="llight" aria-label="The lighthouse"><ellipse class="hov" cx="140" cy="520" rx="46" ry="12" style="fill:var(--butter)"/>
    ${sk(`${rock(92, 510, 30, 14)}${rock(150, 514, 26, 12, "#A99D8C")}${rock(70, 486, 18, 10, "#A99D8C")}${rock(120, 502, 36, 10, "#CFC8BE")}
      <path d="${tower}" style="fill:#FFFDF6"/><path d="M106 470 H134 L135 484 H105z M108 424 H132 L133 438 H107z" style="fill:#E8566C"/>
      <rect x="106" y="384" width="28" height="8" style="fill:#3B3530"/><rect x="110" y="362" width="20" height="22" rx="2" style="fill:${lamp}"/><path d="M106 362 L120 346 L134 362z" style="fill:#3B3530"/>
      <rect x="114" y="484" width="12" height="16" rx="5" style="fill:#FFFDF6"/><rect x="116" y="404" width="7" height="10" rx="2" style="fill:var(--sky)"/>`,
      `${rockL(92, 510, 30, 14)}${rockL(150, 514, 26, 12)}${rockL(70, 486, 18, 10)}<path d="${tower}"/><path d="M106 470 H134 M105 484 H135 M108 424 H132 M107 438 H133"/>
      <rect x="106" y="384" width="28" height="8"/><rect x="110" y="362" width="20" height="22" rx="2"/><path d="M120 362 v22 M106 362 L120 346 L134 362z M120 346 v-5"/>
      <path d="M102 384 H138 M102 384 v-8 M110 384 v-8 M130 384 v-8 M138 384 v-8 M102 376 H138" opacity=".8"/>
      <rect x="114" y="484" width="12" height="16" rx="5"/><circle cx="123" cy="493" r="1"/><rect x="116" y="404" width="7" height="10" rx="2"/>`)}
    ${tapeLabel(150, 546, "Lighthouse", "var(--peri)", 10)}</g>`;

  // the rock pools: grey rocks with little pools, a starfish, a crab and seaweed
  const pools = `<g data-place="lpools" aria-label="The rock pools"><ellipse class="hov" cx="270" cy="560" rx="44" ry="10" style="fill:var(--butter)"/>
    ${sk(`${rock(240, 584, 22, 10)}${rock(296, 588, 26, 11, "#A99D8C")}${rock(270, 572, 18, 8, "#CFC8BE")}
      <ellipse cx="242" cy="583" rx="12" ry="4.5" style="fill:var(--water)"/><ellipse cx="298" cy="587" rx="14" ry="5" style="fill:var(--water)"/>
      <path d="M296 581 l1.6 3.4 l3.6 .3 l-2.8 2.4 l1 3.6 l-3.4 -2 l-3.4 2 l1 -3.6 l-2.8 -2.4 l3.6 -.3z" style="fill:#F2A290"/>
      <ellipse cx="270" cy="569" rx="5" ry="3.4" style="fill:#E8566C"/>`,
      `${rockL(240, 584, 22, 10)}${rockL(296, 588, 26, 11)}${rockL(270, 572, 18, 8)}<ellipse cx="242" cy="583" rx="12" ry="4.5"/>
      <ellipse cx="270" cy="569" rx="5" ry="3.4"/><path d="M265 567 l-3 -3 M275 567 l3 -3 M266 572 l-3 2 M274 572 l3 2"/>
      <path d="M236 584 q-2 -6 1 -10 M240 584 q2 -5 0 -9" style="stroke:#6E9A5A"/>`)}
    ${tapeLabel(270, 538, "Rock pools", "var(--sky)", 10)}</g>`;

  // four little beach huts on the dunes, pitched roofs, striped fronts
  const hut = (x, c) => `<path d="M${x - 3} 196 L${x + 19} 176 L${x + 41} 196z" style="fill:#FFFDF6"/><rect x="${x}" y="196" width="38" height="34" style="fill:${c}"/><rect x="${x + 12}" y="206" width="14" height="24" rx="2" style="fill:#FFFDF6" opacity=".85"/>`;
  const hutL = x => `<path d="M${x - 3} 196 L${x + 19} 176 L${x + 41} 196z"/><rect x="${x}" y="196" width="38" height="34"/><rect x="${x + 12}" y="206" width="14" height="24" rx="2"/><path d="M${x + 4} 200 v26 M${x + 34} 200 v26" opacity=".4"/>`;
  const HX = [298, 346, 394, 442];
  const huts = `<g data-place="lhuts" aria-label="The beach huts"><ellipse class="hov" cx="390" cy="248" rx="100" ry="14" style="fill:var(--butter)"/>
    ${sk(HX.map((x, i) => hut(x, ["#F4C7CF", "#BFDCEF", "#F6E3A6", "#C9DDB8"][i])).join(""), HX.map(hutL).join(""))}
    ${tapeLabel(390, 270, "Beach huts", "var(--butter)", 10)}</g>`;

  // the fish and chip hatch: a little kiosk with a striped awning, a hatch and a chalkboard
  const awn = Array.from({length: 7}, (_, i) => `<path d="M${394 + i*10} 430 h10 v10 q-5 5 -10 0z" style="fill:${i % 2 ? "#FFFDF6" : "#7FB8E8"}"/>`).join("");
  const chips = `<g data-place="lchips" aria-label="The fish and chip hatch"><ellipse class="hov" cx="430" cy="505" rx="46" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M394 420 L430 400 L466 420z" style="fill:#3E6B8C"/><rect x="398" y="420" width="64" height="70" style="fill:#EAF2F5"/>${awn}<rect class="wglow" x="408" y="446" width="44" height="22" rx="2" style="fill:#F6E3A6"/><rect x="404" y="468" width="52" height="5" style="fill:var(--wood)"/>
      <rect x="470" y="462" width="20" height="26" rx="2" style="fill:#4A4642"/>`,
      `<path d="M394 420 L430 400 L466 420z"/><rect x="398" y="420" width="64" height="70"/><path d="M394 430 h70"/><rect x="408" y="446" width="44" height="22" rx="2"/><rect x="404" y="468" width="52" height="5"/>
      <rect x="470" y="462" width="20" height="26" rx="2"/><path d="M472 488 l-3 6 M488 488 l3 6"/>`)}
    <text x="480" y="473" text-anchor="middle" font-family="Klee One,serif" font-size="5.5" fill="#FFFDF6" pointer-events="none">cod</text><text x="480" y="481" text-anchor="middle" font-family="Klee One,serif" font-size="5.5" fill="#FFFDF6" pointer-events="none">chips</text>
    <text x="430" y="416" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="6.5" fill="#FFFDF6" pointer-events="none">fish and chips</text>
    ${tapeLabel(430, 528, "Fish and chips", "var(--peach)", 10)}</g>`;

  const bench = `<g pointer-events="none">${sk(`<rect x="300" y="486" width="48" height="7" rx="2" style="fill:#A8754F"/><rect x="300" y="474" width="48" height="6" rx="2" style="fill:#B98A5A"/>`,
    `<rect x="300" y="486" width="48" height="7" rx="2"/><rect x="300" y="474" width="48" height="6" rx="2"/><path d="M304 493 v9 M344 493 v9 M304 480 v6 M344 480 v6"/>`)}</g>`;

  // round 276 (Mel): the lighthouse sits 36 higher, leaving room between it and the mackerel rocks
  // round 287 (Mel: "Would love seagulls at the lighthouse"): gulls perched on the jetty, a hut roof, Dot's roof (the
  // one eyeing your chips; tap it) and the rocks, and three gliding slowly over the point by day
  const gulls = `<g pointer-events="none">${perched(20, 176, 1, 0, [52, -20])}${perched(365, 176, -1, -3, [67, -48])}${perched(108, 452, -1, -6)}${night ? "" : flying(230, 110, 0) + flying(300, 140, -4) + flying(90, 300, -8)}</g>
    <g data-place="lgull" aria-label="A seagull on Dot's roof"><ellipse class="hov" cx="446" cy="406" rx="16" ry="6" style="fill:var(--butter)"/>${perched(446, 404, 1, -1.5)}</g>`;
  return ground + `<g transform="translate(0 -36)">${beam}</g>` + up + stile + huts + bench + chips + bramCottageOut() + `<g transform="translate(0 -36)">${light}</g>` + pools + gulls;
}
