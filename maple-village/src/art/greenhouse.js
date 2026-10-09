// The greenhouse (round 109): outside, a little glass house at the back of the garden (in place of the old shed);
// inside, a brick floor, glass walls and roof panes, six raised beds of herbs, a potting bench with terracotta pots,
// a watering can, and the misters overhead.
import { ink } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { iconAt } from "./icons.js";
import { CROPS } from "../data/items.js";

// in the garden (x, y: the middle of its front, at the ground); owned: glass, else the old shed with a sign
export function ghOutside(x, y, owned){
  if (!owned) return `<g data-gh="door" aria-label="The old shed: it could be a greenhouse">${sk(`<rect x="${x - 28}" y="${y - 66}" width="56" height="66" rx="4" style="fill:var(--wood)"/><path d="M${x - 34} ${y - 62} l34 -26 l34 26z" style="fill:var(--sage)"/>`,
    `<rect x="${x - 28}" y="${y - 66}" width="56" height="66" rx="4"/><path d="M${x - 34} ${y - 62} l34 -26 l34 26z"/><path d="M${x - 12} ${y} v-26 h24 v26"/>`)}${tapeLabel(x, y + 16, "Old shed", "#F3E1A0", 10)}</g>`;
  const panes = [-36, -18, 0, 18].map(dx => `<rect x="${x + dx}" y="${y - 58}" width="18" height="58" style="fill:#CFE8F4" opacity=".85"/>`).join("");
  return `<g data-gh="door" aria-label="The greenhouse"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="46" ry="9" style="fill:var(--butter)"/>
    ${sk(`${panes}<path d="M${x - 40} ${y - 58} L${x} ${y - 86} L${x + 40} ${y - 58}z" style="fill:#DCEFF7"/>${[-26, -8, 10, 26].map(dx => `<circle cx="${x + dx}" cy="${y - 14}" r="6" style="fill:#7FB86A"/>`).join("")}<rect x="${x - 9}" y="${y - 34}" width="18" height="34" style="fill:#E7F4EA"/>`,
      `<rect x="${x - 36}" y="${y - 58}" width="72" height="58"/><path d="M${x - 18} ${y - 58} v58 M${x} ${y - 58} v24 M${x + 18} ${y - 58} v58 M${x - 36} ${y - 30} h27 M${x + 9} ${y - 30} h27 M${x - 40} ${y - 58} L${x} ${y - 86} L${x + 40} ${y - 58} M${x - 20} ${y - 72} L${x - 20} ${y - 58} M${x + 20} ${y - 72} L${x + 20} ${y - 58}"/><rect x="${x - 9}" y="${y - 34}" width="18" height="34"/>`)}
    ${tapeLabel(x, y + 16, "Greenhouse", "#C3E8DA", 10)}</g>`;
}

// the beds inside: two rows of three
export const GH_BED_AT = [[90, 250], [215, 250], [340, 250], [90, 420], [215, 420], [340, 420]].map(([x, y]) => ({x, y, w: 100, h: 70}));
const plant = (crop, g, cx, cy) => {
  if (g < .34) return `<path d="M${cx} ${cy} v-8" style="stroke:#5E8A4A" stroke-width="1.4"/><ellipse cx="${cx - 4}" cy="${cy - 8}" rx="4" ry="2.4" style="fill:#7FB86A"/><ellipse cx="${cx + 4}" cy="${cy - 9}" rx="4" ry="2.4" style="fill:#7FB86A"/>`;
  if (g < 1) return [-26, 0, 26].map(dx => `<path d="M${cx + dx} ${cy} v-16" style="stroke:#5E8A4A" stroke-width="1.4"/><ellipse cx="${cx + dx - 6}" cy="${cy - 12}" rx="6" ry="3" style="fill:#6FAE58"/><ellipse cx="${cx + dx + 6}" cy="${cy - 16}" rx="6" ry="3" style="fill:#7FB86A"/>`).join("");
  return [-28, 0, 28].map(dx => iconAt(crop, cx + dx, cy - 14, 26)).join("");
};
export function greenhouseArt(beds, growth){
  const floor = `<rect width="520" height="640" style="fill:#E7DCCB"/>${Array.from({length: 16}, (_, r) => Array.from({length: 9}, (_, c) => `<rect x="${c*60 - (r % 2)*30}" y="${150 + r*30}" width="60" height="30" style="fill:none;stroke:#D2C3AC" stroke-width="1"/>`).join("")).join("")}`;
  // the glass back wall and roof, with the misters along a pipe
  const glass = `<g pointer-events="none"><rect x="0" y="0" width="520" height="150" style="fill:#DCEFF7"/>${Array.from({length: 9}, (_, i) => `<path d="M${i*65} 0 V150" style="stroke:#FFFDF6" stroke-width="4"/><path d="M${i*65} 0 V150" style="stroke:var(--line)" stroke-width="1"/>`).join("")}
    <path d="M0 75 H520" style="stroke:#FFFDF6" stroke-width="4"/><path d="M0 75 H520 M0 150 H520" style="stroke:var(--line)" stroke-width="1"/>
    ${[40, 300, 440].map(x => `<ellipse cx="${x}" cy="${40 + (x % 3)*8}" rx="${30 + x % 20}" ry="14" style="fill:#FFFDF6" opacity=".5"/>`).join("")}
    <path d="M30 168 H490" style="stroke:#9AA3A8" stroke-width="3"/>${[100, 220, 340, 460].map(x => `<g><path d="M${x} 168 v6" style="stroke:#9AA3A8" stroke-width="2"/><path d="M${x - 6} 182 l6 -8 l6 8" style="fill:none;stroke:#CFE8F4" stroke-width="1.4" stroke-dasharray="2 3"><animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.4s" repeatCount="indefinite"/></path></g>`).join("")}</g>`;
  // the potting bench along the right, terracotta pots, and the watering can
  const bench = `<g pointer-events="none">${sk(`<rect x="452" y="200" width="56" height="300" rx="3" style="fill:#C9A27E"/>${[230, 280, 330, 380, 430].map(y => `<path d="M464 ${y} h20 l-3 16 h-14z" style="fill:#C8643B"/><circle cx="474" cy="${y - 4}" r="7" style="fill:${y % 100 ? "#7FB86A" : "#6FAE58"}"/>`).join("")}<path d="M460 520 h26 v18 h-26z" style="fill:#9CC3E0"/><path d="M486 524 l14 -10" style="stroke:#9CC3E0" stroke-width="3"/>`,
    `<rect x="452" y="200" width="56" height="300" rx="3"/><path d="M460 520 h26 v18 h-26z"/>`)}</g>`;
  let h = floor + glass + bench;
  GH_BED_AT.forEach((p, i) => { const b = beds[i], g = b ? growth(b) : 0;
    h += `<g data-ghbed="${i}" aria-label="Bed ${i + 1}"><rect class="hov" x="${p.x - 6}" y="${p.y - 6}" width="${p.w + 12}" height="${p.h + 12}" rx="10" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="4" style="fill:#A8754F"/><rect x="${p.x + 6}" y="${p.y + 6}" width="${p.w - 12}" height="${p.h - 12}" rx="3" style="fill:#7A5A44"/>
      ${b ? plant(b.crop, g, p.x + p.w/2, p.y + p.h/2 + 14) : ""}</g>${b && g >= 1 ? iconAt("sparkle", p.x + p.w - 8, p.y + 6, 16) : ""}
      ${tapeLabel(p.x + p.w/2, p.y + p.h + 16, b ? CROPS[b.crop].n : "Empty bed", b ? "#C3E8DA" : "#F3E1A0", 9)}</g>`; });
  h += `<g data-exit="1" aria-label="Back to the garden"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:#7FB86A"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Garden</text></g>`;
  return h;
}
