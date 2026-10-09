// Friday evenings at the bay (round 112): the bonfire on the beach with its logs, the fishmonger's van; and the kite
// on the field. Lanterns rising over the sea are drawn by core.js (lanternFlight) when Mel releases them.
import { ink } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

const LOG_AT = [[148, 514], [166, 486], [196, 476], [226, 486], [244, 514], [154, 544], [238, 546]];
export function bonfireArt(x, y, lit){
  const logs = LOG_AT.map(([lx, ly]) => sk(`<rect x="${lx - 14}" y="${ly - 5}" width="28" height="9" rx="4" style="fill:#8A6A52"/>`, `<rect x="${lx - 14}" y="${ly - 5}" width="28" height="9" rx="4"/><circle cx="${lx - 10}" cy="${ly - .5}" r="2.4"/>`)).join("");
  const fire = lit ? lampGlow(x, y - 10, 70) + `<g pointer-events="none">${[0, 1, 2].map(i => `<path d="M${x - 12 + i*12} ${y - 2} q${-6 + i*3} -16 ${2 - i} -30 q${8 - i*2} 14 ${4} 30z" style="fill:${["#F28C28", "#F3C969", "#E8566C"][i]};stroke:var(--line)" stroke-width=".8"><animateTransform attributeName="transform" type="scale" values="1 1;1.05 1.12;.96 .94;1 1" dur="${.8 + i*.2}s" repeatCount="indefinite" additive="sum"/></path>`).join("")}
    ${[0, 1, 2, 3].map(i => `<circle cx="${x - 6 + i*4}" cy="${y - 30}" r="1.4" fill="#F3C969"><animate attributeName="cy" values="${y - 30};${y - 70}" dur="${1.6 + i*.4}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="${1.6 + i*.4}s" repeatCount="indefinite"/></circle>`).join("")}</g>` : "";
  return `<g data-place="bonfire" aria-label="The bonfire"><ellipse class="hov" cx="${x}" cy="${y}" rx="44" ry="18" style="fill:var(--butter)"/>${logs}
    ${sk(`<circle cx="${x}" cy="${y}" r="16" style="fill:#B9B0A4"/><path d="M${x - 14} ${y + 2} l28 -6 M${x - 12} ${y - 6} l26 8" style="stroke:#5A4636" stroke-width="5"/>`, `<circle cx="${x}" cy="${y}" r="16"/>`)}
    ${fire}${tapeLabel(x, y + 66, lit ? "Bonfire" : "Fire pit", "#F3C969", 10)}</g>`;
}
export function fishVanArt(x, y){
  return `<g data-place="fishvan" aria-label="The fishmonger's van"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="50" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x - 46}" y="${y - 44}" width="92" height="40" rx="8" style="fill:#FFFDF6"/><rect x="${x - 46}" y="${y - 26}" width="92" height="6" style="fill:#3E6BAE"/><path d="M${x - 50} ${y - 48} h80 l-4 10 h-72z" style="fill:#7FB8E8"/>${[0, 1, 2, 3].map(i => `<path d="M${x - 46 + i*20} ${y - 48} h10 l-1 10 h-10z" style="fill:#FFFDF6"/>`).join("")}<rect x="${x + 22}" y="${y - 40}" width="20" height="14" rx="2" style="fill:#BFE0F2"/><circle cx="${x - 26}" cy="${y - 2}" r="7" style="fill:#3A3430"/><circle cx="${x + 26}" cy="${y - 2}" r="7" style="fill:#3A3430"/><rect x="${x - 40}" y="${y - 20}" width="44" height="10" rx="2" style="fill:#DCEFF7"/>${[0, 1, 2].map(i => `<path d="M${x - 36 + i*13} ${y - 15} q4 -3 8 0 q-4 3 -8 0z" style="fill:#9AA9B8"/>`).join("")}`,
      `<rect x="${x - 46}" y="${y - 44}" width="92" height="40" rx="8"/><path d="M${x - 50} ${y - 48} h80 l-4 10 h-72z"/><rect x="${x + 22}" y="${y - 40}" width="20" height="14" rx="2"/><circle cx="${x - 26}" cy="${y - 2}" r="7"/><circle cx="${x + 26}" cy="${y - 2}" r="7"/>`)}
    <text x="${x - 6}" y="${y - 30}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.4" fill="#3E6BAE" pointer-events="none">SAL'S FISH</text>
    ${tapeLabel(x, y + 20, "Fishmonger", "#C3DDF3", 10)}</g>`;
}
// a kite up in the sky over the field: the string runs down to where Mel's standing (sx, sy)
export function kiteArt(sx, sy){
  const kx = sx - 70, ky = sy - 190;
  return `<g pointer-events="none" class="kitefly"><path d="M${sx + 6} ${sy - 40} Q${sx - 40} ${sy - 140} ${kx} ${ky + 20}" fill="none" style="stroke:#3b3530" stroke-width=".8"/>
    <g><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.2"><path d="M${kx} ${ky - 22} l18 20 l-18 24 l-18 -24z" style="fill:#E8566C"/><path d="M${kx} ${ky - 22} v44 M${kx - 18} ${ky - 2} h36" style="stroke:#FFFDF6"/>
      <path d="M${kx} ${ky + 22} q-8 10 0 18 q8 8 0 18" fill="none"/>${[0, 1, 2].map(i => `<path d="M${kx - 4} ${ky + 30 + i*12} l8 -3 l0 6z" style="fill:${["#F3C969", "#7FB8E8", "#9CC27E"][i]}"/>`).join("")}</g>
    <animateTransform attributeName="transform" type="translate" values="0 0;10 -8;-6 4;4 -12;0 0" dur="5s" repeatCount="indefinite"/></g></g>`;
}
