// The cottage lane and Honeybrook station: east of Wildflower Farm, above the town square, at the foot of the hill.
// Along the top, the railway and the Honeybrook (game/rail.js, art/railway.js), with the station platform between
// them and a footbridge down to the lane. Four cottages (Honeysuckle: Mateo and Lila; Clover: Noor; Bluebell and Fig
// Tree: holiday lets), the windmill turning slowly up the slope, a hen house, a hive, and a spot for a campervan.
// The farm's fence carries on along y 122; the trees thicken towards the east edge (the woods come next).
import { ink } from "../util.js";
import { sk, tapeLabel, tree, flowers, house } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";
import { archGate } from "./orchard.js";
import { track, brook, trainLayer, RAIL_Y } from "./railway.js";
import { artCtx } from "./scenes.js";
import { STYLES } from "../game/van.js";
import { bikeRack } from "./transport.js";

const W = ink;
const rail = (x1, x2, y) => sk(`<path d="M${x1} ${y-10} H${x2} M${x1} ${y-2} H${x2}" style="stroke:#B98A5A" stroke-width="3"/>${Array.from({length: Math.floor((x2 - x1)/28) + 1}, (_, i) => `<rect x="${x1 + i*28 - 2}" y="${y-16}" width="4" height="18" style="fill:#8A6A52"/>`).join("")}`,
  `<path d="M${x1} ${y-10} H${x2} M${x1} ${y-2} H${x2}"/>`);

// the windmill: a white tower, a red cap, four sails turning slowly
export const windmill = (x, y) => `<g pointer-events="none">${sk(`<path d="M${x-18} ${y} L${x-11} ${y-88} H${x+11} L${x+18} ${y}z" style="fill:#F6F1E8"/><path d="M${x-14} ${y-88} q14 -16 28 0z" style="fill:#B5443A"/><rect x="${x-5}" y="${y-22}" width="10" height="22" rx="4" style="fill:#8A6A52"/><rect x="${x-4}" y="${y-60}" width="8" height="9" rx="1" style="fill:#CFE0EE"/>`,
    `<path d="M${x-18} ${y} L${x-11} ${y-88} H${x+11} L${x+18} ${y}z M${x-14} ${y-88} q14 -16 28 0z"/><rect x="${x-5}" y="${y-22}" width="10" height="22" rx="4"/>`)}
  <g><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1">${[0, 90, 180, 270].map(a => `<g transform="rotate(${a} ${x} ${y-94})"><rect x="${x-2}" y="${y-144}" width="4" height="50" style="fill:#8A6A52"/><rect x="${x+2}" y="${y-140}" width="12" height="40" style="fill:#FFFDF6"/><path d="M${x+2} ${y-130} h12 M${x+2} ${y-120} h12 M${x+2} ${y-110} h12" opacity=".5"/></g>`).join("")}<circle cx="${x}" cy="${y-94}" r="4" style="fill:#B5443A"/></g>
    <animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y-94}" to="360 ${x} ${y-94}" dur="28s" repeatCount="indefinite"/></g></g>`;
const hens = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x-20}" y="${y-22}" width="34" height="22" style="fill:#C9A27E"/><path d="M${x-24} ${y-22} L${x-3} ${y-36} L${x+18} ${y-22}z" style="fill:#B5443A"/><rect x="${x-8}" y="${y-12}" width="10" height="12" rx="4" style="fill:#6B4430"/>`,
    `<rect x="${x-20}" y="${y-22}" width="34" height="22"/><path d="M${x-24} ${y-22} L${x-3} ${y-36} L${x+18} ${y-22}z"/>`)}
  ${[[x + 26, y - 2], [x + 38, y + 8], [x + 18, y + 12]].map(([hx, hy], i) => `<g ${W} stroke-width=".9"><ellipse cx="${hx}" cy="${hy}" rx="6" ry="4.5" style="fill:${["#FFFDF6", "#C98A4A", "#FFFDF6"][i]}"/><circle cx="${hx + 5}" cy="${hy - 4}" r="2.6" style="fill:${["#FFFDF6", "#C98A4A", "#FFFDF6"][i]}"/><path d="M${hx + 5} ${hy - 7} l1 -2" style="stroke:#D9433A" stroke-width="1.6"/><animateTransform attributeName="transform" type="translate" values="0 0; 0 0; 0 2; 0 0" dur="${3 + i}s" repeatCount="indefinite"/></g>`).join("")}</g>`;
const hive = (x, y) => sk(`<rect x="${x-9}" y="${y-22}" width="18" height="22" style="fill:#F3C969"/><path d="M${x-11} ${y-22} h22 l-2 -5 h-18z" style="fill:#F6EEE4"/>`, `<rect x="${x-9}" y="${y-22}" width="18" height="22"/><path d="M${x-9} ${y-11} h18"/>`);
const grazer = (x, y, col, k) => `<g ${W} stroke-width="1" pointer-events="none"><ellipse cx="${x}" cy="${y}" rx="10" ry="6" style="fill:${col}"/><circle cx="${x + 10}" cy="${y - 4}" r="4" style="fill:${col === "#FFFDF6" ? "#3A2E28" : col}"/><path d="M${x-6} ${y + 5} v6 M${x + 6} ${y + 5} v6"/><animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -3;0 0" keyTimes="0;.8;.88;1" dur="${7 + k}s" repeatCount="indefinite"/></g>`;

// the campervan, once it's bought (goals.js "van"): cream on top, mint below, a pop-top roof, round headlights, a
// spare wheel on the back; curtains in the windows (and fairy lights, if the van's done up with lights)
const vanOwned = () => { const F = artCtx() && artCtx().F(); return !!(F && F.goals && F.goals.van); };
export function campervan(x, y){
  const F = artCtx().F(), use = (F.van && F.van.use) || {}, st = k => { const m = /^van_\w+?_(\w+)$/.exec(use[k] || ""); return m && STYLES[m[1]]; };
  const cur = st("curtains"), lit = st("lights");
  return `<g data-place="van" aria-label="The campervan"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="56" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M${x-48} ${y-50} q0 -6 6 -6 h62 q6 0 6 6z" style="fill:#F6EBC8"/><rect x="${x-50}" y="${y-50}" width="100" height="22" rx="10" style="fill:#FFFDF6"/><rect x="${x-50}" y="${y-30}" width="100" height="24" rx="6" style="fill:#9FD3C2"/><path d="M${x-50} ${y-30} h100" style="stroke:#FFFDF6" stroke-width="3"/>
      ${[-36, -14, 8].map(dx => `<rect x="${x + dx}" y="${y-46}" width="18" height="13" rx="3" style="fill:${cur ? cur.a : "#CFE0EE"}"/>`).join("")}<rect x="${x + 30}" y="${y-46}" width="16" height="14" rx="4" style="fill:#CFE0EE"/>
      <circle cx="${x + 46}" cy="${y-16}" r="3.4" style="fill:#F3C969"/><circle cx="${x-30}" cy="${y-4}" r="8" style="fill:#3A2E28"/><circle cx="${x + 28}" cy="${y-4}" r="8" style="fill:#3A2E28"/><circle cx="${x-30}" cy="${y-4}" r="3.4" style="fill:#FFFDF6"/><circle cx="${x + 28}" cy="${y-4}" r="3.4" style="fill:#FFFDF6"/><circle cx="${x-52}" cy="${y-22}" r="6" style="fill:#9FD3C2"/>`,
      `<path d="M${x-48} ${y-50} q0 -6 6 -6 h62 q6 0 6 6z"/><rect x="${x-50}" y="${y-50}" width="100" height="44" rx="8"/>${[-36, -14, 8].map(dx => `<rect x="${x + dx}" y="${y-46}" width="18" height="13" rx="3"/>`).join("")}<rect x="${x + 30}" y="${y-46}" width="16" height="14" rx="4"/><path d="M${x-6} ${y-28} v22"/><circle cx="${x-30}" cy="${y-4}" r="8"/><circle cx="${x + 28}" cy="${y-4}" r="8"/>`)}
    ${lit ? `<g pointer-events="none">${Array.from({length: 9}, (_, i) => `<circle class="twinkle" cx="${x-46 + i*11}" cy="${y-52 + Math.sin(i)*2}" r="1.6" fill="${lit.c === "#FFFDF6" ? "#F3C969" : lit.a}" style="animation-delay:${(i*.25).toFixed(2)}s"/>`).join("")}</g>` : ""}
    ${tapeLabel(x, y + 20, "Campervan", "#C3E8DA", 9)}</g>`;
}
export function hlaneArt(){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".75"><ellipse cx="470" cy="300" rx="150" ry="230" style="fill:var(--grass2)"/><ellipse cx="120" cy="560" rx="120" ry="40" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M330 118 C330 190 230 214 230 300 L230 560 M0 560 H440 M230 560 C252 560 280 590 280 640" fill="none" style="stroke:var(--path)" stroke-width="18" stroke-linecap="round"/></g>
    ${flowers([[180, 330, "#EFA3A6"], [200, 520, "#F3C969"], [40, 470, "#C3CDEE"], [300, 500, "#EFA3A6"], [140, 610, "#F3C969"]])}`;
  // along the top: the track, the platform between it and the brook, the footbridge down to the lane
  const top = track(0, 520) + sk(`<rect x="150" y="56" width="330" height="18" style="fill:#D8CFC2"/><path d="M150 56 H480" style="stroke:#F3C969" stroke-width="2"/>`, `<rect x="150" y="56" width="330" height="18"/>`)
    + sk(`<rect x="286" y="18" width="4" height="40" style="fill:#5E8A5A"/><rect x="350" y="18" width="4" height="40" style="fill:#5E8A5A"/><path d="M278 22 h84 l-6 -10 h-72z" style="fill:#5E8A5A"/><rect x="298" y="48" width="44" height="6" rx="2" style="fill:#B98A5A"/>`,
      `<path d="M278 22 h84 l-6 -10 h-72z"/><rect x="298" y="48" width="44" height="6" rx="2"/>`)
    + brook(0, 520) + sk(`<path d="M314 70 h32 v46 h-32z" style="fill:#C9A27E"/><path d="M314 80 h32 M314 92 h32 M314 104 h32" style="stroke:#8A6A52" stroke-width="1.4"/>`, `<path d="M314 70 v46 M346 70 v46"/>`)
    + rail(0, 310, 122) + rail(352, 520, 122)
    + `<g data-place="station" aria-label="Honeybrook station">${sk(`<rect x="182" y="60" width="62" height="14" rx="2" style="fill:#FFFDF6"/><path d="M188 74 v10 M238 74 v10" stroke-width="2.4"/>`, `<rect x="182" y="60" width="62" height="14" rx="2"/>`)}<text x="213" y="70.5" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8.6" fill="#5E8A5A" pointer-events="none">Honeybrook</text></g>`
    + `<g data-place="timetable" aria-label="Timetable board"><ellipse class="hov" cx="420" cy="140" rx="30" ry="8" style="fill:var(--butter)"/>${sk(`<rect x="404" y="54" width="34" height="22" rx="2" style="fill:#3E4A43"/><path d="M408 60 h26 M408 65 h20 M408 70 h24" style="stroke:#F6EBC8" stroke-width="1.4"/>`, `<rect x="404" y="54" width="34" height="22" rx="2"/>`)}${tapeLabel(420, 140, "Timetable", "#E3EED2", 9)}</g>`;
  const trees = [[494, 400, .9], [512, 470, .75], [500, 610, .85], [30, 140, .6], [506, 330, .7]].map(([x, y, s]) => tree(x, y, s)).join("");
  const honeysuckle = house("honeysuckle", 60, 200, 100, 60, "#FFF6E8", "#B5443A", "Honeysuckle", "#F4C7CF",
    {art: `<path d="M60 206 q-8 20 2 40 q-6 10 0 14" style="fill:none;stroke:#7FA35A" stroke-width="3"/>${[[58, 214], [62, 232], [57, 248]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" style="fill:#F3C969"/>`).join("")}`, lines: ""});
  const clover = house("clover", 60, 370, 100, 60, "#F3F7EC", "#B5443A", "Clover", "#C3E8DA",
    {art: `<rect x="70" y="414" width="18" height="10" rx="2" style="fill:#9CC27E"/>${[[74, 412], [82, 411]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" style="fill:#FFFDF6"/>`).join("")}`, lines: `<rect x="70" y="414" width="18" height="10" rx="2"/>`});
  const pen = sk(`<rect x="176" y="398" width="44" height="34" rx="4" style="fill:#F3E1A0" opacity=".8"/><path d="M176 432 h44 M176 420 h44" style="stroke:#B98A5A" stroke-width="2.4"/>`, `<rect x="176" y="398" width="44" height="34" rx="4"/>`)
    + `<g ${W} stroke-width="1" pointer-events="none"><ellipse cx="190" cy="418" rx="6" ry="4" style="fill:#F2A65A"/><circle cx="195" cy="414" r="3.2" style="fill:#F2A65A"/><ellipse cx="208" cy="422" rx="6" ry="4" style="fill:#FFFDF6"/><ellipse cx="210" cy="415" rx="1.6" ry="4" style="fill:#FFFDF6"/></g>`;
  const bluebell = `<g data-place="bluebell" aria-label="Bluebell cottage">${house("bluebellh", 290, 196, 96, 60, "#EEF3FA", "#B5443A", "Bluebell", "#C3CDEE").replace(/data-place="bluebellh"[^>]*>/, ">")}</g>`;
  const figtree = `<g data-place="figtree" aria-label="Fig Tree cottage">${house("figtreeh", 290, 370, 96, 60, "#FFF3E3", "#B5443A", "Fig Tree", "#F3E1A0").replace(/data-place="figtreeh"[^>]*>/, ">")}</g>`
    + `<g ${W} pointer-events="none"><rect x="413" y="398" width="6" height="18" style="fill:var(--wood)"/><circle cx="416" cy="388" r="14" style="fill:#7FA35A"/>${[[410, 386], [421, 392], [414, 380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" style="fill:#8C5A7A"/>`).join("")}</g>`;
  const van = vanOwned() ? campervan(420, 588) : `<g data-place="vanspot" aria-label="Campervan spot"><ellipse class="hov" cx="420" cy="584" rx="48" ry="10" style="fill:var(--butter)"/>${sk(`<rect x="372" y="548" width="96" height="40" rx="6" style="fill:#D8CFC2" opacity=".85"/>`, `<rect x="372" y="548" width="96" height="40" rx="6" stroke-dasharray="4 5"/>`)}${tapeLabel(420, 536, "Campervan spot", "#E3EED2", 9)}</g>`;
  return lampDefs + ground + top + trainLayer("hlane") + trees + honeysuckle + hive(180, 254) + clover + pen + bluebell + figtree + hens(436, 486)
    + `<g data-place="windmill" aria-label="The windmill"><ellipse class="hov" cx="458" cy="344" rx="30" ry="8" style="fill:var(--butter)"/>${windmill(458, 340)}</g>`
    + grazer(470, 372, "#FFFDF6", 0) + grazer(496, 352, "#D9B48A", 1) + grazer(484, 520, "#FFFDF6", 2) + van
    + archGate("toFarmL", 22, 560, "Wildflower Farm", 70, 520, "var(--butter)", "Gate west to Wildflower Farm")
    + archGate("toTownL", 280, 620, "Town square", 336, 600, "var(--peri)", "Down the station road to the town square")
    + archGate("toWoodsL", 498, 176, "Woods", 452, 196, "#C3E8DA", "East through the gate into Honeybrook Woods") + bikeRack("bikesst", 232, 200)
    + streetLamp(250, 150) + streetLamp(250, 470);
}
