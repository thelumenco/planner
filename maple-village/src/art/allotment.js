// The allotments (round 277, Mel: "Allotment should have its own internal screen where I can see each neighbour's
// plot. The crate would be in there"): through the gate by the potting shed on Honeybrook Green. Six plots, two by
// three either side of a grass path, each with its holder's name on a little sign; the potting shed and water butt,
// a bench, and the swap crate by the gate. Tap a plot to hear about it; the gate at the bottom goes back to the green.
import { sk, tapeLabel, flowers } from "./scenes.js";

export const PLOTS = {
  gonggong: {n: "Gong Gong", x: 60, y: 170, col: "var(--sage)"},
  mei: {n: "Mei", x: 290, y: 170, col: "var(--peach)"},
  theo: {n: "Theo", x: 60, y: 290, col: "var(--sky)"},
  juniper: {n: "Juniper", x: 290, y: 290, col: "var(--blush)"},
  bo: {n: "Bo", x: 60, y: 410, col: "var(--butter)"},
  felix: {n: "Felix", x: 290, y: 410, col: "var(--peri)"}
};
const PW = 170, PH = 90;
const leaf = (x, y, c = "#7FA36E") => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" style="fill:${c}" transform="rotate(-25 ${x} ${y})"/><ellipse cx="${x + 6}" cy="${y + 1}" rx="7" ry="4" style="fill:${c}" transform="rotate(25 ${x + 6} ${y + 1})"/>`;
const cane = (x, y) => `<path d="M${x - 8} ${y} L${x} ${y - 40} L${x + 8} ${y}" fill="none" style="stroke:#B98A5A" stroke-width="2"/>`;
// what grows on each plot
const CROPS = {
  gonggong: (x, y) => [0, 1, 2, 3].map(i => leaf(x + 20 + i*36, y + 30, "#8FBF6A")).join("") + [0, 1, 2].map(i => cane(x + 40 + i*44, y + 80) + `<circle cx="${x + 38 + i*44}" cy="${y + 62}" r="3" style="fill:#E8566C"/><circle cx="${x + 44 + i*44}" cy="${y + 54}" r="3" style="fill:#E8566C"/>`).join(""),
  mei: (x, y) => [0, 1, 2].map(i => cane(x + 34 + i*50, y + 70) + `<circle cx="${x + 30 + i*50}" cy="${y + 50}" r="5" style="fill:#E8566C"/><circle cx="${x + 38 + i*50}" cy="${y + 58}" r="5" style="fill:#F2A65A"/>`).join("") + [0, 1, 2, 3].map(i => leaf(x + 22 + i*38, y + 80, "#9CC27E")).join(""),
  theo: (x, y) => `<ellipse cx="${x + 92}" cy="${y + 56}" rx="40" ry="26" style="fill:#F2A65A"/><path d="M${x + 72} ${y + 34} q20 20 0 44 M${x + 112} ${y + 34} q-20 20 0 44 M${x + 92} ${y + 30} v52" fill="none" style="stroke:#C9752E" stroke-width="1.4"/><path d="M${x + 92} ${y + 30} q4 -8 10 -10" fill="none" style="stroke:#6B8A4E" stroke-width="3"/>` + leaf(x + 30, y + 40, "#7FA36E") + leaf(x + 150, y + 70, "#7FA36E"),
  juniper: (x, y) => [0, 1, 2, 3, 4, 5].map(i => cane(x + 22 + i*26, y + 80) + `<circle cx="${x + 20 + i*26}" cy="${y + 50}" r="4" style="fill:${["#EFA3A6", "#C3CDEE", "#F4C7CF", "#B9A6E0", "#FFFDF6", "#EFA3A6"][i]}"/>`).join(""),
  bo: (x, y) => `<rect x="${x + 12}" y="${y + 20}" width="${PW - 24}" height="${PH - 30}" rx="4" fill="#FFFDF6" opacity=".35"/>` + [0, 1, 2, 3, 4].map(i => leaf(x + 22 + i*30, y + 50, "#7FA36E") + `<circle cx="${x + 28 + i*30}" cy="${y + 62}" r="3.4" style="fill:#E8566C"/>`).join(""),
  felix: (x, y) => [0, 1, 2].map(i => cane(x + 30 + i*36, y + 80) + `<circle cx="${x + 28 + i*36}" cy="${y + 52}" r="3" style="fill:#E8566C"/>`).join("") + `<rect x="${x + 128}" y="${y + 24}" width="28" height="36" rx="2" style="fill:#C9A27E"/><path d="M${x + 124} ${y + 26} l18 -12 l18 12z" style="fill:#A8754F"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${x + 135 + c*7}" cy="${y + 33 + r*9}" r="2.2" style="fill:#5E4636"/>`).join("")).join("")}`
};
export function allotmentArt(){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="320" rx="240" ry="260" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><rect x="236" y="150" width="48" height="490" style="fill:#CFE0B4"/><path d="M236 150 v490 M284 150 v490" fill="none" style="stroke:#A9C98A" stroke-width="2" stroke-dasharray="2 6"/></g>
    <g filter="url(#wob)" fill="none" style="stroke:#B98A5A" stroke-width="2.2"><path d="M20 140 H500 M20 140 V600 M500 140 V600"/>${[60, 120, 180, 240, 300, 360, 420, 480].map(x => `<path d="M${x} 132 v16"/>`).join("")}</g>
    ${flowers([[30, 160, "#EFA3A6"], [490, 170, "#F3C969"], [30, 520, "#C3CDEE"], [490, 520, "#EFA3A6"], [250, 140, "#F3C969"]])}`;
  const plots = Object.entries(PLOTS).map(([id, p]) => `<g data-aspot="${id}" data-x="${p.x + (p.x < 200 ? PW + 10 : -10)}" data-y="${p.y + PH - 10}" aria-label="${p.n}'s plot">
      <rect x="${p.x - 4}" y="${p.y - 4}" width="${PW + 8}" height="${PH + 8}" rx="6" class="hov" style="fill:var(--butter)"/>
      ${sk(`<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}" rx="4" style="fill:#8A6A4E"/><rect x="${p.x + 6}" y="${p.y + 6}" width="${PW - 12}" height="${PH - 12}" rx="3" style="fill:#7A5A40"/>`, `<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}" rx="4"/>`)}
      <g filter="url(#wob)" style="stroke:var(--line)" stroke-width=".8">${CROPS[id](p.x, p.y)}</g>
      ${tapeLabel(p.x + PW/2, p.y - 6, p.n, p.col, 9.5)}</g>`).join("");
  const shed = sk(`<rect x="40" y="530" width="76" height="56" style="fill:#9CB98A"/><path d="M34 532 L78 504 L122 532z" style="fill:#7A5A40"/><rect x="66" y="550" width="22" height="36" style="fill:#7A5A40"/><rect class="wglow" x="94" y="544" width="16" height="12" style="fill:#DCE8F0"/><ellipse cx="140" cy="572" rx="12" ry="5" style="fill:#3E6B8C"/><rect x="128" y="548" width="24" height="24" rx="3" style="fill:#3E6B8C"/>`,
    `<rect x="40" y="530" width="76" height="56"/><path d="M34 532 L78 504 L122 532z"/><rect x="66" y="550" width="22" height="36"/><rect x="94" y="544" width="16" height="12"/><rect x="128" y="548" width="24" height="24" rx="3"/>`);
  const crate = `<g data-aspot="crate" data-x="380" data-y="566" aria-label="The swap crate"><ellipse class="hov" cx="380" cy="572" rx="40" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="350" y="534" width="60" height="32" rx="2" style="fill:#C9A27E"/><circle cx="364" cy="534" r="6" style="fill:#F2A65A"/><circle cx="380" cy="532" r="6" style="fill:#9CC27E"/><circle cx="394" cy="534" r="6" style="fill:#E8566C"/>`, `<rect x="350" y="534" width="60" height="32" rx="2"/><path d="M350 550 h60" opacity=".5"/>`)}
    ${tapeLabel(380, 520, "Swap crate", "var(--butter)", 9.5)}</g>`;
  const bench = sk(`<rect x="430" y="574" width="54" height="7" rx="2" style="fill:#A8754F"/><rect x="430" y="562" width="54" height="7" rx="2" style="fill:#B98A5A"/>`, `<rect x="430" y="574" width="54" height="7" rx="2"/><rect x="430" y="562" width="54" height="7" rx="2"/><path d="M436 581 v10 M478 581 v10"/>`);
  const gate = `<g data-exit="green" aria-label="Back to the green"><ellipse class="hov" cx="260" cy="620" rx="40" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="226" y="600" width="68" height="16" rx="2" style="fill:var(--wood)"/>`, `<rect x="226" y="600" width="68" height="16" rx="2"/><path d="M240 600 v16 M254 600 v16 M268 600 v16 M282 600 v16"/>`)}
    ${tapeLabel(260, 590, "The green", "var(--sage)", 10)}</g>`;
  return ground + plots + shed + crate + bench + gate;
}
