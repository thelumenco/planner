// Honeybrook Farm (Felix and Elena's): a new outdoor screen east of the bay, above the field. The top strip (y < 120)
// is kept clear for the railway line and Honeybrook, the brook that runs west under it to the sea (the cottage lane
// and Honeybrook station come next, through the east gate). The farmhouse, the beehives in their lavender and the red
// barn along the top; the cow paddock and the goat paddock below; the farm stand by the west gate from the bay.
import { ink } from "../util.js";
import { sk, tapeLabel, tree, flowers, house, artCtx } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";
import { archGate } from "./orchard.js";
import { hfState, COWS, GOATS, hiveFill, HIVE_SPOTS } from "../game/hfarm.js";

const W = ink;
// the shared post-and-rail fence (it carries on along the cottage lane, at the same height)
const rail = (x1, x2, y) => sk(`<path d="M${x1} ${y-10} H${x2} M${x1} ${y-2} H${x2}" style="stroke:#B98A5A" stroke-width="3"/>${Array.from({length: Math.floor((x2 - x1)/28) + 1}, (_, i) => `<rect x="${x1 + i*28 - 2}" y="${y-16}" width="4" height="18" style="fill:#8A6A52"/>`).join("")}`,
  `<path d="M${x1} ${y-10} H${x2} M${x1} ${y-2} H${x2}"/>`);
const paddock = (x1, y1, x2, y2) => sk(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="6" style="fill:#B9D98A" opacity=".55"/>`, "") + rail(x1, x2, y1 + 8) + rail(x1, x2, y2)
  + sk(`<path d="M${x1} ${y1} V${y2} M${x2} ${y1} V${y2}" style="stroke:#B98A5A" stroke-width="3"/>`, `<path d="M${x1} ${y1} V${y2} M${x2} ${y1} V${y2}"/>`);

// a cow: patches in its own colours, a gentle graze (head down, up) on a slow loop
export function cowArt(x, y, c, k = 0, flip = false){
  const body = `<ellipse cx="0" cy="0" rx="20" ry="11" style="fill:${c.col}"/>${c.spots ? `<ellipse cx="-6" cy="-3" rx="6" ry="4" style="fill:${c.spots}"/><ellipse cx="8" cy="3" rx="4" ry="3" style="fill:${c.spots}"/>` : ""}
    <rect x="-15" y="8" width="4" height="10" style="fill:${c.col}"/><rect x="10" y="8" width="4" height="10" style="fill:${c.col}"/><ellipse cx="-2" cy="9" rx="4" ry="2.5" style="fill:#F4C7CF"/>`;
  const head = `<g><ellipse cx="22" cy="-6" rx="7" ry="6" style="fill:${c.col}"/><ellipse cx="26" cy="-3" rx="4" ry="3" style="fill:#F4C7CF"/><path d="M18 -12 l-3 -4 M24 -12 l2 -4" style="stroke:#E8D3BC" stroke-width="2"/><circle cx="21" cy="-8" r="1" style="fill:#3A2E28"/>
    <animateTransform attributeName="transform" type="rotate" values="0 16 -4; 0 16 -4; 24 16 -4; 24 16 -4; 0 16 -4" dur="${9 + k*2}s" begin="${k*1.3}s" repeatCount="indefinite"/></g>`;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)" ${W} stroke-width="1.1">${body}${head}</g>`;
}
// a goat: small, a beard, curved horns, and a hop now and then
export function goatArt(x, y, g, k = 0, flip = false){
  return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)" ${W} stroke-width="1"><g>
    <ellipse cx="0" cy="0" rx="12" ry="7" style="fill:${g.col}"/><rect x="-9" y="5" width="3" height="8" style="fill:${g.col}"/><rect x="6" y="5" width="3" height="8" style="fill:${g.col}"/>
    <ellipse cx="13" cy="-7" rx="5" ry="4" style="fill:${g.col}"/><path d="M11 -10 q-1 -6 -5 -6 M14 -10 q0 -6 -3 -7" style="fill:none;stroke:#8A6A52" stroke-width="1.6"/><path d="M15 -4 l1 4 l-2 0z" style="fill:#E8D3BC"/><circle cx="14" cy="-8" r=".9" style="fill:#3A2E28"/><path d="M-12 -2 l-4 -4" />
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 0; 0 -6; 0 0; 0 0" keyTimes="0; .8; .85; .9; 1" dur="${6 + k}s" begin="${k*.9}s" repeatCount="indefinite"/></g></g>`;
}
// a painted beehive: three boxes and a lid, bees dotting about when it's busy
const hive = (x, y, col, f, k) => `<g ${W} stroke-width="1.1"><rect x="${x-11}" y="${y-28}" width="22" height="9" style="fill:${col}"/><rect x="${x-11}" y="${y-19}" width="22" height="9" style="fill:${col}"/><rect x="${x-11}" y="${y-10}" width="22" height="10" style="fill:${col}"/>
  <path d="M${x-14} ${y-28} h28 l-3 -6 h-22z" style="fill:#F6EEE4"/><rect x="${x-4}" y="${y-3}" width="8" height="2" style="fill:#3A2E28"/>
  ${f >= 1 ? `<rect x="${x-3}" y="${y-44}" width="6" height="6" rx="1" style="fill:#F3C33A"/>` : ""}</g>
  ${[0, 1, 2].map(i => `<circle r="1.5" style="fill:#3A2E28"><animateMotion dur="${3 + i + k*.3}s" repeatCount="indefinite" path="M${x} ${y-14} q${8 + i*4} -${10 + i*3} ${16 - i*6} -${4 + i} t-${12} ${8}"/></circle>`).join("")}`;
const HIVE_COLS = ["#F3C969", "#9FD3C2", "#F4C7CF", "#C3CDEE", "#F6EEE4"];

export function hfarmArt(){
  const st = hfState(artCtx().F());
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="60" rx="300" ry="70" style="fill:var(--grass2)"/><ellipse cx="130" cy="520" rx="120" ry="50" style="fill:var(--grass2)"/><ellipse cx="420" cy="600" rx="110" ry="40" style="fill:var(--grass2)"/></g>
    ${tree(30, 64, .7)}${tree(486, 70, .75)}
    <g filter="url(#wob)"><path d="M0 560 H520 M260 560 V262 M260 270 C200 270 120 262 105 246 M260 270 C330 270 380 262 400 246 M130 560 V580" fill="none" style="stroke:var(--path)" stroke-width="18" stroke-linecap="round"/></g>
    ${rail(0, 520, 122)}
    ${flowers([[60, 290, "#EFA3A6"], [470, 290, "#F3C969"], [200, 520, "#C3CDEE"], [330, 610, "#EFA3A6"], [40, 610, "#F3C969"]])}`;
  const farmhouse = house("farmhouse", 40, 168, 130, 70, "#FFF6E8", "#B5443A", "The farmhouse", "var(--blush)",
    {art: `<rect x="54" y="214" width="20" height="10" rx="2" style="fill:#9CC27E"/><circle cx="60" cy="212" r="3" style="fill:#E8566C"/><circle cx="68" cy="211" r="3" style="fill:#F3C969"/><rect x="146" y="130" width="10" height="22" style="fill:#B5443A"/>`,
      lines: `<rect x="54" y="214" width="20" height="10" rx="2"/><rect x="146" y="130" width="10" height="22"/><path class="smoke" d="M151 126 q-6 -8 0 -16 q6 -8 0 -16" opacity=".55"/>`});
  // the red barn: a gambrel roof, big double doors with the white cross, a hay door up top
  const barn = `<g data-place="barn" aria-label="The barn"><ellipse class="hov" cx="400" cy="246" rx="80" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M330 172 L344 130 L400 108 L456 130 L470 172z" style="fill:#8E2C2C"/><rect x="334" y="170" width="132" height="72" style="fill:#B5443A"/>
      <rect x="376" y="194" width="48" height="48" style="fill:#8E2C2C"/><path d="M376 194 l48 48 M424 194 l-48 48 M400 194 v48" style="stroke:#FFFDF6" stroke-width="3"/><rect x="388" y="138" width="24" height="20" style="fill:#F3C969"/>
      <path d="M392 146 h16 M392 152 h16" style="stroke:#C9A23A" stroke-width="2"/>`,
      `<path d="M330 172 L344 130 L400 108 L456 130 L470 172z"/><rect x="334" y="170" width="132" height="72"/><rect x="376" y="194" width="48" height="48"/><rect x="388" y="138" width="24" height="20"/>`)}
    ${tapeLabel(400, 266, "The barn", "#F2A0A0", 11)}</g>`;
  // the hives, in a bed of lavender between the house and the barn
  const lav = Array.from({length: 18}, (_, i) => { const x = 196 + (i % 6)*22, y = 166 + Math.floor(i/6)*30; return `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" style="fill:#9C8CD9" opacity=".85"/><path d="M${x-4} ${y-2} v-6 M${x} ${y-3} v-8 M${x+4} ${y-2} v-6" style="stroke:#7D6BC0" stroke-width="1.6"/>`; }).join("");
  const hives = `<g data-place="hives" aria-label="The beehives"><ellipse class="hov" cx="250" cy="246" rx="66" ry="12" style="fill:var(--butter)"/>
    <g filter="url(#wob)">${lav}</g>${HIVE_SPOTS.map(([x, y], i) => hive(x, y, HIVE_COLS[i], hiveFill(st, i), i)).join("")}
    ${tapeLabel(250, 266, "Beehives", "#F3E1A0", 11)}</g>`;
  // the paddocks, the animals, a trough, and a cable spool for the goats to climb
  const cows = `<g data-place="cows" aria-label="The cow paddock"><ellipse class="hov" cx="135" cy="480" rx="90" ry="10" style="fill:var(--butter)"/>${paddock(30, 300, 240, 466)}
    ${sk(`<rect x="182" y="440" width="44" height="14" rx="3" style="fill:#9AA9B8"/><rect x="185" y="442" width="38" height="5" style="fill:#9FD3E8"/>`, `<rect x="182" y="440" width="44" height="14" rx="3"/>`)}
    ${cowArt(84, 352, COWS[0], 0)}${cowArt(160, 410, COWS[1], 1, true)}${cowArt(196, 344, COWS[2], 2, true)}${tapeLabel(135, 492, "Cows", "#F3E7C9", 11)}</g>`;
  const goats = `<g data-place="goats" aria-label="The goat paddock"><ellipse class="hov" cx="385" cy="480" rx="90" ry="10" style="fill:var(--butter)"/>${paddock(280, 300, 490, 466)}
    ${sk(`<ellipse cx="440" cy="392" rx="26" ry="9" style="fill:#B98A5A"/><rect x="420" y="364" width="40" height="28" style="fill:#C9A27E"/><ellipse cx="440" cy="364" rx="26" ry="9" style="fill:#D9B48A"/><path d="M300 440 l30 -26 l30 26" style="fill:none;stroke:#8A6A52" stroke-width="4"/>`,
      `<ellipse cx="440" cy="364" rx="26" ry="9"/><path d="M414 364 v28 M466 364 v28"/><path d="M300 440 l30 -26 l30 26"/>`)}
    ${goatArt(440, 350, GOATS[0], 0)}${goatArt(328, 404, GOATS[1], 1)}${goatArt(372, 344, GOATS[2], 2, true)}${goatArt(400, 430, GOATS[3], 3, true)}${tapeLabel(385, 492, "Goats", "#E3EED2", 11)}</g>`;
  // the farm stand: a little striped awning over crates of milk bottles, honey jars and eggs, an honesty tin
  const stand = `<g data-place="fstand" aria-label="Farm stand"><ellipse class="hov" cx="130" cy="560" rx="40" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="100" y="530" width="60" height="24" rx="2" style="fill:#C9A27E"/><path d="M94 530 h72 l-6 -16 h-60z" style="fill:#FFFDF6"/>${[0, 1, 2, 3].map(i => `<path d="M${100 + i*16} 514 h8 l1 16 h-10z" style="fill:#B5443A"/>`).join("")}
      ${[106, 112, 118].map(x => `<rect x="${x}" y="522" width="4" height="9" rx="1" style="fill:#FFFDF6"/>`).join("")}${[128, 136].map(x => `<rect x="${x}" y="523" width="6" height="7" rx="1" style="fill:#F3C33A"/>`).join("")}<ellipse cx="150" cy="527" rx="4" ry="3" style="fill:#F6EBDD"/><ellipse cx="155" cy="528" rx="4" ry="3" style="fill:#E8D3BC"/>`,
      `<rect x="100" y="530" width="60" height="24" rx="2"/><path d="M94 530 h72 l-6 -16 h-60z"/>`)}
    ${tapeLabel(130, 584, "Farm stand", "#F4C7CF", 10)}</g>`;
  const sign = sk(`<rect x="330" y="574" width="60" height="22" rx="2" style="fill:#FFF6E8"/><path d="M338 596 v12 M382 596 v12" stroke-width="3"/>`, `<rect x="330" y="574" width="60" height="22" rx="2"/>`)
    + `<text x="360" y="588" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="7.4" fill="#8E2C2C" pointer-events="none">Honeybrook Farm</text>`;
  return lampDefs + ground + farmhouse + hives + barn + cows + goats + stand + sign
    + archGate("toBayF", 22, 560, "The bay", 40, 516, "var(--sky)", "Gate west to the bay")
    + archGate("hfEast", 498, 560, "Cottages", 476, 516, "var(--butter)", "The lane east to the cottages")
    + streetLamp(300, 540);
}
