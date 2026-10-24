// Bram's cottage (round 283, Mel: "Bram's cottage"): the keeper's cottage at the foot of the lighthouse. Outside, a
// little whitewashed cottage with a slate roof and a smoking chimney on Lighthouse Point; inside, one snug room: a
// driftwood fire with the kettle on the hob, his armchair, a ship in a bottle on the mantel, his father's logbook on
// the desk under the round window, and the door back out to the point.
import { sk, tapeLabel } from "./scenes.js";

export function bramCottageOut(){
  return `<g data-place="lbram" aria-label="Bram's cottage"><ellipse class="hov" cx="306" cy="436" rx="44" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="272" y="390" width="68" height="44" style="fill:#F6F2EA"/><path d="M266 392 L306 364 L346 392z" style="fill:#6E7A86"/><rect x="322" y="362" width="9" height="18" style="fill:#BDB3A4"/>
      <rect x="298" y="408" width="15" height="26" rx="1" style="fill:#2F4A6B"/><rect class="wglow" x="278" y="400" width="13" height="11" style="fill:#DCE8F0"/><rect class="wglow" x="321" y="400" width="13" height="11" style="fill:#DCE8F0"/>`,
      `<rect x="272" y="390" width="68" height="44"/><path d="M266 392 L306 364 L346 392z"/><rect x="322" y="362" width="9" height="18"/><rect x="298" y="408" width="15" height="26" rx="1"/><rect x="278" y="400" width="13" height="11"/><rect x="321" y="400" width="13" height="11"/><path d="M284.5 400 v11 M278 405.5 h13 M327.5 400 v11 M321 405.5 h13" opacity=".5"/>`)}
    <path d="M326 356 q-4 -8 2 -14 q5 -6 0 -12" fill="none" style="stroke:#CFC8BE" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
    ${tapeLabel(306, 452, "Bram's cottage", "var(--sky)", 9.5)}</g>`;
}

export function bramCottageArt(home){
  const room = `<rect width="520" height="640" style="fill:#E9D8BF"/>
    <g opacity=".35" fill="none" style="stroke:#B98A5A" stroke-width="1.2">${[220, 270, 320, 370, 420, 470, 520, 570, 620].map(y => `<path d="M0 ${y} H520"/>`).join("")}</g>
    ${sk(`<rect x="0" y="0" width="520" height="190" style="fill:#F3EEE4"/>`, `<path d="M0 190 H520"/>`)}
    <g opacity=".3" fill="none" style="stroke:#A99D8C" stroke-width="1">${[[30, 40, 70, 26], [120, 20, 60, 24], [200, 50, 80, 26], [430, 30, 60, 26], [460, 120, 50, 24], [20, 130, 60, 24]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`).join("")}</g>
    <g filter="url(#wash)" opacity=".5"><ellipse cx="260" cy="430" rx="120" ry="60" style="fill:#D97C6A"/></g>
    ${sk(`<ellipse cx="260" cy="430" rx="110" ry="52" style="fill:#E8A28F"/><ellipse cx="260" cy="430" rx="78" ry="36" style="fill:#F3C9A8"/><ellipse cx="260" cy="430" rx="44" ry="20" style="fill:#9FC3D9"/>`, `<ellipse cx="260" cy="430" rx="110" ry="52"/><ellipse cx="260" cy="430" rx="78" ry="36" opacity=".6"/><ellipse cx="260" cy="430" rx="44" ry="20" opacity=".6"/>`)}`;
  // the fireplace, with the kettle on the hob
  const fire = `<g data-bspot="fire" aria-label="The fire"><ellipse class="hov" cx="100" cy="214" rx="62" ry="12" style="fill:var(--butter)"/>
    ${sk(`<rect x="36" y="70" width="128" height="140" style="fill:#BDB3A4"/><rect x="28" y="62" width="144" height="14" rx="2" style="fill:#8A6A4E"/><path d="M62 210 V130 q38 -34 76 0 V210z" style="fill:#3B3530"/>`,
      `<rect x="36" y="70" width="128" height="140"/><rect x="28" y="62" width="144" height="14" rx="2"/><path d="M62 210 V130 q38 -34 76 0 V210z"/><path d="M36 110 h26 M138 110 h26 M36 150 h26 M138 150 h26 M50 70 v40 M150 70 v40" opacity=".4"/>`)}
    <g class="glow"><ellipse cx="100" cy="196" rx="${home ? 30 : 20}" ry="10" style="fill:#F2A65A" opacity="${home ? .55 : .25}"/></g>
    ${home ? `<path class="flame" d="M84 202 q4 -26 16 -34 q-2 14 8 20 q6 -10 4 -20 q12 12 6 34z" style="fill:#F3C969;stroke:#E07A3A" stroke-width="1"/><path class="flame" d="M94 202 q2 -12 8 -16 q4 8 4 16z" style="fill:#7FB8E8" opacity=".8"/>` : ""}
    <path d="M72 204 l56 -6 M76 198 l50 6" style="stroke:#6B4A36" stroke-width="5" stroke-linecap="round"/>
    ${tapeLabel(100, 236, "Fire", "var(--peach)", 9.5)}</g>`;
  const kettle = `<g data-bspot="kettle" aria-label="The kettle"><ellipse class="hov" cx="196" cy="206" rx="26" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="176" y="178" width="40" height="28" rx="3" style="fill:#3B3530"/><path d="M184 178 q12 -22 24 0z" style="fill:#7FA36E"/><path d="M208 168 l10 -6" style="stroke:#7FA36E" stroke-width="3"/><path d="M188 164 q8 -8 16 0" fill="none" style="stroke:#3B3530" stroke-width="2"/>`,
      `<rect x="176" y="178" width="40" height="28" rx="3"/><path d="M184 178 q12 -22 24 0z"/><path d="M188 164 q8 -8 16 0"/>`)}
    ${home ? `<path d="M222 158 q-4 -8 2 -14 q4 -6 0 -12" fill="none" style="stroke:#FFFDF6" stroke-width="2" opacity=".8"/>` : ""}
    ${tapeLabel(196, 230, "Kettle", "var(--sage)", 9.5)}</g>`;
  // the ship in a bottle on a shelf
  const ship = `<g data-bspot="ship" aria-label="The ship in a bottle"><ellipse class="hov" cx="300" cy="104" rx="46" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="244" y="100" width="112" height="7" rx="2" style="fill:#A8754F"/><path d="M264 98 h66 q12 0 12 -14 q0 -14 -12 -14 h-50 l-6 -6 h-6 v6 h-4 q-10 0 -10 14 q0 14 10 14z" style="fill:#DCE8F0" opacity=".85"/>
      <path d="M282 92 h34 l-4 6 h-26z" style="fill:#8A5A3A"/><path d="M298 92 v-18 M306 92 v-14" style="stroke:#5E4636" stroke-width="1.2"/><path d="M298 74 l-10 14 h10z M306 78 l8 12 h-8z" style="fill:#FFFDF6"/>`,
      `<rect x="244" y="100" width="112" height="7" rx="2"/><path d="M264 98 h66 q12 0 12 -14 q0 -14 -12 -14 h-50 l-6 -6 h-6 v6 h-4 q-10 0 -10 14 q0 14 10 14z"/>`)}
    ${tapeLabel(300, 126, "Ship in a bottle", "var(--sky)", 9.5)}</g>`;
  // the round window and the desk with his father's logbook
  const win = `<g data-bspot="window" aria-label="The round window"><circle class="hov" cx="430" cy="92" r="52" style="fill:var(--butter)"/>
    ${sk(`<circle cx="430" cy="92" r="46" style="fill:#A8754F"/><circle cx="430" cy="92" r="38" style="fill:#DCEAF2"/><path d="M392 100 q38 -6 76 0 v6 q0 30 -38 30 q-38 0 -38 -30z" style="fill:#7AB3D6"/>`,
      `<circle cx="430" cy="92" r="46"/><circle cx="430" cy="92" r="38"/><path d="M392 92 h76 M430 54 v76" opacity=".5"/>`)}
    <path d="M410 80 q3 -3 6 0 q3 -3 6 0 M442 72 q3 -3 6 0 q3 -3 6 0" fill="none" style="stroke:#3B3530" stroke-width="1"/></g>`;
  const desk = `<g data-bspot="log" aria-label="His father's logbook"><ellipse class="hov" cx="430" cy="262" rx="58" ry="12" style="fill:var(--butter)"/>
    ${sk(`<rect x="376" y="214" width="108" height="12" rx="2" style="fill:#A8754F"/><rect x="384" y="226" width="8" height="38" style="fill:#8A6A4E"/><rect x="468" y="226" width="8" height="38" style="fill:#8A6A4E"/>
      <path d="M408 212 l22 -6 l22 6 v4 h-44z" style="fill:#FFFDF6"/><path d="M430 206 v10" style="stroke:#A99D8C"/><rect x="462" y="196" width="8" height="16" rx="2" style="fill:#F3C969"/>`,
      `<rect x="376" y="214" width="108" height="12" rx="2"/><path d="M408 212 l22 -6 l22 6 v4 h-44z"/><path d="M412 210 l14 -3 M434 207 l14 3" opacity=".5"/>`)}
    ${tapeLabel(430, 286, "Logbook", "var(--butter)", 9.5)}</g>`;
  const chair = sk(`<rect x="66" y="290" width="76" height="62" rx="12" style="fill:#7A9CC6"/><rect x="58" y="300" width="18" height="52" rx="8" style="fill:#6A8CB6"/><rect x="132" y="300" width="18" height="52" rx="8" style="fill:#6A8CB6"/><rect x="72" y="326" width="64" height="20" rx="6" style="fill:#8FB0D6"/>`,
    `<rect x="66" y="290" width="76" height="62" rx="12"/><rect x="58" y="300" width="18" height="52" rx="8"/><rect x="132" y="300" width="18" height="52" rx="8"/><path d="M78 352 v8 M130 352 v8"/>`);
  const table = sk(`<ellipse cx="300" cy="300" rx="48" ry="18" style="fill:#C9A27E"/><rect x="296" y="300" width="8" height="40" style="fill:#A8754F"/><rect x="282" y="286" width="9" height="9" rx="2" style="fill:#FFFDF6"/><rect x="306" y="288" width="9" height="9" rx="2" style="fill:#EFA3A6"/><path d="M316 290 h3 v5 h-3" fill="none" style="stroke:#3B3530" stroke-width=".8"/>`,
    `<ellipse cx="300" cy="300" rx="48" ry="18"/><path d="M296 316 v24 M304 316 v24 M284 340 h32"/>`);
  const coat = sk(`<path d="M484 210 h18 v10 h-18z" style="fill:#8A6A4E"/><path d="M482 220 q10 -4 22 0 l4 60 h-30z" style="fill:#F3C969"/><path d="M486 214 q6 -10 12 0z" style="fill:#2F4A6B"/>`, `<path d="M482 220 q10 -4 22 0 l4 60 h-30z"/><path d="M493 222 v56" opacity=".4"/>`);
  const door = `<g data-exit="lighthouse" aria-label="Back out to the point"><ellipse class="hov" cx="260" cy="620" rx="42" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="228" y="600" width="64" height="16" rx="2" style="fill:#2F4A6B"/>`, `<rect x="228" y="600" width="64" height="16" rx="2"/>`)}
    ${tapeLabel(260, 590, "Out to the point", "var(--sky)", 10)}</g>`;
  return room + fire + kettle + ship + win + desk + chair + table + coat + door;
}
