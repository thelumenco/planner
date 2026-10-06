// The field: an open meadow north of Ma Ma's orchard and west of the town square, with a lake (two swans), a picnic
// spot, a little football pitch and benches. The lake's river runs out south-east and on into the orchard's top
// right corner, then east into the river at home.
import { ink, sgHM } from "../util.js";
import { eventNow, STALL_SPOTS } from "../game/tours.js";
import { sk, tapeLabel, tree, flowers, artCtx } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";

const W = `filter="url(#wob)" ${ink}`;
// a swan gliding slowly back and forth (dx: how far it drifts, dur: seconds per lap)
const swan = (x, y, dx, dur, flip) => `<g pointer-events="none"><g>
    <animateTransform attributeName="transform" type="translate" values="0 0; ${dx} 4; 0 0" dur="${dur}s" repeatCount="indefinite"/>
    <g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)" ${W} stroke-width="1.2">
      <path d="M-14 0 q2 -9 14 -8 q10 0 12 -6 l2 0 q-1 9 -6 12 q-6 4 -18 4 q-4 0 -4 -2z" style="fill:#FFFDF6"/>
      <path d="M8 -12 q-4 -8 1 -14 q4 -4 7 0" fill="none" stroke-width="3.4" style="stroke:#FFFDF6"/><path d="M8 -12 q-4 -8 1 -14 q4 -4 7 0" fill="none"/>
      <path d="M16 -26 l5 1.5 l-5 1.5z" style="fill:#F08A3C"/><circle cx="14" cy="-25.5" r=".8" style="fill:var(--line)"/>
    </g></g></g>`;
const ripples = pts => pts.map(([x, y]) => `<path class="ripple" d="M${x} ${y} q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/>`).join("");

// a market stall: striped awning in its colour, a table of goods
const stall = (i, x, y, s) => s.kind === "wine" ? wineStall(i, x, y) : `<g data-place="mstall${i}" aria-label="${s.n} stall"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="34" ry="9" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x-28}" y="${y-22}" width="56" height="22" rx="2" style="fill:#C9A27E"/><path d="M${x-34} ${y-40} h68 l-4 12 h-60z" style="fill:${s.col}"/>${[0, 1, 2].map(k => `<path d="M${x-26 + k*20} ${y-40} l-2 12 h8 l2 -12z" style="fill:#FFFDF6"/>`).join("")}
    ${[[-16, -26], [-6, -27], [4, -26], [14, -27]].map(([dx, dy], k) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.4" style="fill:${(s.kind === "orchard" ? ["#D9433A", "#E8566C", "#F3C969", "#C9A3E0"] : ["#E8566C", "#F3C969", "#9CC27E", "#C98A4A"])[(k + i) % 4]}"/>`).join("")}`,
    `<rect x="${x-28}" y="${y-22}" width="56" height="22" rx="2"/><path d="M${x-34} ${y-40} h68 l-4 12 h-60z M${x-30} ${y-28} v6 M${x+30} ${y-28} v6"/>`)}
  ${tapeLabel(x, y + 18, s.short, "var(--card)", 10)}</g>`;
const wineStall = (i, x, y) => `<g data-place="mstall${i}" aria-label="The wine shop's market stall"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="36" ry="9" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x-30}" y="${y-22}" width="60" height="22" rx="2" style="fill:#8B5E3C"/><path d="M${x-36} ${y-40} h72 l-4 12 h-64z" style="fill:#8E2C48"/>${[-18, -8, 2, 12].map((dx, k) => `<path d="M${x + dx} ${y-24} h5 l-.5 -9 h-4z" style="fill:${k % 2 ? "#E98AA0" : "#5B2338"}"/>`).join("")}`,
    `<rect x="${x-30}" y="${y-22}" width="60" height="22" rx="2"/><path d="M${x-36} ${y-40} h72 l-4 12 h-64z M${x-32} ${y-28} v6 M${x+32} ${y-28} v6"/>`)}
  ${tapeLabel(x, y + 18, "Our wines", "#E8B4C0", 10)}</g>`;
// a second picnic blanket on market and fair days, for shoppers enjoying what they bought
const blanket2 = () => `<g pointer-events="none">${sk(`<path d="M176 474 l50 -5 l7 22 l-50 5z" style="fill:#7FB8E8"/>${[0, 1].map(k => `<path d="M${186 + k*18} ${473 - k*2} l7 22" style="stroke:#FFFDF6" stroke-width="4"/>`).join("")}`, `<path d="M176 474 l50 -5 l7 22 l-50 5z"/>`)}</g>`;
// the fair's kites, bobbing over the lake
const kites = `<g pointer-events="none">${[[150, 110, "#E8566C"], [260, 86, "#7FB8E8"], [360, 120, "#F3C969"]].map(([x, y, c], k) => `<g><animateTransform attributeName="transform" type="translate" values="0 0; ${6 - k*4} -8; 0 0" dur="${5 + k}s" repeatCount="indefinite"/>
  <g ${W}><path d="M${x} ${y-14} l10 14 l-10 14 l-10 -14z" style="fill:${c}"/><path d="M${x} ${y+14} q6 30 -10 60 q-10 30 4 60" fill="none" stroke-width="1"/></g></g>`).join("")}</g>`;
const bunting = `<g pointer-events="none" ${W} stroke-width="1"><path d="M20 70 Q260 96 500 70" fill="none"/>${Array.from({length: 15}, (_, i) => { const x = 36 + i*32, y = 70 + Math.sin(i/14*Math.PI)*24;
  return `<path d="M${x-6} ${y} h12 l-6 10z" style="fill:${["#E8566C", "#F3C969", "#7FB8E8", "#9CC27E"][i % 4]}"/>`; }).join("")}</g>`;
export function fieldArt(){
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="160" cy="520" rx="170" ry="90" style="fill:var(--grass2)"/><ellipse cx="460" cy="460" rx="90" ry="140" style="fill:var(--grass2)"/></g>
    ${tree(40, 60, .9)}${tree(140, 46, .75)}${tree(300, 52, .8)}${tree(420, 40, .9)}${tree(490, 120, .8)}${tree(460, 330, .85)}${tree(470, 560, .9)}${tree(30, 600, .8)}
    <g filter="url(#wob)"><path d="M260 640 V392 M260 392 C150 392 54 384 54 300 C54 222 130 192 240 188 H520" fill="none" style="stroke:var(--path)" stroke-width="18" stroke-linecap="round"/></g>
    <g filter="url(#wob)"><path d="M322 304 C372 340 386 380 368 450 C352 520 372 580 380 640" fill="none" style="stroke:var(--water)" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="210" cy="280" rx="132" ry="62" style="fill:var(--water)"/></g>
    <g filter="url(#wob)" fill="none" style="stroke:var(--line)" stroke-width="1.1" opacity=".55"><ellipse cx="210" cy="280" rx="132" ry="62"/><path d="M313 302 C363 338 377 380 359 450 C343 520 363 580 371 640 M331 306 C381 342 395 380 377 450 C361 520 381 580 389 640"/></g>
    ${ripples([[150, 262], [250, 300], [180, 316], [368, 470], [372, 590]])}
    <g ${W}>${[[86, 250], [92, 312], [330, 262]].map(([x, y]) => `<path d="M${x} ${y} v-14 M${x + 4} ${y} v-18 M${x + 8} ${y} v-12" fill="none" style="stroke:var(--moss2)"/><ellipse cx="${x + 4}" cy="${y - 19}" rx="1.6" ry="4" style="fill:#8C5A3C"/>`).join("")}</g>
    ${flowers([[30, 440, "#EFA3A6"], [44, 452, "#F3C969"], [440, 230, "#C3CDEE"], [480, 260, "#EFA3A6"], [430, 420, "#F3C969"], [300, 620, "#EFA3A6"], [200, 470, "#C3CDEE"]])}`;
  const swans = swan(170, 272, 60, 26, false) + swan(250, 292, -50, 31, true);
  const lake = `<g data-place="lake" aria-label="The lake and the swans"><ellipse class="hov" cx="220" cy="372" rx="60" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="196" y="356" width="48" height="8" rx="2" style="fill:var(--wood)"/>`, `<rect x="196" y="356" width="48" height="8" rx="2"/><path d="M200 364 v10 M240 364 v10 M196 356 v-12 h48 v12"/>`)}
    ${tapeLabel(220, 394, "Swans", "var(--peri)", 11)}</g>`;
  const picnic = `<g data-place="picnic" aria-label="Picnic spot"><ellipse class="hov" cx="140" cy="470" rx="64" ry="14" style="fill:var(--butter)"/>
    ${sk(`<path d="M86 452 l58 -6 l8 26 l-58 6z" style="fill:#E8566C"/>${[0, 1, 2].map(i => `<path d="M${96 + i*18} ${451 - i*2} l8 26" style="stroke:#FFFDF6" stroke-width="4"/>`).join("")}<rect x="156" y="452" width="24" height="16" rx="3" style="fill:#C9A27E"/><path d="M158 452 q10 -12 20 0" style="fill:none"/>`,
      `<path d="M86 452 l58 -6 l8 26 l-58 6z"/><rect x="156" y="452" width="24" height="16" rx="3"/><path d="M158 452 q10 -12 20 0"/>`)}
    ${tapeLabel(130, 508, "Picnic spot", "var(--blush)", 11)}</g>`;
  const pitch = `<g data-place="pitch" aria-label="Football pitch"><ellipse class="hov" cx="150" cy="590" rx="80" ry="12" style="fill:var(--butter)"/>
    <g ${W} fill="none" opacity=".75"><rect x="66" y="530" width="168" height="56" rx="4" style="stroke:#FFFDF6" stroke-width="2.4"/><path d="M150 530 v56" style="stroke:#FFFDF6" stroke-width="2"/><circle cx="150" cy="558" r="10" style="stroke:#FFFDF6" stroke-width="2"/></g>
    ${sk(`<circle cx="176" cy="566" r="5" style="fill:#FFFDF6"/>`, `<path d="M62 544 v28 h-10 v-28z M238 544 v28 h10 v-28z"/><circle cx="176" cy="566" r="5"/><path d="M174 563 l3 2 l-1 3" opacity=".6"/>`)}
    ${tapeLabel(150, 612, "Football pitch", "var(--butter)", 11)}</g>`;
  const toTown = `<g data-place="toTownF" aria-label="Path to the town square"><ellipse class="hov" cx="500" cy="192" rx="24" ry="22" style="fill:var(--butter)"/>
    ${sk(`<rect x="484" y="160" width="6" height="40" style="fill:var(--wood)"/><rect x="508" y="160" width="6" height="40" style="fill:var(--wood)"/><path d="M480 164 q19 -14 38 0 v6 q-19 -12 -38 0z" style="fill:var(--sage)"/>`,
      `<rect x="484" y="160" width="6" height="40"/><rect x="508" y="160" width="6" height="40"/><path d="M480 164 q19 -14 38 0 v6 q-19 -12 -38 0z"/>`)}
    ${tapeLabel(458, 226, "Town square", "var(--butter)", 11)}</g>`;
  const toOrchard = `<g data-place="toOrchardN" aria-label="Path to Ma Ma's orchard"><ellipse class="hov" cx="260" cy="622" rx="28" ry="16" style="fill:var(--butter)"/>
    ${sk(`<rect x="240" y="594" width="6" height="42" style="fill:var(--wood)"/><rect x="274" y="594" width="6" height="42" style="fill:var(--wood)"/><path d="M236 598 q24 -16 48 0 v6 q-24 -14 -48 0z" style="fill:#9CC27E"/>`,
      `<rect x="240" y="594" width="6" height="42"/><rect x="274" y="594" width="6" height="42"/><path d="M236 598 q24 -16 48 0 v6 q-24 -14 -48 0z"/>`)}
    ${tapeLabel(332, 614, "Orchard", "var(--sage)", 11)}</g>`;
  // market and fair days: stalls in a row along the top under the bunting, a second picnic blanket, kites at the fair
  const ev = eventNow(artCtx().day(), sgHM());
  const event = ev ? bunting + ev.stalls.map(s => stall(s.at, STALL_SPOTS[s.at][0], STALL_SPOTS[s.at][1], s)).join("") + blanket2() + (ev.kind === "fair" ? kites : "")
    + tapeLabel(260, 30, ev.name, "var(--butter)", 12) : "";
  return lampDefs + ground + swans + [[110, 196], [396, 196]].map(([x, y]) => streetLamp(x, y)).join("") + lake + picnic + pitch + toTown + toOrchard + event;
}
// The river's stretch through the top right of Ma Ma's orchard (from the lake, on east to home)
export const orchardRiver = `<g filter="url(#wob)"><path d="M380 0 C400 40 450 66 520 70" fill="none" style="stroke:var(--water)" stroke-width="18" stroke-linecap="round"/>
  <path d="M371 0 C391 42 446 75 520 79 M389 0 C409 38 454 57 520 61" fill="none" style="stroke:var(--line)" stroke-width="1.1" opacity=".55"/></g>
  <path class="ripple" d="M430 52 q4 -3 8 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".8"/>`;
