// The foreshore: west of the field and north of Ma Ma's flower farm, after the Mandurah foreshore. The sea runs down
// the west side (dolphins surfacing now and then, a paddleboarder far out), then a strip of sand with a bench and the
// jetty with its paddleboard rack, the boardwalk, Norfolk pines, and two family houses: Mum and Dad's, and Marcus
// and Angelina's. Gates: east to the field, south down the boardwalk to the flower farm.
import { ink } from "../util.js";
import { sk, tapeLabel, house, flowers, artCtx } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";
import { archGate } from "./orchard.js";

const W = `filter="url(#wob)" ${ink}`;
const SHORE = "M150 0 C172 90 132 190 158 300 C182 400 140 500 166 640";
// a dolphin arcing out of the water and back in, every dur seconds (begin staggers them)
const dolphin = (x, y, dur, begin, flip) => {
  const kt = "0;.55;.62;.7;.78;.84;1";
  return `<g pointer-events="none" transform="translate(${x} ${y})${flip ? " scale(-1 1)" : ""}"><g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;1;0;0" keyTimes="${kt}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="translate" values="0 12;0 12;6 -2;14 -7;22 -2;28 12;28 12" keyTimes="${kt}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    <g ${W}><path d="M-14 2 C-8 -8 8 -10 16 -2 C10 -2 4 0 -2 4 C-6 6 -12 6 -14 2Z" style="fill:#7C93A8"/><path d="M0 -7 l4 -7 l2 7z" style="fill:#7C93A8"/><path d="M-14 2 l-6 -4 l1 5 l-1 5z" style="fill:#7C93A8"/><circle cx="10" cy="-4" r=".9" style="fill:var(--line)"/></g>
    <path d="M-16 13 q6 -4 12 0 M14 13 q6 -4 12 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.4"/></g></g>`;
};
// a paddleboarder far out, drifting slowly up and down the coast
const farPaddler = (x, y, dy, dur) => `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" dur="${dur}s" repeatCount="indefinite"/>
  <g ${W} stroke-width=".8"><ellipse cx="${x}" cy="${y}" rx="11" ry="2" style="fill:#F3C969"/><rect x="${x - 2.4}" y="${y - 14}" width="4.8" height="9" rx="2" style="fill:#E8566C"/><path d="M${x - 1.5} ${y - 5} v4 M${x + 1.5} ${y - 5} v4" fill="none"/><circle cx="${x}" cy="${y - 17}" r="3" style="fill:#E6BC98"/><path d="M${x + 4} ${y - 14} l3 13" fill="none" style="stroke:#8A5A3A"/></g></g></g>`;
// a Norfolk pine: tall, tiered, very foreshore
const pine = (x, y, s = 1) => sk(`<rect x="${x - 3*s}" y="${y - 10*s}" width="${6*s}" height="${12*s}" style="fill:#8A5A3A"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${x - (22 - i*4)*s} ${y - (10 + i*14)*s} q${(22 - i*4)*s} ${-8*s} ${(44 - i*8)*s} 0 l${-6*s} ${-8*s} h${-(32 - i*8)*s}z" style="fill:${i % 2 ? "#5E8A5A" : "#6E9A63"}"/>`).join("")}`,
  `<path d="M${x} ${y - 82*s} v${80*s}"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${x - (22 - i*4)*s} ${y - (10 + i*14)*s} q${(22 - i*4)*s} ${-8*s} ${(44 - i*8)*s} 0"/>`).join("")}`);

// the stream: out of the sea at the top of the sand, east across the top of the screen and on into the field's lake
const STREAM = "M110 28 C196 24 238 46 290 40 C350 34 420 22 468 38 C494 46 510 52 534 56";
const BANK = "M156 26 C206 24 238 46 290 40 C350 34 420 22 468 38 C494 46 510 52 534 56";
const shoreStream = `<g filter="url(#wob)"><path d="${STREAM}" fill="none" style="stroke:var(--water)" stroke-width="16" stroke-linecap="round"/>
  <path d="${BANK}" fill="none" style="stroke:var(--line)" stroke-width="1" opacity=".4" transform="translate(0 -8)"/><path d="${BANK}" fill="none" style="stroke:var(--line)" stroke-width="1" opacity=".4" transform="translate(0 8)"/></g>
  <path class="ripple" d="M330 36 q4 -3 8 0 M440 28 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/>`;
export function shoreArt(){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="400" cy="560" rx="150" ry="80" style="fill:var(--grass2)"/><ellipse cx="440" cy="240" rx="110" ry="70" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M0 0 H150 C172 90 132 190 158 300 C182 400 140 500 166 640 H0Z" style="fill:var(--sea)"/>
      <path d="M0 0 H70 C90 120 60 260 84 380 C100 480 70 560 86 640 H0Z" style="fill:var(--sea2)" opacity=".7"/>
      <path d="${SHORE} H228 C206 520 238 420 216 320 C196 210 234 110 208 0Z" style="fill:var(--sand)"/></g>
    <g filter="url(#wob)" fill="none"><path d="${SHORE}" style="stroke:#FFFDF6" stroke-width="3.2" stroke-dasharray="10 7" opacity=".9"/><path d="${SHORE}" style="stroke:var(--line)" stroke-width="1" opacity=".45"/>
      <path d="M228 640 C206 520 238 420 216 320 C196 210 234 110 208 0" style="stroke:var(--line)" stroke-width="1" opacity=".35"/></g>
    ${shoreStream}
    <g pointer-events="none">${[[40, 120], [104, 170], [30, 280], [120, 330], [56, 420], [98, 520], [36, 600], [124, 600]].map(([x, y]) => `<path class="ripple" d="M${x} ${y} q5 -3.5 10 0 q5 3.5 10 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.3" opacity=".8"/>`).join("")}</g>
    <g ${W} opacity=".7">${[[186, 140], [178, 360], [196, 560], [170, 220]].map(([x, y]) => `<path d="M${x} ${y} l3 -3 l3 3 M${x + 10} ${y + 6} q2 -3 4 0" fill="none"/>`).join("")}</g>
    <g filter="url(#wob)"><path d="M250 150 V640 M250 300 H520 M360 300 V222 M400 300 V466" fill="none" style="stroke:#D9BE94" stroke-width="20" stroke-linecap="round"/>
      <path d="M250 150 V640 M250 300 H520" fill="none" style="stroke:#C9A87A" stroke-width="20" stroke-dasharray="1.4 9" opacity=".7"/></g>
    ${pine(286, 150, 1.1)}${pine(470, 210, 1)}${pine(300, 470, .95)}${pine(486, 560, 1.05)}${pine(330, 620, .9)}
    ${flowers([[440, 250, "#EFA3A6"], [462, 268, "#F3C969"], [288, 360, "#C3CDEE"], [470, 400, "#EFA3A6"], [300, 560, "#F3C969"]])}`;
  const sea = dolphin(80, 200, 11, 1, false) + dolphin(64, 238, 11, 2.2, false) + dolphin(96, 470, 14, 6, true) + farPaddler(40, 330, 140, 70);
  const jetty = `<g pointer-events="none">${sk(`<rect x="34" y="454" width="176" height="18" rx="2" style="fill:#C9A27E"/>`, `<rect x="34" y="454" width="176" height="18" rx="2"/>${Array.from({length: 11}, (_, i) => `<path d="M${50 + i*15} 454 v18"/>`).join("")}${[44, 88, 132, 176].map(x => `<path d="M${x} 472 v10"/>`).join("")}`)}</g>`;
  const rack = `<g data-place="suprack" aria-label="Paddleboard rack"><ellipse class="hov" cx="216" cy="480" rx="30" ry="9" style="fill:var(--butter)"/>
    ${sk(`${["#F3C969", "#7FB8E8", "#E8566C"].map((c, i) => `<path d="M${202 + i*9} 474 q-4 -20 2 -38 q6 18 2 38z" style="fill:${c}"/>`).join("")}<rect x="196" y="452" width="40" height="5" rx="2" style="fill:var(--wood)"/>`,
      `${[0, 1, 2].map(i => `<path d="M${202 + i*9} 474 q-4 -20 2 -38 q6 18 2 38z"/>`).join("")}<path d="M198 474 v-24 M234 474 v-24"/><rect x="196" y="452" width="40" height="5" rx="2"/>`)}
    ${tapeLabel(214, 504, "Paddleboards", "var(--sky)", 10)}</g>`;
  const bench = `<g data-place="dolphins" aria-label="Boardwalk bench: watch for dolphins"><ellipse class="hov" cx="214" cy="256" rx="30" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="192" y="238" width="44" height="7" rx="2" style="fill:var(--wood)"/><rect x="192" y="228" width="44" height="6" rx="2" style="fill:var(--wood)"/>`, `<rect x="192" y="238" width="44" height="7" rx="2"/><rect x="192" y="228" width="44" height="6" rx="2"/><path d="M196 245 v9 M232 245 v9 M196 234 v4 M232 234 v4"/>`)}
    ${tapeLabel(214, 276, "Dolphin bench", "var(--peri)", 10)}</g>`;
  const mumdad = house("mumdad", 300, 140, 120, 76, "#EAF2F5", "#3E6B8C", "Mum and Dad's", "var(--sky)",
    {art: `<path d="M318 168 l4 -10 l4 10z M330 164 v-8 l6 -2 v8" style="fill:#2F2B28"/><rect x="300" y="210" width="120" height="6" style="fill:#3E6B8C"/>`, lines: `<circle cx="333" cy="164" r="2"/><circle cx="339" cy="162" r="2"/>`});
  const marcus = house("marcus", 340, 384, 120, 76, "#FFF3E6", "#8E5B9A", "Marcus and Angelina's", "var(--blush)",
    {art: `<path d="M452 396 h-10 v10" style="fill:none"/><circle cx="356" cy="452" r="5" style="fill:#7FA35A"/><circle cx="444" cy="452" r="5" style="fill:#7FA35A"/>`, lines: `<path d="M352 456 h8 l-1 4 h-6z M440 456 h8 l-1 4 h-6z"/>`});
  // the dolphin cruise boat (a big goal) at the end of the jetty; out on a cruise it sails up the coast and back with
  // the family aboard and dolphins alongside. Before it's bought: a mooring post with a "your boat here" sign
  const G = artCtx(), F = G.F(), S = G.S ? G.S() : {}, boatOwned = !!((F.goals || {}).boat), cruising = !!(S.cruise && Date.now() < S.cruise.until);
  const boat = boatOwned ? `<g data-place="boat" aria-label="Dolphin cruise boat"><ellipse class="hov" cx="206" cy="552" rx="30" ry="9" style="fill:var(--butter)"/>
      <g class="${cruising ? "cruising" : "moored"}"><g ${W}>
        <path d="M30 506 h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M34 514 h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="58" y="488" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M56 488 h38" style="stroke:#3E6B8C" stroke-width="2"/>
        <path d="M100 488 v-26 l16 10z" style="fill:#E8566C"/>
        ${cruising ? `<circle cx="64" cy="482" r="5" style="fill:#F8DECD"/><path d="M60 480 q4 -8 9 -1" style="fill:#2A211D"/><circle cx="78" cy="485" r="3.6" style="fill:#F8DECD"/><path d="M75 483 q3 -5 6 0" style="fill:#2A211D"/>` : ""}</g>
        ${cruising ? `<g class="podhop">${dolphin(130, 500, 4, 0, false)}${dolphin(4, 520, 5, 1.6, true)}</g>` : ""}</g>
      ${tapeLabel(206, 574, "Dolphin cruise", "var(--peri)", 10)}</g>`
    : `<g data-place="boat" aria-label="The mooring: save up for a dolphin cruise boat"><ellipse class="hov" cx="206" cy="552" rx="26" ry="8" style="fill:var(--butter)"/>
      ${sk(`<rect x="200" y="512" width="8" height="34" style="fill:var(--wood)"/><rect x="178" y="512" width="52" height="18" rx="2" style="fill:#FFFDF6"/>`, `<rect x="200" y="512" width="8" height="34"/><rect x="178" y="512" width="52" height="18" rx="2"/><path d="M186 521 h36" opacity=".55"/>`)}
      ${tapeLabel(206, 574, "Boat mooring", "var(--peri)", 10)}</g>`;
  return lampDefs + ground + sea + jetty + boat + [[272, 214], [272, 440]].map(([x, y]) => streetLamp(x, y)).join("") + bench + rack + mumdad + marcus
    + archGate("toFieldS", 500, 292, "The field", 470, 334, "var(--peri)", "Gate to the field")
    + archGate("toFlowersS", 250, 616, "Flower farm", 314, 604, "var(--blush)", "Gate to the flower farm");
}
