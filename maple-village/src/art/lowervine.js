// The lower vineyard (round 261, Mel: "There's not enough vines for the variety we have... I need another 6"): down
// the hill from the vineyard, the bottom-right screen of the 4 by 4 grid. Four more trellis rows (rows 3 to 6 of
// F.vine.rows, bought at the stall like the others), the stream carrying on down the left, an old stone grape press,
// and a bench at the bottom looking out to sea. Path up to the vineyard at the top right.
import { sk, tapeLabel, tree, flowers } from "./scenes.js";
import { rowArt, UPPER } from "./vineyard.js";
import { southShore } from "./southshore.js";

export function lowerVineArt(v){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="320" cy="380" rx="200" ry="200" style="fill:var(--grass2)"/><ellipse cx="120" cy="120" rx="120" ry="60" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)" fill="none" opacity=".4" style="stroke:var(--moss2)" stroke-width="3" stroke-dasharray="2 7">${[214, 296, 378, 460].map(y => `<path d="M200 ${y} Q330 ${y - 6} 476 ${y + 2}"/>`).join("")}</g>
    <g filter="url(#wob)"><path d="M14 0 C24 120 6 220 18 330 C28 430 8 520 20 640" fill="none" style="stroke:var(--water)" stroke-width="16"/><path d="M8 0 C18 120 0 220 12 330 C22 430 2 520 14 640 M22 0 C32 120 14 220 26 330 C36 430 16 520 28 640" fill="none" style="stroke:var(--line)" stroke-width="1.2" opacity=".6"/></g>
    <path class="ripple" d="M12 180 q4 -3 8 0 M16 470 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/>
    <g filter="url(#wob)"><path d="M502 0 C494 100 498 200 490 300 C484 400 478 480 430 560 C400 590 360 596 330 600 M490 300 C420 304 300 300 180 300 C150 300 130 310 118 330" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"/></g>
    ${flowers([[60, 90, "#EFA3A6"], [150, 200, "#F3C969"], [470, 180, "#C3CDEE"], [90, 420, "#EFA3A6"], [160, 520, "#F3C969"], [480, 420, "#EFA3A6"], [200, 120, "#C3CDEE"]])}
    ${tree(60, 96, .8)}${tree(220, 70, .7)}${tree(150, 530, .75)}`;
  // round 266: the sea along the bottom, carried on from Lighthouse Point (it used to be a misty valley)
  const shore = southShore();
  const up = `<g data-place="toVineD" aria-label="Path up to the vineyard"><ellipse class="hov" cx="498" cy="26" rx="26" ry="18" style="fill:var(--butter)"/>
    ${sk(`<rect x="478" y="2" width="5" height="34" style="fill:var(--wood)"/><rect x="512" y="2" width="5" height="34" style="fill:var(--wood)"/><path d="M474 6 q24 -14 46 0 v5 q-23 -11 -46 0z" style="fill:#9CC27E"/>`,
      `<rect x="478" y="2" width="5" height="34"/><rect x="512" y="2" width="5" height="34"/><path d="M474 6 q24 -14 46 0 v5 q-23 -11 -46 0z"/>`)}
    ${tapeLabel(450, 58, "The vineyard", "var(--sage)", 10)}</g>`;
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
  const mouth = `<defs><linearGradient id="lvMouth" gradientUnits="userSpaceOnUse" x1="0" y1="520" x2="0" y2="606"><stop offset="0" style="stop-color:var(--water)"/><stop offset=".55" style="stop-color:var(--water)" stop-opacity=".9"/><stop offset="1" style="stop-color:var(--sea)"/></linearGradient></defs>
    <g filter="url(#wob)" pointer-events="none"><path d="M10 506 H30 C34 534 44 556 70 574 C88 586 104 594 112 600 C122 606 130 610 136 614 H0 V506z" style="fill:url(#lvMouth)"/>
    <path d="M30 506 C34 534 44 556 70 574 C88 586 104 594 112 600" fill="none" style="stroke:#FFFDF6" stroke-width="3" stroke-dasharray="9 6" opacity=".9"/><path d="M30 506 C34 534 44 556 70 574 C88 586 104 594 112 600" fill="none" style="stroke:var(--line)" stroke-width="1" opacity=".45"/>
    <path class="ripple" d="M24 560 q4 -3 8 0 M50 584 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/></g>`;
  // round 276 (Mel): the press sits higher, clear of the footbridge
  return ground + shore + mouth + up + west + sign + `<g transform="translate(0 -120)">${press}</g>` + v.rows.slice(UPPER).map((row, k) => rowArt(row, UPPER + k)).join("") + bench;
}
