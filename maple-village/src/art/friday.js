// Friday evenings at the bay (round 112): the bonfire on the grass, the fishmonger's van; and the kite
// on the field. Lanterns rising over the sea are drawn by core.js (lanternFlight) when Mel releases them.
import { ink } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

export function bonfireArt(x, y, lit){

  const fire = lit ? lampGlow(x, y - 10, 70) + `<g pointer-events="none">${[0, 1, 2].map(i => `<path d="M${x - 12 + i*12} ${y - 2} q${-6 + i*3} -16 ${2 - i} -30 q${8 - i*2} 14 ${4} 30z" style="fill:${["#F28C28", "#F3C969", "#E8566C"][i]};stroke:var(--line)" stroke-width=".8"><animateTransform attributeName="transform" type="scale" values="1 1;1.05 1.12;.96 .94;1 1" dur="${.8 + i*.2}s" repeatCount="indefinite" additive="sum"/></path>`).join("")}
    ${[0, 1, 2, 3].map(i => `<circle cx="${x - 6 + i*4}" cy="${y - 30}" r="1.4" fill="#F3C969"><animate attributeName="cy" values="${y - 30};${y - 70}" dur="${1.6 + i*.4}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="${1.6 + i*.4}s" repeatCount="indefinite"/></circle>`).join("")}</g>` : "";
  return `<g data-place="bonfire" aria-label="The bonfire"><ellipse class="hov" cx="${x}" cy="${y}" rx="44" ry="18" style="fill:var(--butter)"/>
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

// Round 113: the Friday market on the field: three little stalls with striped awnings, and Hiro with his kites
const AWN = ["#7FB8E8", "#F2A0B8", "#F3C969"];
export function bayStallArt(k, x, y, label){
  return `<g data-place="bm${k}" aria-label="${label}"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="30" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x - 26}" y="${y - 20}" width="52" height="20" rx="2" style="fill:#C9A27E"/><path d="M${x - 30} ${y - 48} h60 l-4 12 h-52z" style="fill:${AWN[k % 3]}"/>${[0, 1, 2].map(i => `<path d="M${x - 26 + i*20} ${y - 48} h10 l-1 12 h-10z" style="fill:#FFFDF6"/>`).join("")}<path d="M${x - 26} ${y - 36} v16 M${x + 26} ${y - 36} v16" style="stroke:#8A6A52" stroke-width="2"/>${[0, 1, 2].map(i => `<rect x="${x - 20 + i*14}" y="${y - 26}" width="10" height="7" rx="2" style="fill:${["#E8566C", "#9CC27E", "#C9A3E0"][(i + k) % 3]}"/>`).join("")}`,
      `<rect x="${x - 26}" y="${y - 20}" width="52" height="20" rx="2"/><path d="M${x - 30} ${y - 48} h60 l-4 12 h-52z"/>`)}
    ${tapeLabel(x, y + 16, label, "#F6E3B4", 8.5)}</g>`;
}
export function kiteSellerArt(x, y){
  return `<g data-place="kites" aria-label="Kites"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="26" ry="8" style="fill:var(--butter)"/>
    <g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1">${[[-14, -60, "#E8566C"], [8, -70, "#7FB8E8"], [22, -52, "#F3C969"]].map(([dx, dy, c]) => `<path d="M${x + dx} ${y + dy - 10} l9 10 l-9 12 l-9 -12z" style="fill:${c}"/><path d="M${x + dx} ${y + dy + 12} L${x + 2} ${y - 18}" fill="none" stroke-width=".7"/>`).join("")}</g>
    ${tapeLabel(x, y + 18, "Kites", "#DCEBF6", 9)}</g>`;
}
// Movie night on the field: a big white screen on poles, a film flickering on it, and a popcorn cart
export function movieArt(sx, sy, film){
  const scr = `<g data-place="screen" aria-label="The outdoor cinema"><ellipse class="hov" cx="${sx}" cy="${sy + 8}" rx="80" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="${sx - 66}" y="${sy - 88}" width="132" height="76" style="fill:#FFFDF6"/><path d="M${sx - 70} ${sy} V${sy - 92} M${sx + 70} ${sy} V${sy - 92}" style="stroke:#8A6A52" stroke-width="4"/>`, `<rect x="${sx - 66}" y="${sy - 88}" width="132" height="76"/>`)}
    <g pointer-events="none"><rect x="${sx - 62}" y="${sy - 84}" width="124" height="68" fill="#2E3A55"/><circle cx="${sx + 34}" cy="${sy - 70}" r="7" fill="#FFF3C4"/><path d="M${sx - 62} ${sy - 30} q30 -14 62 -4 t62 -6 V${sy - 16} H${sx - 62}z" fill="#5E7A5A"/>
      <g><path d="M${sx - 40} ${sy - 34} q4 -8 10 -4 q4 -6 8 0 l-2 6 h-14z" fill="#E8913A"/><animateTransform attributeName="transform" type="translate" values="0 0;60 0;0 0" dur="14s" repeatCount="indefinite"/></g>
      ${[0, 1, 2, 3].map(i => `<circle cx="${sx - 40 + i*24}" cy="${sy - 50 - (i % 2)*8}" r="1.6" fill="#F3E27A"><animate attributeName="opacity" values="1;.2;1" dur="${1.4 + i*.3}s" repeatCount="indefinite"/></circle>`).join("")}</g>
    ${tapeLabel(sx, sy + 14, film, "#E7D9F2", 9)}</g>`;
  const cx = sx + 170, cy = sy + 50;   // the popcorn cart, off to one side
  const cart = `<g data-place="popcorn" aria-label="Popcorn cart"><ellipse class="hov" cx="${cx}" cy="${cy + 6}" rx="26" ry="8" style="fill:var(--butter)"/>
    ${sk(`<rect x="${cx - 18}" y="${cy - 30}" width="36" height="30" rx="3" style="fill:#E8566C"/><rect x="${cx - 16}" y="${cy - 50}" width="32" height="22" rx="2" style="fill:#FFF6DC"/><path d="M${cx - 22} ${cy - 50} h44 l-4 -10 h-36z" style="fill:#FFFDF6"/><circle cx="${cx - 12}" cy="${cy + 4}" r="5" style="fill:#3A3430"/><circle cx="${cx + 12}" cy="${cy + 4}" r="5" style="fill:#3A3430"/>`,
      `<rect x="${cx - 18}" y="${cy - 30}" width="36" height="30" rx="3"/><rect x="${cx - 16}" y="${cy - 50}" width="32" height="22" rx="2"/><path d="M${cx - 22} ${cy - 50} h44 l-4 -10 h-36z"/>`)}${tapeLabel(cx, cy + 24, "Popcorn", "#F6D3DC", 9)}</g>`;
  const blankets = [[sx - 60, sy + 84, "#F2A0B8"], [sx, sy + 86, "#7FB8E8"], [sx + 60, sy + 84, "#F3C969"]].map(([x, y, c]) => `<rect x="${x - 26}" y="${y - 10}" width="52" height="22" rx="3" style="fill:${c};stroke:var(--line)" stroke-width="1" opacity=".9" pointer-events="none"/>`).join("");
  return blankets + scr + cart;
}
