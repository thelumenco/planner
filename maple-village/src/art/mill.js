// Inside the old mill (round 110): whitewashed stone walls, a beamed ceiling, the round stone basin with the
// conical millstone (it turns while a pressing is on), the press with its stack of round esparto mats and a big
// wooden screw, clay tinajas along the wall, a shelf of bottles, and a little window where the sails go by.
import { ink } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";

export function millArt(pressing, ready){
  const floor = `<rect width="520" height="640" style="fill:#D9CBB2"/>${Array.from({length: 12}, (_, r) => Array.from({length: 7}, (_, c) => `<rect x="${c*80 - (r % 2)*40}" y="${170 + r*40}" width="80" height="40" rx="3" style="fill:none;stroke:#C4B394" stroke-width="1.2"/>`).join("")).join("")}`;
  const wall = `<g pointer-events="none"><rect x="0" y="0" width="520" height="170" style="fill:#F3ECDD"/><path d="M0 170 H520" style="stroke:var(--line)" stroke-width="1.4"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${i*90 - 10}" y="0" width="14" height="40" style="fill:#8A6A52"/>`).join("")}<rect x="0" y="34" width="520" height="10" style="fill:#7A5A44"/>
    <rect x="220" y="62" width="80" height="70" rx="38" style="fill:#BFE0F2;stroke:var(--line)" stroke-width="1.4"/><g transform="translate(260 97)"><g><path d="M0 0 L-6 -40 L6 -40z M0 0 L40 -6 L40 6z M0 0 L6 40 L-6 40z M0 0 L-40 6 L-40 -6z" style="fill:#FFFDF6;stroke:#8A6A52" stroke-width="1"/><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite"/></g></g>
    <rect x="220" y="62" width="80" height="70" rx="38" style="fill:none;stroke:#8A6A52" stroke-width="5"/>
    ${sk(`<rect x="356" y="78" width="120" height="8" style="fill:#A8754F"/>${[366, 386, 406, 426, 446, 462].map((x, i) => `<path d="M${x} 78 v-18 h8 v18z" style="fill:${i % 2 ? "#9FB04A" : "#B9B04A"}"/>`).join("")}<rect x="356" y="118" width="120" height="8" style="fill:#A8754F"/>${[370, 400, 430, 456].map(x => `<path d="M${x} 118 v-16 h10 v16z" style="fill:#C9C25A"/>`).join("")}`, `<rect x="356" y="78" width="120" height="8"/><rect x="356" y="118" width="120" height="8"/>`)}</g>`;
  // the clay jars along the left wall
  const jars = `<g pointer-events="none">${[[50, 250], [50, 340], [50, 430]].map(([x, y]) => sk(`<path d="M${x - 22} ${y - 40} q-6 30 6 52 h32 q12 -22 6 -52z" style="fill:#C8643B"/><ellipse cx="${x}" cy="${y - 40}" rx="22" ry="6" style="fill:#A84E2E"/>`, `<path d="M${x - 22} ${y - 40} q-6 30 6 52 h32 q12 -22 6 -52z"/><ellipse cx="${x}" cy="${y - 40}" rx="22" ry="6"/>`)).join("")}</g>`;
  // the millstone in its basin (tap it, or the press, for the press panel)
  const stone = `<g data-millspot="press" aria-label="The millstone"><ellipse class="hov" cx="220" cy="350" rx="110" ry="40" style="fill:var(--butter)"/>
    ${sk(`<ellipse cx="220" cy="330" rx="100" ry="38" style="fill:#B9B0A4"/><ellipse cx="220" cy="322" rx="84" ry="28" style="fill:${pressing ? "#7F8E4A" : "#9C9488"}"/>`, `<ellipse cx="220" cy="330" rx="100" ry="38"/><ellipse cx="220" cy="322" rx="84" ry="28"/>`)}
    <g><g ${pressing ? "" : ""}>${sk(`<rect x="214" y="250" width="12" height="80" style="fill:#8A6A52"/><path d="M160 306 h120 l-10 -30 h-100z" style="fill:#CFC6B8"/>`, `<rect x="214" y="250" width="12" height="80"/><path d="M160 306 h120 l-10 -30 h-100z"/>`)}${pressing ? `<animateTransform attributeName="transform" type="translate" values="-30 0;30 0;-30 0" dur="4s" repeatCount="indefinite"/>` : ""}</g></g>
    ${tapeLabel(220, 392, "Millstone", "#F3E1A0", 10)}</g>`;
  // the press: a frame, a big screw, a stack of round mats, oil running into a jar
  const press = `<g data-millspot="press" aria-label="The olive press"><ellipse class="hov" cx="390" cy="470" rx="70" ry="16" style="fill:var(--butter)"/>
    ${sk(`<rect x="336" y="300" width="14" height="170" style="fill:#7A5638"/><rect x="430" y="300" width="14" height="170" style="fill:#7A5638"/><rect x="330" y="296" width="120" height="16" style="fill:#7A5638"/><rect x="384" y="312" width="12" height="60" style="fill:#5A4A3E"/>${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="390" cy="${384 + i*12}" rx="38" ry="8" style="fill:${i % 2 ? "#C9A27E" : "#B98F5E"}"/>`).join("")}<rect x="350" y="452" width="80" height="12" style="fill:#8A6A52"/><path d="M430 458 h18 v6" style="fill:none;stroke:#8A6A52" stroke-width="3"/><path d="M440 476 q-8 20 0 28 h20 q8 -8 0 -28z" style="fill:#C8643B"/>`,
      `<rect x="336" y="300" width="14" height="170"/><rect x="430" y="300" width="14" height="170"/><rect x="330" y="296" width="120" height="16"/><path d="M440 476 q-8 20 0 28 h20 q8 -8 0 -28z"/>`)}
    ${pressing || ready ? `<path d="M448 464 v12" style="stroke:#B9B04A" stroke-width="2.4" stroke-dasharray="3 3"><animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite"/></path>` : ""}
    ${tapeLabel(390, 522, ready ? "Oil's ready!" : "Olive press", ready ? "#F3C969" : "#F3E1A0", 10)}</g>`;
  const exit = `<g data-exit="1" aria-label="Back out to the cottage lane"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:#C9A27E"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
  // round 120: the old photograph by the door (the mill's story), and Tomás's initials carved in the beam
  const photo = `<g data-millspot="photo" aria-label="An old photograph"><ellipse class="hov" cx="150" cy="104" rx="30" ry="34" style="fill:var(--butter)"/>
    ${sk(`<rect x="128" y="72" width="44" height="58" rx="2" style="fill:#8A6A52"/><rect x="133" y="77" width="34" height="48" style="fill:#E8D3A8"/><path d="M146 118 v-24 l-6 -8 h12 l-6 8" style="fill:#B98F5E"/><path d="M144 86 l-8 -8 M148 86 l8 -8 M144 90 l-8 8 M148 90 l8 8" style="stroke:#8A6A52" stroke-width="2"/><circle cx="160" cy="112" r="4" style="fill:#7A9A4A"/>`, `<rect x="128" y="72" width="44" height="58" rx="2"/><rect x="133" y="77" width="34" height="48"/>`)}</g>`;
  const initials = `<text x="390" y="306" text-anchor="middle" font-family="Klee One,serif" font-size="8" fill="#3A2A1E" opacity=".75" pointer-events="none">T.R. 1912</text>`;
  return floor + wall + photo + jars + stone + press + initials + exit;
}
