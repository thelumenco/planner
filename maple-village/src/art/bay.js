// The bay, north of the foreshore up the boardwalk: the sea and sand carry on up the west side, then The Scoop Shack
// (Mel's ice cream shop) with its deck looking out over the water, and a shopfront under renovation (a craft brewery?
// a chocolatier?). The boardwalk runs down to the foreshore gate at the bottom.
import { ink } from "../util.js";
import { sk, tapeLabel, house, flowers, artCtx } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";
import { archGate } from "./orchard.js";

const W = `filter="url(#wob)" ${ink}`;
const COAST = "M150 0 C176 120 134 250 160 380 C182 480 140 560 150 640";
export const DECK = {x: 176, y: 372};
// where people sit on the deck (two to a table, three tables)
export const DECK_SEATS = [[134, 360], [172, 352], [196, 360], [222, 352], [150, 404], [190, 404]];
const pine = (x, y, s = 1) => sk(`<rect x="${x - 3*s}" y="${y - 10*s}" width="${6*s}" height="${12*s}" style="fill:#8A5A3A"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${x - (22 - i*4)*s} ${y - (10 + i*14)*s} q${(22 - i*4)*s} ${-8*s} ${(44 - i*8)*s} 0 l${-6*s} ${-8*s} h${-(32 - i*8)*s}z" style="fill:${i % 2 ? "#5E8A5A" : "#6E9A63"}"/>`).join("")}`,
  `<path d="M${x} ${y - 82*s} v${80*s}"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${x - (22 - i*4)*s} ${y - (10 + i*14)*s} q${(22 - i*4)*s} ${-8*s} ${(44 - i*8)*s} 0"/>`).join("")}`);
// a dolphin arcing out of the water now and then
const dolphin = (x, y, dur, begin) => { const kt = "0;.55;.62;.7;.78;.84;1";
  return `<g pointer-events="none" transform="translate(${x} ${y})"><g opacity="0"><animate attributeName="opacity" values="0;0;1;1;1;0;0" keyTimes="${kt}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="translate" values="0 12;0 12;6 -2;14 -7;22 -2;28 12;28 12" keyTimes="${kt}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    <g ${W}><path d="M-14 2 C-8 -8 8 -10 16 -2 C10 -2 4 0 -2 4 C-6 6 -12 6 -14 2Z" style="fill:#7C93A8"/><path d="M0 -7 l4 -7 l2 7z" style="fill:#7C93A8"/></g></g></g>`; };

export function bayArt(){
  const G = artCtx(), sc = G.scoop ? G.scoop() : {name: "The Scoop Shack"}, name = sc.name || "The Scoop Shack";
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="420" cy="360" rx="120" ry="70" style="fill:var(--grass2)"/><ellipse cx="380" cy="600" rx="140" ry="50" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M0 0 H150 C176 120 134 250 160 380 C182 480 140 560 150 640 H0Z" style="fill:var(--sea)"/>
      <path d="M0 0 H76 C96 140 62 280 88 400 C102 500 72 580 86 640 H0Z" style="fill:var(--sea2)" opacity=".7"/>
      <path d="${COAST} H214 C230 540 200 440 226 330 C246 220 208 110 228 0Z" style="fill:var(--sand)"/></g>
    <g filter="url(#wob)" fill="none"><path d="${COAST}" style="stroke:#FFFDF6" stroke-width="3.2" stroke-dasharray="10 7" opacity=".9"/><path d="${COAST}" style="stroke:var(--line)" stroke-width="1" opacity=".45"/></g>
    <g pointer-events="none">${[[40, 90], [100, 150], [30, 260], [110, 470], [50, 540], [120, 600]].map(([x, y]) => `<path class="ripple" d="M${x} ${y} q5 -3.5 10 0 q5 3.5 10 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.3" opacity=".8"/>`).join("")}</g>
    <g filter="url(#wob)"><path d="M250 640 V300 H386 V266" fill="none" style="stroke:#D9BE94" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M250 640 V300 H386" fill="none" style="stroke:#C9A87A" stroke-width="20" stroke-dasharray="1.4 9" opacity=".7"/></g>
    ${pine(490, 150, 1)}${pine(300, 140, .9)}${pine(500, 470, .95)}${pine(398, 636, .78)}${pine(470, 624, .85)}
    ${flowers([[300, 320, "#EFA3A6"], [470, 300, "#F3C969"], [290, 470, "#C3CDEE"], [480, 380, "#EFA3A6"], [440, 570, "#F3C969"]])}`;
  const sea = dolphin(70, 210, 13, 2) + dolphin(56, 500, 16, 7);
  // The Scoop Shack: mint walls, a pink and white striped awning, a big cone on the roof and the sign
  const shop = house("scoopshop", 316, 180, 140, 82, "#E3F2EC", "#F2A0B8", name, "var(--blush)", {
    art: `<path d="M308 198 h156 l-6 14 h-144z" style="fill:#FFFDF6"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${312 + i*26} 198 h13 l-1 14 h-13z" style="fill:#F2A0B8"/>`).join("")}
      <rect x="350" y="150" width="72" height="18" rx="3" style="fill:#FFFDF6"/><path d="M379 112 l7 24 l7 -24z" style="fill:#E8C48E"/><circle cx="386" cy="108" r="9" style="fill:#F4C7CF"/><circle cx="380" cy="100" r="6" style="fill:#C3E8B8"/>`,
    lines: `<path d="M308 198 h156 l-6 14 h-144z"/><rect x="350" y="150" width="72" height="18" rx="3"/><path d="M379 112 l7 24 l7 -24z"/><circle cx="386" cy="108" r="9"/><circle cx="380" cy="100" r="6"/>`});
  const sign = `<text x="386" y="163" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="${name.length > 16 ? 7 : 8.5}" fill="#C2505F" pointer-events="none">${name.replace(/[<&>]/g, "").slice(0, 22)}</text>`;
  // the deck: boards out over the sand, three little tables with umbrellas
  const umb = (x, y, c) => sk(`<path d="M${x - 18} ${y - 34} q18 -16 36 0z" style="fill:${c}"/><ellipse cx="${x}" cy="${y - 8}" rx="13" ry="5" style="fill:#FFFDF6"/>`, `<path d="M${x - 18} ${y - 34} q18 -16 36 0z M${x} ${y - 34} v26"/><ellipse cx="${x}" cy="${y - 8}" rx="13" ry="5"/><path d="M${x} ${y - 3} v6"/>`);
  const deck = `<g data-place="deck" aria-label="The deck"><ellipse class="hov" cx="176" cy="420" rx="70" ry="12" style="fill:var(--butter)"/>
    ${sk(`<rect x="112" y="326" width="128" height="92" rx="3" style="fill:#C9A27E"/>`, `<rect x="112" y="326" width="128" height="92" rx="3"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M112 ${338 + i*12} h128" opacity=".5"/>`).join("")}<path d="M112 326 v-10 M240 326 v-10 M112 316 h128" />`)}
    ${umb(152, 362, "#F2A0B8")}${umb(208, 362, "#9FD3C2")}${umb(170, 412, "#F3C969")}
    ${tapeLabel(176, 446, "The deck", "var(--sky)", 10)}</g>`;
  // the shopfront under renovation: boards over the windows, scaffolding, a sign
  const reno = `<g data-place="reno" aria-label="Under renovation"><ellipse class="hov" cx="396" cy="526" rx="70" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M318 432 L396 390 L474 432z" style="fill:#B9B0A4"/><rect x="326" y="432" width="140" height="84" style="fill:#E8DCC8"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${330 + i*19}" y="446" width="16" height="66" style="fill:${i % 2 ? "#D9BE94" : "#C9A87A"}"/>`).join("")}
      <rect x="352" y="458" width="88" height="30" rx="2" transform="rotate(-3 396 473)" style="fill:#FFFDF6"/>`,
      `<path d="M318 432 L396 390 L474 432z"/><rect x="326" y="432" width="140" height="84"/><path d="M322 516 V420 M470 516 V420 M322 444 H470 M322 480 H470 M322 420 L470 516 M470 420 L322 516" opacity=".55"/>
      <rect x="352" y="458" width="88" height="30" rx="2" transform="rotate(-3 396 473)"/>`)}
    <text x="396" y="471" text-anchor="middle" transform="rotate(-3 396 473)" font-family="Klee One,serif" font-weight="600" font-size="8" fill="#5E5A55" pointer-events="none">Coming soon</text>
    <text x="396" y="482" text-anchor="middle" transform="rotate(-3 396 473)" font-family="Klee One,serif" font-size="6.5" fill="#8A8279" pointer-events="none">brewery? chocolatier?</text>
    ${tapeLabel(396, 540, "Under renovation", "var(--card)", 10)}</g>`;
  return lampDefs + ground + sea + [[272, 250], [272, 470]].map(([x, y]) => streetLamp(x, y)).join("") + shop + sign + deck + reno
    + archGate("toShoreB", 250, 616, "Foreshore", 314, 604, "var(--sky)", "Boardwalk to the foreshore");
}
