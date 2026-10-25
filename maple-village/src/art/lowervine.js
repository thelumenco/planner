// The lower vineyard (round 261, the creator: "There's not enough vines for the variety we have... I need another 6"): down
// the hill from the vineyard, the bottom-right screen of the 4 by 4 grid. Four more trellis rows (rows 3 to 6 of
// F.vine.rows, bought at the stall like the others), the stream carrying on down the left, an old stone grape press,
// and a bench at the bottom looking out to sea. Path up to the vineyard at the top right.
import { sk, tapeLabel, tree, flowers } from "./scenes.js";
import { rowArt, UPPER } from "./vineyard.js";
import { southShore } from "./southshore.js";

export function lowerVineArt(v, ruin = 0){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="320" cy="380" rx="200" ry="200" style="fill:var(--grass2)"/><ellipse cx="120" cy="120" rx="120" ry="60" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)" fill="none" opacity=".4" style="stroke:var(--moss2)" stroke-width="3" stroke-dasharray="2 7">${[214, 296, 378, 460].map(y => `<path d="M200 ${y} Q330 ${y - 6} 476 ${y + 2}"/>`).join("")}</g>
    <g filter="url(#wob)"><g clip-path="url(#lvStream)"><path d="M14 0 C24 120 6 220 18 330 C28 430 8 520 20 640" fill="none" style="stroke:var(--water)" stroke-width="16"/><path d="M8 0 C18 120 0 220 12 330 C22 430 2 520 14 640 M22 0 C32 120 14 220 26 330 C36 430 16 520 28 640" fill="none" style="stroke:var(--line)" stroke-width="1.2" opacity=".6"/></g></g>
    <path class="ripple" d="M12 180 q4 -3 8 0 M16 470 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/>
    <g filter="url(#wob)"><path d="M432 0 C452 90 498 190 490 300 C484 400 478 480 430 560 C400 590 360 596 330 600 M490 300 C420 304 300 300 180 300 C150 300 130 310 118 330" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"/></g>
    ${flowers([[60, 90, "#EFA3A6"], [150, 200, "#F3C969"], [470, 180, "#C3CDEE"], [90, 420, "#EFA3A6"], [160, 520, "#F3C969"], [480, 420, "#EFA3A6"], [200, 120, "#C3CDEE"]])}
    ${tree(236, 74, .7)}${tree(150, 530, .75)}`;
  // round 266: the sea along the bottom, carried on from Lighthouse Point (it used to be a misty valley)
  const shore = southShore();
  // round 281 (Mel: "Gate covered by tracker"): moved in from the top right corner, where the tracker column sits
  const up = `<g data-place="toVineD" aria-label="Path up to the vineyard"><g transform="translate(-66 0)"><ellipse class="hov" cx="498" cy="26" rx="26" ry="18" style="fill:var(--butter)"/>
    ${sk(`<rect x="478" y="2" width="5" height="34" style="fill:var(--wood)"/><rect x="512" y="2" width="5" height="34" style="fill:var(--wood)"/><path d="M474 6 q24 -14 46 0 v5 q-23 -11 -46 0z" style="fill:#9CC27E"/>`,
      `<rect x="478" y="2" width="5" height="34"/><rect x="512" y="2" width="5" height="34"/><path d="M474 6 q24 -14 46 0 v5 q-23 -11 -46 0z"/>`)}
    ${tapeLabel(450, 58, "The vineyard", "var(--sage)", 10)}</g></g>`;
  // the old stone grape press: a round stone basin, a wooden screw and beam, a stone trough to catch the juice
  const press = `<g data-place="vpress" aria-label="The old grape press"><ellipse class="hov" cx="110" cy="368" rx="54" ry="11" style="fill:var(--butter)"/>
    ${sk(`<ellipse cx="110" cy="352" rx="44" ry="14" style="fill:#BDB3A4"/><rect x="66" y="330" width="88" height="22" style="fill:#CFC6B8"/><ellipse cx="110" cy="330" rx="44" ry="13" style="fill:#A99D8C"/><ellipse cx="110" cy="330" rx="34" ry="9" style="fill:#6B2A55" opacity=".55"/>
      <rect x="104" y="270" width="12" height="62" style="fill:#8A6A4E"/><rect x="70" y="268" width="80" height="10" rx="3" style="fill:#A8754F"/><rect x="152" y="344" width="26" height="12" rx="3" style="fill:#BDB3A4"/>`,
      `<ellipse cx="110" cy="352" rx="44" ry="14"/><path d="M66 330 v22 M154 330 v22"/><ellipse cx="110" cy="330" rx="44" ry="13"/><path d="M110 278 v52 M104 290 h12 M104 302 h12 M104 314 h12" opacity=".6"/><rect x="70" y="268" width="80" height="10" rx="3"/><rect x="152" y="344" width="26" height="12" rx="3"/><path d="M80 346 h60" opacity=".35"/>`)}
    ${tapeLabel(110, 392, "Old press", "var(--peach)", 10)}</g>`;
  // the bench at the bottom, facing the sea
  const bench = `<g data-place="vbench" aria-label="The sea bench"><ellipse class="hov" cx="300" cy="590" rx="44" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="266" y="566" width="68" height="8" rx="2" style="fill:#A8754F"/><rect x="266" y="552" width="68" height="8" rx="2" style="fill:#B98A5A"/>`,
      `<rect x="266" y="566" width="68" height="8" rx="2"/><rect x="266" y="552" width="68" height="8" rx="2"/><path d="M272 574 v12 M328 574 v12 M270 560 v6 M330 560 v6"/>`)}
    ${tapeLabel(300, 540, "Sea bench", "var(--sky)", 10)}</g>`;
  const sign = sk(`<rect x="160" y="176" width="72" height="16" rx="2" style="fill:#FFFDF6"/>`, `<rect x="160" y="176" width="72" height="16" rx="2"/><path d="M196 192 v14"/>`)
    + `<text x="196" y="187.5" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="9.5" style="fill:var(--line)" pointer-events="none">lower vines</text>`;
  // round 262: west over a little footbridge on the stream to Honeybrook Green
  const west = `<g data-place="toGreenV" aria-label="Footbridge to Honeybrook Green"><ellipse class="hov" cx="24" cy="330" rx="28" ry="20" style="fill:var(--butter)"/>
    ${sk(`<rect x="0" y="318" width="48" height="18" rx="2" style="fill:#C9A27E"/>`, `<rect x="0" y="318" width="48" height="18" rx="2"/><path d="M10 318 v18 M20 318 v18 M30 318 v18 M40 318 v18" opacity=".5"/><path d="M0 314 h48" stroke-width="2"/>`)}
    ${tapeLabel(64, 362, "The green", "var(--sage)", 10)}</g>`;
  // round 278 (Mel: "the same as how we did it for the bay, where it widens and enters the sea"): the stream crosses
  // the sand and fans out into a little river mouth where it meets the sea, like the river at the foreshore
  // round 279 (Mel: "the colour of the stream changes too abruptly into the sea"): the fan shades from the stream's pale
  // blue into the sea's blue and runs on under the surf line, so the two waters merge
  // round 280 (Mel: "it doesn't look smooth"): the stream stops at y 480 (clipped) and the fan grows out of its two
  // banks there, flaring west to the screen edge and east along a long curve, so there is no step where they meet
  const surf = "M30 520 C35 540 48 560 70 574 C88 586 104 594 112 600", bank = "M26 474 C26 486 27 494 28 506 C32 534 46 558 70 574 C88 586 104 594 112 600 M11 474 C10 500 6 516 0 530";
  const mouth = `<defs><clipPath id="lvStream"><rect x="-20" y="-20" width="80" height="500"/></clipPath><linearGradient id="lvMouth" gradientUnits="userSpaceOnUse" x1="0" y1="474" x2="0" y2="608"><stop offset="0" style="stop-color:var(--water)"/><stop offset=".45" style="stop-color:var(--water)"/><stop offset="1" style="stop-color:var(--sea)"/></linearGradient></defs>
    <g filter="url(#wob)" pointer-events="none"><path d="M11 474 C10 500 6 516 0 530 V614 H136 C130 610 122 606 112 600 C104 594 88 586 70 574 C46 558 32 534 28 506 C27 494 26 486 26 474Z" style="fill:url(#lvMouth)"/>
    <path d="${surf}" fill="none" style="stroke:#FFFDF6" stroke-width="3" stroke-dasharray="9 6" opacity=".9"/><path d="${bank}" fill="none" style="stroke:var(--line)" stroke-width="1.2" opacity=".6"/>
    <path class="ripple" d="M14 520 q4 -3 8 0 M50 584 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/></g>`;
  // round 282: Bram's For Sale sign by the path, until you buy the lower vineyard from him
  const sale = v.lower ? "" : `<g data-place="vsale" aria-label="Bram's For Sale sign" transform="translate(-40 24)"><ellipse class="hov" cx="330" cy="152" rx="34" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="327" y="112" width="6" height="40" style="fill:var(--wood)"/><rect x="302" y="104" width="56" height="26" rx="2" style="fill:#FFFDF6"/><rect x="318" y="132" width="24" height="14" rx="1" style="fill:#E8F0F6" transform="rotate(4 330 139)"/>`,
      `<rect x="327" y="112" width="6" height="40"/><rect x="302" y="104" width="56" height="26" rx="2"/><rect x="318" y="132" width="24" height="14" rx="1" transform="rotate(4 330 139)"/><path d="M322 137 h16 M322 141 h12" opacity=".5" transform="rotate(4 330 139)"/>`)}
    <text x="330" y="115.5" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="8.5" style="fill:#B5473A" pointer-events="none">FOR SALE</text>
    <text x="330" y="125" text-anchor="middle" font-family="Klee One,serif" font-size="6.5" style="fill:var(--line)" pointer-events="none">ask Bram</text></g>`;
  // round 291 (Mel: "Yes build the ruins"): the priory ruins behind the old press, the monks' herb garden. ruin is how
  // far it's restored (game/south.js RUIN_STEPS): 0 brambles, 1 cleared, 2 walls up, 3 gate hung, 4 sage and lavender
  const stone = "#CFC6B8", stone2 = "#BDB3A4";
  const arch = sk(`<rect x="100" y="36" width="12" height="70" style="fill:${stone}"/><rect x="146" y="36" width="12" height="70" style="fill:${stone}"/><path d="M100 40 Q129 -2 158 40 L146 40 Q129 14 112 40z" style="fill:${stone2}"/>`,
    `<rect x="100" y="36" width="12" height="70"/><rect x="146" y="36" width="12" height="70"/><path d="M100 40 Q129 -2 158 40 L146 40 Q129 14 112 40z"/><path d="M100 60 h12 M146 54 h12 M100 82 h12 M146 78 h12" opacity=".45"/>`)
    + `<path d="M152 60 v12 M148 64 h8 M150 70 q4 2 2 6" fill="none" style="stroke:#8A7A6A" stroke-width="1.2"/>`;   // the cross and the vine, carved
  const tumbled = sk([[52, 112], [70, 120], [178, 116], [196, 104], [60, 74], [190, 78]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" style="fill:${stone2}"/>`).join(""), [[52, 112], [70, 120], [178, 116], [196, 104], [60, 74], [190, 78]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5"/>`).join(""));
  const wall = sk(`<path d="M44 66 h52 M162 66 h46 M44 66 v60 M208 66 v60 M44 126 h70 M144 126 h64" fill="none" style="stroke:${stone}" stroke-width="9" stroke-linecap="round"/>`,
    `<path d="M44 66 h52 M162 66 h46 M44 66 v60 M208 66 v60 M44 126 h70 M144 126 h64" fill="none" stroke-width="1"/>`);
  const gate = sk(`<rect x="114" y="120" width="30" height="12" rx="1" style="fill:#A8754F"/>`, `<rect x="114" y="120" width="30" height="12" rx="1"/><path d="M121 120 v12 M129 120 v12 M137 120 v12 M114 126 h30" opacity=".5"/>`);
  const herbs = `<g style="stroke:var(--line)" stroke-width=".6">${[56, 76, 172, 192].map((x, i) => [80, 96, 112].map(y => i < 2
      ? `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.5" style="fill:#9CB59A"/><ellipse cx="${x + 3}" cy="${y - 2}" rx="4" ry="2.6" style="fill:#B5C9B0"/>`
      : `<path d="M${x - 5} ${y + 3} q5 -12 10 0" fill="none" style="stroke:#7FA36E"/><path d="M${x - 4} ${y - 4} v-6 M${x} ${y - 6} v-7 M${x + 4} ${y - 4} v-6" style="stroke:#9C8CD9" stroke-width="2.4" stroke-linecap="round"/>`).join("")).join("")}</g>`;
  const brambles = `<g fill="none" style="stroke:#4E6B3E" stroke-width="2" opacity=".85">${[[60, 100], [90, 80], [120, 110], [160, 90], [190, 110], [80, 120], [180, 70], [130, 70]].map(([x, y]) => `<path d="M${x - 16} ${y} q8 -18 16 -2 q8 14 16 -4 M${x - 10} ${y + 6} q10 -10 20 2"/>`).join("")}</g>`
    + [[70, 92], [150, 104], [184, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" style="fill:#5A2A4A"/>`).join("");
  const ruins = `<g data-place="vruins" aria-label="The priory ruins"><ellipse class="hov" cx="126" cy="132" rx="62" ry="10" style="fill:var(--butter)"/>
    ${ruin >= 4 ? herbs : ""}${ruin >= 2 ? wall : tumbled}${ruin >= 3 ? gate : ""}${arch}${ruin === 0 ? brambles : ""}
    ${tapeLabel(178, 20, "Priory ruins", "var(--peri)", 9.5)}</g>`;
  // round 276 (Mel): the press sits higher, clear of the footbridge
  return ground + shore + mouth + up + west + sign + ruins + `<g transform="translate(0 -120)">${press}</g>` + v.rows.slice(UPPER).map((row, k) => rowArt(row, UPPER + k)).join("") + bench + sale;
}
