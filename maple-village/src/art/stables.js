// The Stables: a small riding stable south of the orchard. The path comes down through a gap in the hedge at the top,
// the long timber stable block (three half-doors, two ponies looking out, a clock and weathervane on the roof) and the
// tack room sit along the top of the yard, the gates to the green (east) and Lighthouse Point (west) either side,
// the paddock with two grazing ponies fills the bottom right, and the little sand ring for pony rides the bottom left.
import { southShore } from "./southshore.js";
import { ink } from "../util.js";
import { sk, tapeLabel, tree, flowers } from "./scenes.js";

// post-and-rail fence along a straight line (posts every ~28px)
const rail = (x1, y1, x2, y2) => { const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1)/28));
  const posts = Array.from({length: n + 1}, (_, i) => { const x = x1 + (x2 - x1)*i/n, y = y1 + (y2 - y1)*i/n; return `<rect x="${x - 2}" y="${y - 16}" width="4" height="18" style="fill:#8A6A52"/>`; }).join("");
  return sk(`<path d="M${x1} ${y1 - 11} L${x2} ${y2 - 11} M${x1} ${y1 - 3} L${x2} ${y2 - 3}" style="stroke:#B98A5A" stroke-width="3"/>${posts}`, `<path d="M${x1} ${y1 - 11} L${x2} ${y2 - 11} M${x1} ${y1 - 3} L${x2} ${y2 - 3}"/>`); };

// a grazing pony: head down to the grass, a slow tail swish if asked
function pony(x, y, c, mane, dapple, swish, flip){
  const spots = dapple ? [[-10, -3], [-2, 2], [6, -4], [-14, 4], [12, 1]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.4" style="fill:#FFFDF6" opacity=".7" stroke="none"/>`).join("") : "";
  const tail = `<g><path d="M-21 -5 q-9 4 -7 18 q4 -2 5 -6 q1 -6 3 -10z" style="fill:${mane}"/>${swish ? `<animateTransform attributeName="transform" type="rotate" values="0 -21 -5; 12 -21 -5; 0 -21 -5" dur="6s" repeatCount="indefinite"/>` : ""}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)" ${ink} stroke-width="1.1">${tail}
    ${[-15, -8, 9, 15].map(a => `<rect x="${a - 2}" y="6" width="4.5" height="14" style="fill:${c}"/><rect x="${a - 2}" y="18" width="4.5" height="3" style="fill:#4A3A30"/>`).join("")}
    <ellipse cx="0" cy="0" rx="22" ry="12" style="fill:${c}"/>${spots}
    <path d="M14 -6 q12 2 16 20 l-7 3 q-4 -12 -13 -15z" style="fill:${c}"/><ellipse cx="28" cy="20" rx="5" ry="7" transform="rotate(-20 28 20)" style="fill:${c}"/>
    <path d="M14 -9 q10 0 15 16" fill="none" style="stroke:${mane}" stroke-width="3.5"/><circle cx="27" cy="15" r=".9" style="fill:#3A2E28"/></g>`;
}
// a pony's head looking out over a half-door (dx = the door's centre)
const ponyHead = (dx, c, mane, blaze) => sk(`<path d="M${dx - 9} 196 q-2 -16 4 -24 l10 0 q6 8 4 24z" style="fill:${c}"/><ellipse cx="${dx + 2}" cy="${blaze ? 182 : 183}" rx="7" ry="10" style="fill:${c}"/>
    <path d="M${dx - 4} 170 l-2 -6 l5 3z M${dx + 6} 170 l2 -6 l-5 3z" style="fill:${c}"/><path d="M${dx - 6} 170 q-3 10 -3 24" fill="none" style="stroke:${mane}" stroke-width="3"/>
    ${blaze ? `<path d="M${dx + 2} 175 v12" style="stroke:#FFFDF6" stroke-width="2.4"/>` : ""}<ellipse cx="${dx + 2}" cy="190" rx="5" ry="3.5" style="fill:#D9B9A0"/>`,
  `<ellipse cx="${dx + 2}" cy="183" rx="7" ry="10"/><circle cx="${dx - 2}" cy="180" r=".8"/><circle cx="${dx + 6}" cy="180" r=".8"/>`);

export function stablesArt(){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="365" cy="490" rx="150" ry="110" style="fill:var(--grass2)"/><ellipse cx="80" cy="120" rx="90" ry="50" style="fill:var(--grass2)"/><ellipse cx="450" cy="100" rx="80" ry="40" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M260 0 V300 M22 330 C90 320 160 300 260 300 C360 300 430 320 498 330 M110 240 C130 270 180 290 230 298 M320 242 V300 M250 304 C230 340 214 380 214 420 M214 420 C206 500 200 560 110 572" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"/>
      <ellipse cx="260" cy="300" rx="74" ry="30" style="fill:var(--path)"/><ellipse cx="260" cy="300" rx="74" ry="30" fill="none" style="stroke:var(--path2)" stroke-width="1.5" stroke-dasharray="3 7"/></g>
    ${flowers([[30, 270, "#EFA3A6"], [44, 278, "#F3C969"], [180, 360, "#C3CDEE"], [470, 290, "#EFA3A6"], [30, 610, "#F3C969"], [200, 620, "#EFA3A6"], [400, 270, "#F3C969"], [150, 130, "#C3CDEE"], [470, 620, "#C3CDEE"]])}
    ${tree(460, 100, .9)}${tree(500, 230, .8)}${tree(36, 410, .75)}${tree(176, 560, .65)}`;
  // the hedge along the top, with a gap and a rose arch where the path comes down from the orchard
  const hedge = (x1, x2) => sk(`<path d="M${x1} 0 H${x2} V30 q-12 10 -24 2 q-12 10 -24 0 q-12 10 -24 2 H${x1}z" style="fill:var(--moss)"/>`, `<path d="M${x1} 30 H${x2}" opacity=".5"/>`);
  const north = hedge(0, 230) + hedge(290, 520) + `<g data-place="toOrchardS" aria-label="Path up to the orchard"><ellipse class="hov" cx="260" cy="24" rx="30" ry="18" style="fill:var(--butter)"/>
    ${sk(`<rect x="232" y="0" width="6" height="40" style="fill:var(--wood)"/><rect x="282" y="0" width="6" height="40" style="fill:var(--wood)"/><path d="M228 6 q32 -16 64 0 v6 q-32 -14 -64 0z" style="fill:#9CC27E"/><circle cx="240" cy="8" r="3" style="fill:#EFA3A6"/><circle cx="280" cy="8" r="3" style="fill:#EFA3A6"/><circle cx="260" cy="2" r="3" style="fill:#F3C969"/>`,
      `<rect x="232" y="0" width="6" height="40"/><rect x="282" y="0" width="6" height="40"/><path d="M228 6 q32 -16 64 0 v6 q-32 -14 -64 0z"/>`)}
    ${tapeLabel(260, 58, "The orchard", "var(--sage)", 10)}</g>`;
  // the wooden five-bar gate east to the green, and a stile west to Lighthouse Point
  const east = `<g data-place="toGreenS" aria-label="Gate to the green"><ellipse class="hov" cx="498" cy="330" rx="26" ry="20" style="fill:var(--butter)"/>
    ${sk(`<rect x="484" y="296" width="6" height="44" style="fill:var(--wood)"/><rect x="510" y="296" width="6" height="44" style="fill:var(--wood)"/><rect x="490" y="306" width="20" height="26" style="fill:#C9A27E" opacity=".35"/>`,
      `<rect x="484" y="296" width="6" height="44"/><rect x="510" y="296" width="6" height="44"/><path d="M490 308 h20 M490 316 h20 M490 324 h20 M490 332 l20 -24"/>`)}
    ${tapeLabel(470, 362, "The green", "var(--peri)", 10)}</g>`;
  const west = `<g data-place="toLightS" aria-label="Path to Lighthouse Point"><ellipse class="hov" cx="22" cy="330" rx="26" ry="20" style="fill:var(--butter)"/>
    ${sk(`<rect x="4" y="298" width="6" height="42" style="fill:var(--wood)"/><rect x="34" y="298" width="6" height="42" style="fill:var(--wood)"/><rect x="2" y="322" width="40" height="5" style="fill:#B98A5A"/><rect x="10" y="306" width="24" height="4" style="fill:#B98A5A"/>`,
      `<rect x="4" y="298" width="6" height="42"/><rect x="34" y="298" width="6" height="42"/><rect x="2" y="322" width="40" height="5"/><path d="M10 308 h24"/>`)}
    ${tapeLabel(60, 362, "Lighthouse Point", "var(--sky)", 10)}</g>`;
  // the stable block: timber walls, a long shingle roof, a clock cupola with a weathervane, three half-doors
  const doors = [250, 320, 390];
  const stable = `<g data-place="sstable" aria-label="The stable block"><ellipse class="hov" cx="320" cy="238" rx="120" ry="11" style="fill:var(--butter)"/>
    ${sk(`<path d="M194 152 L216 116 H424 L446 152z" style="fill:#7E8F6A"/><rect x="202" y="150" width="236" height="80" style="fill:#C9A27E"/>
      <rect x="306" y="92" width="28" height="26" style="fill:#FFF6E8"/><path d="M300 94 L320 74 L340 94z" style="fill:#7E8F6A"/><circle cx="320" cy="105" r="8" style="fill:#FFFDF6"/>
      ${doors.map(d => `<rect x="${d - 18}" y="168" width="36" height="62" style="fill:#3E3430"/><rect x="${d - 18}" y="196" width="36" height="34" style="fill:#8E5A3C"/>`).join("")}
      <rect x="214" y="168" width="10" height="14" style="fill:#F3C969"/>`,
      `<path d="M194 152 L216 116 H424 L446 152z"/><path d="M208 140 H432 M214 128 H426" opacity=".35"/><rect x="202" y="150" width="236" height="80"/>
      <rect x="306" y="92" width="28" height="26"/><path d="M300 94 L320 74 L340 94z M320 74 V58 M312 62 H328 M320 105 v-5 M320 105 l4 2"/><path d="M314 56 l6 -4 l8 4 l-8 2z" style="fill:var(--line)"/><circle cx="320" cy="105" r="8"/>
      ${doors.map(d => `<rect x="${d - 18}" y="168" width="36" height="62"/><rect x="${d - 18}" y="196" width="36" height="34"/><path d="M${d - 18} 196 l36 34 M${d + 18} 196 l-36 34" opacity=".45"/>`).join("")}
      <path d="M204 162 H436 M204 214 H232 M408 214 H436" opacity=".3"/>`)}
    ${ponyHead(250, "#B8693E", "#6B3A22", true)}${ponyHead(390, "#4A3A30", "#2E2420", false)}
    ${tapeLabel(320, 262, "Stables", "var(--peach)", 10)}</g>`;
  // the tack room: a little stone hut with a timber gable, saddles on a rail by the door
  const saddle = (x, col) => `<path d="M${x - 12} 204 q12 -10 24 0 l-2 10 h-20z" style="fill:${col}"/><path d="M${x - 2} 214 v10" style="stroke:#8A6A52" stroke-width="1.4"/><rect x="${x - 4}" y="222" width="5" height="4" style="fill:#C9C2B6"/>`;
  const tack = `<g data-place="stack" aria-label="The tack room"><ellipse class="hov" cx="110" cy="236" rx="56" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M72 160 L110 128 L148 160z" style="fill:#B5443A"/><rect x="76" y="158" width="68" height="70" style="fill:#D8D0C2"/><rect x="98" y="186" width="24" height="42" rx="2" style="fill:var(--wood)"/><rect x="82" y="168" width="14" height="12" style="fill:var(--sky)"/>
      <rect x="20" y="198" width="44" height="4" style="fill:#8A6A52"/>${saddle(31, "#8E5A3C")}${saddle(53, "#5E3E2C")}<path d="M104 140 h12 v10 h-12z" style="fill:#F6EEE4"/>`,
      `<path d="M72 160 L110 128 L148 160z"/><rect x="76" y="158" width="68" height="70"/><path d="M80 176 h6 M126 172 h10 M130 200 h10 M82 210 h12 M128 216 h8" opacity=".4"/><rect x="98" y="186" width="24" height="42" rx="2"/><circle cx="117" cy="208" r="1.3"/>
      <rect x="82" y="168" width="14" height="12"/><path d="M89 168 v12"/><rect x="20" y="198" width="44" height="4"/><path d="M22 202 v26 M62 202 v26"/><path d="M110 140 q-4 4 0 8 q4 -4 0 -8" opacity=".6"/>`)}
    ${tapeLabel(110, 254, "Tack room", "var(--rose)", 10)}</g>`;
  // the paddock: post-and-rail all round, a gate in the west side, two ponies grazing, a trough and a hay rack
  const paddock = `<g data-place="spaddock" aria-label="The paddock"><ellipse class="hov" cx="220" cy="420" rx="22" ry="16" style="fill:var(--butter)"/>
    ${sk(`<rect x="230" y="380" width="270" height="220" rx="6" style="fill:#B9D98A" opacity=".45"/>`, "")}
    ${rail(230, 388, 500, 388)}${rail(500, 388, 500, 600)}${rail(230, 600, 500, 600)}${rail(230, 388, 230, 404)}${rail(230, 440, 230, 600)}
    ${sk(`<path d="M232 404 l-26 -8 M232 412 l-26 -8 M232 420 l-26 -8" style="stroke:#B98A5A" stroke-width="3"/>`, `<path d="M232 396 V424 M206 388 V416"/>`)}
    ${sk(`<rect x="420" y="410" width="54" height="16" rx="3" style="fill:#9AA9B8"/><rect x="424" y="412" width="46" height="5" style="fill:#9FD3E8"/>
      <rect x="268" y="540" width="40" height="30" style="fill:#E8C77A"/><path d="M262 538 h52 l-6 -18 h-40z" style="fill:#B98A5A"/>`,
      `<rect x="420" y="410" width="54" height="16" rx="3"/><path d="M426 426 v6 M468 426 v6"/><path d="M262 538 h52 l-6 -18 h-40z M272 538 v-18 M282 538 v-18 M292 538 v-18 M302 538 v-18"/><rect x="268" y="540" width="40" height="30"/><path d="M272 548 q8 -4 14 2 q8 -4 16 0" opacity=".5"/>`)}
    ${pony(330, 470, "#B8693E", "#6B3A22", false, true, false)}${pony(420, 540, "#C9C6C0", "#8C8780", true, false, true)}
    ${tapeLabel(365, 616, "Paddock", "var(--butter)", 10)}</g>`;
  // the pony-ride ring: soft sand inside a low rail, a mounting block and a red and white striped pole
  const ride = `<g data-place="sride" aria-label="Pony rides"><ellipse class="hov" cx="110" cy="570" rx="34" ry="10" style="fill:var(--butter)"/>
    ${sk(`<ellipse cx="110" cy="500" rx="78" ry="48" style="fill:#EFD9A8"/><ellipse cx="110" cy="500" rx="78" ry="48" fill="none" style="stroke:#B98A5A" stroke-width="3"/>
      <rect x="42" y="492" width="20" height="10" style="fill:#BDB3A4"/><rect x="48" y="484" width="14" height="8" style="fill:#CFC6B8"/>
      <rect x="96" y="490" width="4" height="22" style="fill:#FFFDF6"/><rect x="144" y="490" width="4" height="22" style="fill:#FFFDF6"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${100 + i*7.4}" y="497" width="7.4" height="4" style="fill:${i % 2 ? "#FFFDF6" : "#D9574F"}"/>`).join("")}`,
      `<ellipse cx="110" cy="500" rx="78" ry="48"/><rect x="42" y="492" width="20" height="10"/><rect x="48" y="484" width="14" height="8"/><rect x="96" y="490" width="4" height="22"/><rect x="144" y="490" width="4" height="22"/><rect x="100" y="497" width="44" height="4"/>
      ${[[110, 452], [160, 462], [182, 500], [160, 538], [60, 538], [38, 500], [60, 462]].map(([a, b]) => `<path d="M${a} ${b - 5} v10"/>`).join("")}`)}
    ${tapeLabel(110, 594, "Pony rides", "var(--sky)", 10)}</g>`;
  // charm: a stack of hay bales by the stable, and a wheelbarrow of straw by the west path
  const bits = sk(`<rect x="156" y="208" width="20" height="14" rx="2" style="fill:#E8C77A"/><rect x="176" y="208" width="20" height="14" rx="2" style="fill:#E3BF6E"/><rect x="166" y="194" width="20" height="14" rx="2" style="fill:#EDD08A"/>
    <path d="M58 392 h34 l-6 14 h-24z" style="fill:#8EA3B5"/><path d="M60 390 q14 -8 30 0" style="fill:#EDD08A"/><circle cx="64" cy="410" r="5" style="fill:#4A3A30"/>`,
    `<rect x="156" y="208" width="20" height="14" rx="2"/><rect x="176" y="208" width="20" height="14" rx="2"/><rect x="166" y="194" width="20" height="14" rx="2"/><path d="M162 215 h10 M182 215 h10 M172 201 h10" opacity=".5"/>
    <path d="M58 392 h34 l-6 14 h-24z M92 392 l12 -4 M86 406 l4 10"/><circle cx="64" cy="410" r="5"/>`);
  // round 266: the paddock sits 26 higher so its bottom fence stays on the sand, clear of the sea
  return ground + southShore() + north + bits + tack + stable + `<g transform="translate(0 -26)">${paddock}</g>` + east + west + ride;
}
