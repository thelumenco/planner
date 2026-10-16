// Elena's cottages, inside (round 219): Bluebell and Fig Tree, empty shells plus whatever you've furnished them with.
// Every piece comes in three tiers (simple, good, fine) and is tinted with its colour. The window in each shell sits
// where COTTAGES[id].slots.curtains says, so the curtains always hang on it.
import { sk } from "./scenes.js";
import { COLOURS, COTTAGES, catOf } from "../data/lets.js";

const rows = (n, f) => Array.from({length: n}, (_, i) => f(i)).join("");
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*t).toString(16).padStart(2, "0")).join(""); };
const L = (c, t) => mix(c, "#FFFDF6", t), D = (c, t) => mix(c, "#3A2E28", t);
const PINE = "#E3C38C", OAK = "#B07D4A", DARK = "#7A5638", BRASS = "#D4A93A", CREAM = "#FFFDF6", LINE = "#3A2E28";
const WALL = 240;   // the back wall runs down to here; the floor starts below

// a cottage window: frame in the trim colour, a view, glazing bars and a sill
const windowArt = (x, y, trim, view) => sk(`<rect x="${x-54}" y="${y-64}" width="108" height="128" rx="4" style="fill:${trim}"/><rect x="${x-48}" y="${y-58}" width="96" height="116" rx="2" style="fill:#D6E8F2"/>${view}
    <rect x="${x-60}" y="${y+60}" width="120" height="9" rx="2" style="fill:${CREAM}"/>`,
  `<rect x="${x-54}" y="${y-64}" width="108" height="128" rx="4"/><rect x="${x-48}" y="${y-58}" width="96" height="116" rx="2"/><path d="M${x} ${y-58} v116 M${x-48} ${y} h96"/><rect x="${x-60}" y="${y+60}" width="120" height="9" rx="2"/>`);

const floorBoards = (fill, line) => `<rect width="520" height="640" style="fill:${fill}"/><g opacity=".45" style="stroke:${line}" stroke-width="1.2">${rows(11, i => `<path d="M0 ${262 + i*36} H520"/>`)}${rows(26, i => `<path d="M${(i*71) % 520} ${262 + (i % 11)*36} v36"/>`)}</g>`;
const dormer = (x, y, trim) => sk(`<rect x="${x-40}" y="${y-50}" width="80" height="96" rx="3" style="fill:${trim}"/><rect x="${x-34}" y="${y-44}" width="68" height="84" rx="2" style="fill:#D6E8F2"/><path d="M${x-34} ${y+14} q20 -14 36 -4 q16 -8 32 -2 v32 h-68z" style="fill:#A9C79A"/><rect x="${x-46}" y="${y+46}" width="92" height="8" rx="2" style="fill:${CREAM}"/>`,
  `<rect x="${x-40}" y="${y-50}" width="80" height="96" rx="3"/><rect x="${x-34}" y="${y-44}" width="68" height="84" rx="2"/><path d="M${x} ${y-44} v84 M${x-34} ${y-2} h68"/><rect x="${x-46}" y="${y+46}" width="92" height="8" rx="2"/>`);
// round 220: wooden stairs up the left wall of the sitting room (seen side-on, as at the old mill)
const tape = (x, y, t) => `<g pointer-events="none"><rect x="${x - t.length*3.2 - 8}" y="${y - 10}" width="${t.length*6.4 + 16}" height="17" rx="2" fill="#F3E1A0" opacity=".95"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-family="Klee One,serif" font-size="10" fill="#3A2E28">${t}</text></g>`;
function stairsUp(){
  const X = 24, B = 612, RW = 19, RH = 15, N = 6, top = B - N*RH, prof = `M${X} ${B} ${rows(N, k => `V${B - (k + 1)*RH} H${X + (k + 1)*RW}`)} V${B} Z`;
  return `<g data-letstairs="1" aria-label="Up the stairs to the bedroom"><ellipse class="hov" cx="${X + 60}" cy="${B - 4}" rx="66" ry="12" style="fill:var(--butter)"/>
    ${sk(`<path d="${prof}" style="fill:#8A6340"/>${rows(N, k => `<rect x="${X + k*RW - 1}" y="${B - (k + 1)*RH - 2}" width="${RW + 3}" height="4" rx="1" style="fill:#B9875E"/>`)}
      ${rows(N, k => `<path d="M${X + k*RW + RW/2} ${B - (k + 1)*RH - 2} V${B - (k + 1)*RH - 30}" style="stroke:#6B4A2E" stroke-width="2"/>`)}
      <path d="M${X + 2} ${B - 44} L${X + N*RW + 2} ${top - 32}" style="stroke:#5A3A2A" stroke-width="3.5" stroke-linecap="round"/><rect x="${X - 2}" y="${B - 50}" width="7" height="50" rx="1.5" style="fill:#6B4A2E"/><circle cx="${X + 1.5}" cy="${B - 52}" r="4" style="fill:#5A3A2A"/>`,
      `<path d="${prof}"/><path d="M${X + 2} ${B - 44} L${X + N*RW + 2} ${top - 32}"/>`)}
    ${tape(X + 60, 628, "Upstairs")}</g>`;
}
// and the top of the stairwell upstairs, bottom left, with a rail: the way back down
const stairsDown = () => `<g data-exit="1" aria-label="Down the stairs"><ellipse class="hov" cx="80" cy="590" rx="46" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="36" y="520" width="90" height="96" style="fill:#7A5638"/>${rows(5, i => `<rect x="${40 + i*4}" y="${528 + i*17}" width="${82 - i*8}" height="12" style="fill:#A8754F"/>`)}<path d="M130 520 v96 M126 520 h8" style="stroke:#5A3A2A" stroke-width="3"/>`, `<rect x="36" y="520" width="90" height="96"/>`)}
    ${tape(80, 630, "Downstairs")}</g>`;

export const LET_SHELLS = {
  // Bluebell: pale blue-grey walls under the eaves, beams, a stone fireplace, and an arch through to the second bedroom
  bluebell: () => { const [wx, wy] = COTTAGES.bluebell.slots.curtains, trim = "#5E7AB0";
    return `<rect width="520" height="640" style="fill:#DCCBAE"/>
    <g opacity=".45" style="stroke:#BFA986" stroke-width="1.2">${rows(11, i => `<path d="M0 ${262 + i*36} H520"/>`)}${rows(26, i => `<path d="M${(i*71) % 520} ${262 + (i % 11)*36} v36"/>`)}</g>
    <rect width="520" height="${WALL}" style="fill:#DDE5EC"/>
    <g style="fill:#C2D0DD" opacity=".75">${rows(7, r => rows(14, i => `<path transform="translate(${i*40 + (r % 2)*20 + 10} ${r*32 + 22})" d="M0 0 l-3 -5 M0 0 l3 -5 M0 0 v4" style="stroke:#B4C4D4" stroke-width="1.2" fill="none"/>`))}</g>
    <rect y="${WALL - 14}" width="520" height="14" style="fill:${trim}"/>
    ${sk(`<rect width="520" height="20" style="fill:#8A6A52"/>${rows(6, i => `<rect x="${24 + i*92}" y="20" width="14" height="9" style="fill:#8A6A52"/>`)}`, `<rect width="520" height="20"/><path d="M60 10 h70 M300 8 h50" opacity=".4"/>`)}
    ${windowArt(wx, wy, trim, `<path d="M${wx-48} ${wy+20} q30 -22 56 -6 q22 -14 40 -4 v48 h-96z" style="fill:#A9C79A"/><path d="M${wx-48} ${wy+34} q40 -16 96 -6 v30 h-96z" style="fill:#8FB383"/><ellipse cx="${wx+24}" cy="${wy-34}" rx="13" ry="5" style="fill:${CREAM}"/>`)}
    ${sk(`<rect x="196" y="12" width="100" height="${WALL - 12}" style="fill:#E7EDF2"/><rect x="206" y="166" width="80" height="${WALL - 166}" style="fill:#CFC6BA"/>
      <path d="M220 ${WALL} V196 Q246 176 272 196 V${WALL}z" style="fill:#3E302A"/><path d="M226 ${WALL - 4} l18 -8 l18 8z" style="fill:#8A5A3A"/><path d="M234 ${WALL - 10} q6 -18 12 -24 q4 12 12 6 q-2 10 -6 18z" style="fill:#F2A65A"/><path d="M240 ${WALL - 10} q4 -10 7 -14 q3 8 6 14z" style="fill:#F3C969"/>
      <rect x="198" y="156" width="96" height="10" rx="2" style="fill:#9A6E48"/><rect x="190" y="${WALL}" width="112" height="12" rx="2" style="fill:#BDB3A6"/>
      <rect x="206" y="138" width="7" height="18" style="fill:${CREAM}"/><rect x="279" y="138" width="7" height="18" style="fill:${CREAM}"/><path d="M209.5 131 q3 4 0 7 q-3 -3 0 -7z M282.5 131 q3 4 0 7 q-3 -3 0 -7z" style="fill:#F3C969"/>`,
      `<path d="M196 12 V${WALL} M296 12 V${WALL}"/><rect x="206" y="166" width="80" height="${WALL - 166}"/><path d="M220 ${WALL} V196 Q246 176 272 196 V${WALL}"/>
      <path d="M206 186 h14 M272 186 h14 M206 210 h14 M272 210 h14 M230 166 v12 M262 166 v12" opacity=".5"/><rect x="198" y="156" width="96" height="10" rx="2"/><rect x="190" y="${WALL}" width="112" height="12" rx="2"/>
      <rect x="206" y="138" width="7" height="18"/><rect x="279" y="138" width="7" height="18"/>`)}
    ${stairsUp()}
    `; },

  // Fig Tree: warm cream limewash, low beams, a little range in a brick fireplace, and a deep window seat
  figtree: () => { const [wx, wy] = COTTAGES.figtree.slots.curtains, trim = "#C8923A";
    return `<rect width="520" height="640" style="fill:#D9BD96"/>
    <g opacity=".5" style="stroke:#BE9E74" stroke-width="1.2" fill="none">${rows(10, r => `<path d="M0 ${256 + r*40} H520"/>${rows(7, c => `<path d="M${c*78 + (r % 2)*39 + 20} ${256 + r*40} v40"/>`)}`)}</g>
    <rect width="520" height="${WALL}" style="fill:#F5E8CF"/>
    <g style="fill:#EADBBE" opacity=".7">${rows(9, i => `<ellipse cx="${(i*131) % 500 + 20}" cy="${(i*53) % 170 + 40}" rx="${18 + (i % 3)*8}" ry="${8 + (i % 2)*4}"/>`)}</g>
    <rect y="${WALL - 14}" width="520" height="14" style="fill:${trim}"/>
    ${sk(`<rect width="520" height="24" style="fill:${DARK}"/>${rows(6, i => `<rect x="${30 + i*92}" y="24" width="16" height="10" style="fill:${DARK}"/>`)}<rect x="0" y="24" width="14" height="${WALL - 24}" style="fill:#8A6448"/><rect x="506" y="24" width="14" height="${WALL - 24}" style="fill:#8A6448"/>`,
      `<rect width="520" height="24"/><path d="M14 24 V${WALL} M506 24 V${WALL}"/><path d="M40 12 h60 M180 8 h40 M330 14 h70" opacity=".4"/>`)}
    ${sk(`<path d="M${wx-70} ${WALL - 20} V${wy-50} Q${wx} ${wy-112} ${wx+70} ${wy-50} V${WALL - 20}z" style="fill:#E6D2AE"/>`, `<path d="M${wx-70} ${WALL - 20} V${wy-50} Q${wx} ${wy-112} ${wx+70} ${wy-50} V${WALL - 20}"/>`)}
    ${windowArt(wx, wy, trim, `<rect x="${wx-48}" y="${wy+10}" width="96" height="48" style="fill:#B9D2A6"/><path d="M${wx+48} ${wy-40} q-20 6 -26 24 q14 -4 26 -2z M${wx+48} ${wy-6} q-26 0 -34 20 q18 0 34 -6z" style="fill:#6F9A5E"/><path d="M${wx-48} ${wy-30} q18 4 22 22 q-12 -2 -22 -6z" style="fill:#7FA36E"/><circle cx="${wx+30}" cy="${wy-8}" r="4" style="fill:#7B5A7A"/>`)}
    ${sk(`<rect x="${wx-76}" y="${wy+70}" width="152" height="18" rx="5" style="fill:#F3E7C8"/>${rows(9, i => `<rect x="${wx-70 + i*16}" y="${wy+70}" width="4" height="18" style="fill:#E3C58A"/>`)}<rect x="${wx-82}" y="${wy+88}" width="164" height="${WALL + 26 - wy - 88}" rx="3" style="fill:#C99A62"/>
      <rect x="${wx-62}" y="${wy+52}" width="30" height="22" rx="8" transform="rotate(-8 ${wx-47} ${wy+63})" style="fill:#E3B26A"/>`,
      `<rect x="${wx-76}" y="${wy+70}" width="152" height="18" rx="5"/><rect x="${wx-82}" y="${wy+88}" width="164" height="${WALL + 26 - wy - 88}" rx="3"/><rect x="${wx-72}" y="${wy+96}" width="66" height="${WALL + 10 - wy - 88}" rx="2" opacity=".6"/><rect x="${wx+6}" y="${wy+96}" width="66" height="${WALL + 10 - wy - 88}" rx="2" opacity=".6"/><rect x="${wx-62}" y="${wy+52}" width="30" height="22" rx="8" transform="rotate(-8 ${wx-47} ${wy+63})"/>`)}
    <g transform="translate(24 0)">${sk(`<rect x="250" y="150" width="90" height="${WALL - 150}" style="fill:#C98B6B"/><rect x="266" y="172" width="58" height="${WALL - 172}" style="fill:#3A2A24"/>
      <rect x="276" y="198" width="38" height="${WALL - 198}" rx="2" style="fill:#2E2A28"/><rect x="284" y="208" width="22" height="16" rx="3" style="fill:#F2A65A"/><rect x="290" y="172" width="8" height="26" style="fill:#2E2A28"/>
      <path d="M300 196 q0 -12 9 -12 q9 0 9 12z" style="fill:#5E6B78"/><rect x="240" y="138" width="110" height="16" rx="2" style="fill:${DARK}"/><rect x="244" y="${WALL}" width="102" height="12" rx="2" style="fill:#B5754F"/>
      ${rows(9, i => `<circle cx="${248 + i*12}" cy="${134 + (i % 2)*3}" r="4" style="fill:#B9C98A"/>`)}`,
      `<rect x="250" y="150" width="90" height="${WALL - 150}"/><rect x="266" y="172" width="58" height="${WALL - 172}"/><rect x="276" y="198" width="38" height="${WALL - 198}" rx="2"/><rect x="284" y="208" width="22" height="16" rx="3"/>
      ${rows(4, r => `<path d="M250 ${162 + r*20} h16 M324 ${162 + r*20} h16"/>`)}<path d="M300 196 q0 -12 9 -12 q9 0 9 12z M318 190 l6 -4"/><rect x="240" y="138" width="110" height="16" rx="2"/><rect x="244" y="${WALL}" width="102" height="12" rx="2"/>`)}</g>
    ${stairsUp()}
`; },

  // round 220: upstairs. Bluebell: two beds under the eaves, a dormer over each and the old roof post between them
  bluebellup: () => { const trim = "#5E7AB0";
    return floorBoards("#DCCBAE", "#BFA986") + `<rect width="520" height="${WALL}" style="fill:#DDE5EC"/>
    <g style="fill:none;stroke:#B4C4D4" stroke-width="1.2" opacity=".75">${rows(6, r => rows(14, i => `<path transform="translate(${i*40 + (r % 2)*20 + 10} ${r*32 + 62})" d="M0 0 l-3 -5 M0 0 l3 -5 M0 0 v4"/>`))}</g>
    <rect y="${WALL - 14}" width="520" height="14" style="fill:${trim}"/>
    ${sk(`<path d="M0 0 H520 V40 L470 70 H50 L0 40z" style="fill:#F3F0E8"/><path d="M0 40 L50 70 H470 L520 40" style="fill:none;stroke:#8A6A52" stroke-width="8"/>`, `<path d="M0 40 L50 70 H470 L520 40"/><path d="M120 70 V0 M260 70 V0 M400 70 V0" opacity=".4"/>`)}
    ${dormer(130, 140, trim)}${dormer(390, 140, trim)}
    ${sk(`<rect x="250" y="70" width="20" height="${WALL - 70}" style="fill:#9A6E48"/>`, `<rect x="250" y="70" width="20" height="${WALL - 70}"/>`)}
    ${stairsDown()}`; },

  // Fig Tree upstairs: one bedroom under low beams, a washstand with a jug and bowl
  figtreeup: () => { const trim = "#C8923A";
    return floorBoards("#D9BD96", "#BE9E74") + `<rect width="520" height="${WALL}" style="fill:#F5E8CF"/>
    <g style="fill:#EADBBE" opacity=".7">${rows(7, i => `<ellipse cx="${(i*131) % 500 + 20}" cy="${(i*53) % 150 + 60}" rx="${18 + (i % 3)*8}" ry="${8 + (i % 2)*4}"/>`)}</g>
    <rect y="${WALL - 14}" width="520" height="14" style="fill:${trim}"/>
    ${sk(`<path d="M0 0 H520 V30 L440 60 H80 L0 30z" style="fill:${DARK}"/>${rows(5, i => `<rect x="${90 + i*80}" y="60" width="14" height="10" style="fill:${DARK}"/>`)}<rect x="0" y="30" width="14" height="${WALL - 30}" style="fill:#8A6448"/><rect x="506" y="30" width="14" height="${WALL - 30}" style="fill:#8A6448"/>`,
      `<path d="M0 30 L80 60 H440 L520 30"/><path d="M14 30 V${WALL} M506 30 V${WALL}"/>`)}
    ${dormer(270, 130, trim)}
    ${sk(`<rect x="62" y="210" width="76" height="50" rx="3" style="fill:#B07D4A"/><rect x="58" y="204" width="84" height="8" rx="2" style="fill:#9A6E48"/><ellipse cx="100" cy="202" rx="26" ry="6" style="fill:#E3EEF2"/><path d="M86 202 q-2 -22 8 -28 h12 q6 4 4 10 q8 0 6 10 l-6 2 q0 6 -4 6z" style="fill:#F3F0E8"/><path d="M68 260 v20 M132 260 v20" style="stroke:${DARK}" stroke-width="5"/>`,
      `<rect x="62" y="210" width="76" height="50" rx="3"/><rect x="58" y="204" width="84" height="8" rx="2"/><ellipse cx="100" cy="202" rx="26" ry="6"/><path d="M86 202 q-2 -22 8 -28 h12 q6 4 4 10 q8 0 6 10 l-6 2 q0 6 -4 6z"/><rect x="72" y="222" width="56" height="14" rx="2" opacity=".5"/>`)}
    ${stairsDown()}`; }
};

// ---------- the pieces: each takes the slot position, the tier and the tint ----------
// beds come in two halves so the bedding goes between the headboard and the footboard
function bed(x, y, t){
  if (t === 1) return {back: sk(`<rect x="${x-56}" y="${y-122}" width="112" height="58" rx="12" style="fill:${PINE}"/><rect x="${x-52}" y="${y-86}" width="104" height="62" rx="6" style="fill:#F4EFE4"/>`,
      `<rect x="${x-56}" y="${y-122}" width="112" height="58" rx="12"/><path d="M${x-40} ${y-110} q20 -4 40 0 M${x+8} ${y-100} q16 -3 30 0" opacity=".4"/><rect x="${x-52}" y="${y-86}" width="104" height="62" rx="6"/>`),
    front: sk(`<rect x="${x-56}" y="${y-22}" width="112" height="16" rx="3" style="fill:${PINE}"/>`, `<rect x="${x-56}" y="${y-22}" width="112" height="16" rx="3"/><path d="M${x-50} ${y-6} v6 M${x+50} ${y-6} v6"/>`)};
  if (t === 2) return {back: sk(`<rect x="${x-62}" y="${y-132}" width="12" height="${132}" rx="3" style="fill:${OAK}"/><rect x="${x+50}" y="${y-132}" width="12" height="132" rx="3" style="fill:${OAK}"/><circle cx="${x-56}" cy="${y-136}" r="6" style="fill:${OAK}"/><circle cx="${x+56}" cy="${y-136}" r="6" style="fill:${OAK}"/>
      <path d="M${x-50} ${y-76} V${y-112} Q${x} ${y-140} ${x+50} ${y-112} V${y-76}z" style="fill:#C08D58"/><rect x="${x-50}" y="${y-88}" width="100" height="64" rx="6" style="fill:#F4EFE4"/>`,
      `<rect x="${x-62}" y="${y-132}" width="12" height="132" rx="3"/><rect x="${x+50}" y="${y-132}" width="12" height="132" rx="3"/><circle cx="${x-56}" cy="${y-136}" r="6"/><circle cx="${x+56}" cy="${y-136}" r="6"/>
      <path d="M${x-50} ${y-76} V${y-112} Q${x} ${y-140} ${x+50} ${y-112} V${y-76}"/><path d="M${x-38} ${y-90} V${y-108} Q${x} ${y-128} ${x+38} ${y-108} V${y-90}" opacity=".5"/><rect x="${x-50}" y="${y-88}" width="100" height="64" rx="6"/>`),
    front: sk(`<rect x="${x-62}" y="${y-30}" width="124" height="24" rx="4" style="fill:#C08D58"/><rect x="${x-62}" y="${y-34}" width="12" height="34" rx="3" style="fill:${OAK}"/><rect x="${x+50}" y="${y-34}" width="12" height="34" rx="3" style="fill:${OAK}"/>`,
      `<rect x="${x-62}" y="${y-30}" width="124" height="24" rx="4"/><rect x="${x-44}" y="${y-25}" width="88" height="14" rx="2" opacity=".5"/><circle cx="${x-56}" cy="${y-38}" r="4"/><circle cx="${x+56}" cy="${y-38}" r="4"/>`)};
  const sp = n => rows(n, i => x - 48 + i*96/(n - 1));
  return {back: sk(`<path d="M${x-60} ${y-132} Q${x} ${y-160} ${x+60} ${y-132} M${x-60} ${y-96} H${x+60} M${x-60} ${y-132} V${y} M${x+60} ${y-132} V${y}" style="stroke:${BRASS};fill:none" stroke-width="5"/>
      ${Array.from({length: 7}, (_, i) => { const sx = x - 45 + i*15; return `<path d="M${sx} ${y-96} V${y-138 + Math.abs(i - 3)*3}" style="stroke:${BRASS}" stroke-width="3"/>`; }).join("")}<circle cx="${x}" cy="${y-120}" r="7" style="fill:${CREAM}"/>
      <circle cx="${x-60}" cy="${y-138}" r="6" style="fill:${BRASS}"/><circle cx="${x+60}" cy="${y-138}" r="6" style="fill:${BRASS}"/><rect x="${x-56}" y="${y-92}" width="112" height="72" rx="8" style="fill:#F6F1E6"/>`,
      `<path d="M${x-62} ${y-132} Q${x} ${y-162} ${x+62} ${y-132} M${x-62} ${y-132} V${y} M${x+62} ${y-132} V${y}"/><circle cx="${x-60}" cy="${y-138}" r="6"/><circle cx="${x+60}" cy="${y-138}" r="6"/><circle cx="${x}" cy="${y-120}" r="7"/><rect x="${x-56}" y="${y-92}" width="112" height="72" rx="8"/>`),
    front: sk(`<path d="M${x-60} ${y-30} H${x+60} M${x-60} ${y-14} H${x+60}" style="stroke:${BRASS}" stroke-width="4"/>${rows(9, i => `<path d="M${x-48 + i*12} ${y-30} V${y-14}" style="stroke:${BRASS}" stroke-width="2.5"/>`)}<circle cx="${x-60}" cy="${y-34}" r="5" style="fill:${BRASS}"/><circle cx="${x+60}" cy="${y-34}" r="5" style="fill:${BRASS}"/>`,
      `<path d="M${x-60} ${y-34} V${y} M${x+60} ${y-34} V${y}"/><circle cx="${x-60}" cy="${y-34}" r="5"/><circle cx="${x+60}" cy="${y-34}" r="5"/><path d="M${x-60} ${y-32} H${x+60}" opacity=".5"/>`)};
}
// the bedding, on the bed at (x, y) or folded on the floor if there's no bed yet
function linen(x, y, t, c, onBed){
  if (!onBed) {
    const pile = [[CREAM, 0], [t === 3 ? "patch" : c, 1], ...(t > 1 ? [[CREAM, 2]] : []), ...(t === 3 ? [[L(c, .4), 3]] : [])];
    return sk(pile.map(([col, i]) => col === "patch" ? `<rect x="${x-36}" y="${y-14 - i*14}" width="72" height="14" rx="4" style="fill:${c}"/>${rows(6, k => k % 2 ? `<rect x="${x-36 + k*12}" y="${y-14 - i*14}" width="12" height="14" style="fill:${L(c, .55)}"/>` : "")}` : `<rect x="${x-36 + i*2}" y="${y-14 - i*14}" width="${72 - i*4}" height="14" rx="4" style="fill:${col}"/>`).join("") + (t > 1 ? `<path d="M${x-30} ${y-14 - pile.length*14} h60" style="stroke:${D(c, .2)}" stroke-width="3"/>` : ""),
      pile.map((p, i) => `<rect x="${x-36 + (p[0] === "patch" ? 0 : i*2)}" y="${y-14 - i*14}" width="${p[0] === "patch" ? 72 : 72 - i*4}" height="14" rx="4"/>`).join(""));
  }
  if (t === 1) return sk(`<rect x="${x-42}" y="${y-90}" width="84" height="20" rx="8" style="fill:${CREAM}"/><rect x="${x-55}" y="${y-72}" width="110" height="10" rx="3" style="fill:${CREAM}"/><rect x="${x-56}" y="${y-64}" width="112" height="48" rx="4" style="fill:${c}"/>`,
    `<rect x="${x-42}" y="${y-90}" width="84" height="20" rx="8"/><rect x="${x-55}" y="${y-72}" width="110" height="10" rx="3"/><rect x="${x-56}" y="${y-64}" width="112" height="48" rx="4"/><path d="M${x-50} ${y-58} h100" stroke-dasharray="3 4" opacity=".6"/>`);
  if (t === 2) { const hem = rows(8, i => `q7 7 14 0`);
    return sk(`<rect x="${x-48}" y="${y-98}" width="44" height="28" rx="12" style="fill:${CREAM}"/><rect x="${x+4}" y="${y-98}" width="44" height="28" rx="12" style="fill:${CREAM}"/>
      <path d="M${x-58} ${y-72} H${x+58} V${y-20} ${"q-7 7 -14 0 ".repeat(8)}z" style="fill:${c}"/><rect x="${x-58}" y="${y-72}" width="116" height="12" rx="4" style="fill:${L(c, .45)}"/>`,
      `<rect x="${x-48}" y="${y-98}" width="44" height="28" rx="12"/><rect x="${x+4}" y="${y-98}" width="44" height="28" rx="12"/><path d="M${x-58} ${y-72} H${x+58} V${y-20} ${"q-7 7 -14 0 ".repeat(8)}z"/><path d="M${x-58} ${y-60} H${x+58}"/>
      <g opacity=".45" stroke-dasharray="2 3">${rows(3, i => `<path d="M${x-54} ${y-50 + i*11} H${x+54}"/>`)}${rows(5, i => `<path d="M${x-38 + i*19} ${y-58} V${y-22}"/>`)}</g>`); }
  const pc = [c, L(c, .55), "#FFF6E6", D(c, .2)];
  return sk(`<rect x="${x-54}" y="${y-110}" width="50" height="32" rx="12" style="fill:${CREAM}"/><rect x="${x+4}" y="${y-110}" width="50" height="32" rx="12" style="fill:${CREAM}"/>
    <rect x="${x-48}" y="${y-96}" width="40" height="24" rx="10" style="fill:${L(c, .25)}"/><rect x="${x+8}" y="${y-96}" width="40" height="24" rx="10" style="fill:${L(c, .25)}"/><rect x="${x-16}" y="${y-84}" width="32" height="13" rx="6.5" style="fill:${D(c, .15)}"/>
    <rect x="${x-58}" y="${y-74}" width="116" height="10" rx="3" style="fill:${CREAM}"/>
    ${rows(4, r => rows(8, k => `<rect x="${x-58 + k*14.5}" y="${y-64 + r*12}" width="14.5" height="12" style="fill:${pc[(r + k*3) % 4]}"/>`))}
    <rect x="${x-60}" y="${y-30}" width="120" height="11" rx="3" style="fill:${D(c, .3)}"/>`,
    `<rect x="${x-54}" y="${y-110}" width="50" height="32" rx="12"/><rect x="${x+4}" y="${y-110}" width="50" height="32" rx="12"/><rect x="${x-48}" y="${y-96}" width="40" height="24" rx="10"/><rect x="${x+8}" y="${y-96}" width="40" height="24" rx="10"/><rect x="${x-16}" y="${y-84}" width="32" height="13" rx="6.5"/><path d="M${x-10} ${y-84} v13 M${x+10} ${y-84} v13" opacity=".5"/>
    <rect x="${x-58}" y="${y-74}" width="116" height="10" rx="3"/><rect x="${x-58}" y="${y-64}" width="116" height="48" rx="2"/><g opacity=".35">${rows(3, r => `<path d="M${x-58} ${y-52 + r*12} h116"/>`)}${rows(7, k => `<path d="M${x-43.5 + k*14.5} ${y-64} v48"/>`)}</g>
    <rect x="${x-60}" y="${y-30}" width="120" height="11" rx="3"/><path d="M${x-60} ${y-19} ${rows(10, i => "l2 4 l2 -4 ").trim()}" opacity=".5"/>`);
}
function seat(x, y, t, c){
  if (t === 1) return sk(`<path d="M${x-30} ${y-40} V${y-74} Q${x} ${y-102} ${x+30} ${y-74} V${y-40}z" style="fill:#DDBF86"/><rect x="${x-36}" y="${y-56}" width="10" height="30" rx="4" style="fill:#C9A46A"/><rect x="${x+26}" y="${y-56}" width="10" height="30" rx="4" style="fill:#C9A46A"/>
      <rect x="${x-28}" y="${y-46}" width="56" height="16" rx="6" style="fill:${c}"/><rect x="${x-30}" y="${y-30}" width="60" height="8" rx="2" style="fill:#DDBF86"/>`,
    `<path d="M${x-30} ${y-40} V${y-74} Q${x} ${y-102} ${x+30} ${y-74} V${y-40}"/><g opacity=".4">${rows(5, i => `<path d="M${x-24 + i*12} ${y-84 + Math.abs(i - 2)*4} l10 40"/><path d="M${x-14 + i*12} ${y-84 + Math.abs(i - 2)*4} l-10 40"/>`)}</g>
    <rect x="${x-36}" y="${y-56}" width="10" height="30" rx="4"/><rect x="${x+26}" y="${y-56}" width="10" height="30" rx="4"/><rect x="${x-28}" y="${y-46}" width="56" height="16" rx="6"/><rect x="${x-30}" y="${y-30}" width="60" height="8" rx="2"/><path d="M${x-26} ${y-22} l-4 22 M${x+26} ${y-22} l4 22"/>`);
  if (t === 2) return sk(`<rect x="${x-62}" y="${y-86}" width="124" height="44" rx="14" style="fill:${c}"/><rect x="${x-72}" y="${y-64}" width="20" height="50" rx="9" style="fill:${D(c, .12)}"/><rect x="${x+52}" y="${y-64}" width="20" height="50" rx="9" style="fill:${D(c, .12)}"/>
      <rect x="${x-54}" y="${y-50}" width="53" height="22" rx="6" style="fill:${L(c, .15)}"/><rect x="${x+1}" y="${y-50}" width="53" height="22" rx="6" style="fill:${L(c, .15)}"/><rect x="${x-66}" y="${y-30}" width="132" height="18" rx="4" style="fill:${c}"/>`,
    `<rect x="${x-62}" y="${y-86}" width="124" height="44" rx="14"/><rect x="${x-72}" y="${y-64}" width="20" height="50" rx="9"/><rect x="${x+52}" y="${y-64}" width="20" height="50" rx="9"/><rect x="${x-54}" y="${y-50}" width="53" height="22" rx="6"/><rect x="${x+1}" y="${y-50}" width="53" height="22" rx="6"/>
    <rect x="${x-66}" y="${y-30}" width="132" height="18" rx="4"/><path d="M${x-58} ${y-12} v10 M${x+58} ${y-12} v10"/>`);
  const v = D(c, .18), fx = x + 10, fy = y + 34;
  return sk(`<path d="M${x-72} ${y-46} Q${x-74} ${y-94} ${x-38} ${y-90} Q${x} ${y-118} ${x+38} ${y-90} Q${x+74} ${y-94} ${x+72} ${y-46}z" style="fill:${v}"/>
      ${rows(2, r => rows(5, i => `<circle cx="${x-40 + i*20}" cy="${y-82 + r*16 + (i % 2)*0}" r="2.2" style="fill:${D(c, .4)}"/>`))}<path d="M${x-44} ${y-96} Q${x} ${y-112} ${x+30} ${y-96}" style="stroke:${CREAM};fill:none" stroke-width="4" opacity=".35"/>
      <rect x="${x-82}" y="${y-66}" width="24" height="52" rx="11" style="fill:${c}"/><rect x="${x+58}" y="${y-66}" width="24" height="52" rx="11" style="fill:${c}"/><ellipse cx="${x-70}" cy="${y-62}" rx="12" ry="8" style="fill:${L(c, .1)}"/><ellipse cx="${x+70}" cy="${y-62}" rx="12" ry="8" style="fill:${L(c, .1)}"/>
      <rect x="${x-60}" y="${y-52}" width="120" height="24" rx="8" style="fill:${c}"/><rect x="${x-74}" y="${y-30}" width="148" height="18" rx="5" style="fill:${v}"/>
      <path d="M${x-62} ${y-12} l-2 12 M${x+62} ${y-12} l2 12" style="stroke:${DARK}" stroke-width="4"/>
      <rect x="${fx-30}" y="${fy-24}" width="60" height="18" rx="7" style="fill:${c}"/><rect x="${fx-30}" y="${fy-10}" width="60" height="5" style="fill:${BRASS}"/><path d="M${fx-24} ${fy-5} v6 M${fx+24} ${fy-5} v6" style="stroke:${DARK}" stroke-width="4"/>`,
    `<path d="M${x-72} ${y-46} Q${x-74} ${y-94} ${x-38} ${y-90} Q${x} ${y-118} ${x+38} ${y-90} Q${x+74} ${y-94} ${x+72} ${y-46}"/><rect x="${x-82}" y="${y-66}" width="24" height="52" rx="11"/><rect x="${x+58}" y="${y-66}" width="24" height="52" rx="11"/>
    <ellipse cx="${x-70}" cy="${y-62}" rx="12" ry="8"/><ellipse cx="${x+70}" cy="${y-62}" rx="12" ry="8"/><rect x="${x-60}" y="${y-52}" width="120" height="24" rx="8"/><rect x="${x-74}" y="${y-30}" width="148" height="18" rx="5"/>
    <rect x="${fx-30}" y="${fy-24}" width="60" height="18" rx="7"/><path d="M${fx-30} ${fy-6} ${rows(10, i => "l3 5 l3 -5 ").trim()}" opacity=".6"/>`);
}
// a side-on chair at the end of a table, its back on the outside
const endChair = (cx, y, dir, wood, pad, ladder) => { const bx = cx - dir*12;
  return [`<rect x="${cx-12}" y="${y-30}" width="24" height="8" rx="3" style="fill:${pad || wood}"/><rect x="${bx-3}" y="${y-(ladder ? 80 : 64)}" width="6" height="${ladder ? 58 : 42}" rx="3" style="fill:${wood}"/>`,
    `<rect x="${cx-12}" y="${y-30}" width="24" height="8" rx="3"/><rect x="${bx-3}" y="${y-(ladder ? 80 : 64)}" width="6" height="${ladder ? 58 : 42}" rx="3"/>${ladder ? rows(3, i => `<path d="M${bx-5} ${y-72 + i*14} h10"/>`) : ""}<path d="M${cx-9} ${y-22} v22 M${cx+9} ${y-22} v22"/>`]; };
const backChair = (cx, y, wood, ladder) => [`<rect x="${cx-14}" y="${y-(ladder ? 104 : 90)}" width="28" height="${ladder ? 50 : 36}" rx="4" style="fill:${wood}"/>${ladder ? rows(3, i => `<rect x="${cx-11}" y="${y-96 + i*13}" width="22" height="6" rx="2" style="fill:${L(wood, .25)}"/>`) : ""}`,
  `<rect x="${cx-14}" y="${y-(ladder ? 104 : 90)}" width="28" height="${ladder ? 50 : 36}" rx="4"/>${ladder ? rows(3, i => `<rect x="${cx-11}" y="${y-96 + i*13}" width="22" height="6" rx="2"/>`) : `<path d="M${cx-7} ${y-84} v24 M${cx+7} ${y-84} v24" opacity=".5"/>`}`];
function table(x, y, t, c){
  const W = [0, 96, 130, 156][t], top = [0, PINE, "#C08D58", "#EAD7B4"][t], legC = [0, PINE, OAK, DARK][t];
  const parts = [];
  if (t === 2) parts.push(backChair(x - 30, y, OAK), backChair(x + 30, y, OAK));
  if (t === 3) parts.push(backChair(x - 40, y, DARK, true), backChair(x + 40, y, DARK, true));
  const leg = t === 3 ? 8 : 6;
  parts.push([`<rect x="${x-W/2}" y="${y-62}" width="${W}" height="18" rx="3" style="fill:${top}"/><rect x="${x-W/2 + 2}" y="${y-44}" width="${W - 4}" height="9" style="fill:${t === 3 ? DARK : D(top, .15)}"/>
      <rect x="${x-W/2 + 4}" y="${y-36}" width="${leg}" height="36" style="fill:${legC}"/><rect x="${x+W/2 - 4 - leg}" y="${y-36}" width="${leg}" height="36" style="fill:${legC}"/>
      ${t === 1 ? `<rect x="${x-16}" y="${y-60}" width="32" height="14" rx="2" style="fill:${L(c, .2)}"/>` : ""}${t === 3 ? `<rect x="${x-W/2 + 14}" y="${y-60}" width="${W - 28}" height="14" style="fill:${c}"/><path d="M${x+40} ${y-58} q-2 -16 6 -16 q8 0 6 16z" style="fill:${CREAM}"/><ellipse cx="${x-34}" cy="${y-58}" rx="14" ry="5" style="fill:#B07D4A"/><circle cx="${x-38}" cy="${y-62}" r="4" style="fill:#E3A27E"/><circle cx="${x-30}" cy="${y-62}" r="4" style="fill:#9DB08A"/>` : ""}`,
    `<rect x="${x-W/2}" y="${y-62}" width="${W}" height="18" rx="3"/><path d="M${x-W/2 + 2} ${y-35} h${W - 4}"/><rect x="${x-W/2 + 4}" y="${y-36}" width="${leg}" height="36"/><rect x="${x+W/2 - 4 - leg}" y="${y-36}" width="${leg}" height="36"/>
      ${t === 1 ? `<rect x="${x-16}" y="${y-60}" width="32" height="14" rx="2" stroke-dasharray="2 2"/>` : ""}${t === 3 ? `<rect x="${x-W/2 + 14}" y="${y-60}" width="${W - 28}" height="14"/><path d="M${x+40} ${y-58} q-2 -16 6 -16 q8 0 6 16z"/><ellipse cx="${x-34}" cy="${y-58}" rx="14" ry="5"/>` : `<path d="M${x-W/2 + 12} ${y-54} h${W/3}" opacity=".35"/>`}`]);
  const chairW = t === 1 ? c : t === 2 ? OAK : DARK, pad = t === 1 ? null : c;
  parts.push(endChair(x - W/2 - 16, y, 1, chairW, pad, t === 3), endChair(x + W/2 + 16, y, -1, chairW, pad, t === 3));
  return sk(parts.map(p => p[0]).join(""), parts.map(p => p[1]).join(""));
}
function shelf(x, y, t, c){
  const books = (bx, by, n, w) => rows(n, i => `<rect x="${bx + i*w/n}" y="${by - 20 + (i*7 % 5)}" width="${w/n - 1.5}" height="${20 - (i*7 % 5)}" style="fill:${["#C2505F", "#7FA0D0", "#9DB08A", "#F3C969", "#E3A5B0", "#8A6A52", "#F3E7C8"][(i*3 + n) % 7]}"/>`);
  if (t === 1) return sk(`<rect x="${x-44}" y="${y-118}" width="88" height="7" rx="2" style="fill:${PINE}"/><rect x="${x-44}" y="${y-78}" width="88" height="7" rx="2" style="fill:${PINE}"/>
      ${books(x - 40, y - 118, 5, 34)}<path d="M${x+6} ${y-118} v-14 h14 v14z M${x+24} ${y-118} q0 -16 8 -16 q8 0 8 16z" style="fill:${CREAM}"/><path d="M${x-36} ${y-78} q0 -18 10 -18 q10 0 10 18z" style="fill:${c}"/><rect x="${x-8}" y="${y-92}" width="12" height="14" rx="2" style="fill:#E3C58A"/><rect x="${x+12}" y="${y-90}" width="12" height="12" rx="2" style="fill:#C9D9C0"/>`,
    `<rect x="${x-44}" y="${y-118}" width="88" height="7" rx="2"/><rect x="${x-44}" y="${y-78}" width="88" height="7" rx="2"/><path d="M${x-34} ${y-111} l8 8 v-8 M${x+34} ${y-111} l-8 8 v-8 M${x-34} ${y-71} l8 8 v-8 M${x+34} ${y-71} l-8 8 v-8"/>
      <path d="M${x+6} ${y-118} v-14 h14 v14 M${x+24} ${y-118} q0 -16 8 -16 q8 0 8 16 M${x-36} ${y-78} q0 -18 10 -18 q10 0 10 18"/><rect x="${x-8}" y="${y-92}" width="12" height="14" rx="2"/><rect x="${x+12}" y="${y-90}" width="12" height="12" rx="2"/>`);
  if (t === 2) return sk(`<rect x="${x-36}" y="${y-126}" width="72" height="126" rx="3" style="fill:${c}"/><rect x="${x-28}" y="${y-118}" width="56" height="104" style="fill:${L(c, .55)}"/>
      ${books(x - 27, y - 86, 7, 54)}${books(x - 27, y - 50, 6, 40)}<circle cx="${x+20}" cy="${y-58}" r="6" style="fill:${CREAM}"/>${books(x - 27, y - 16, 8, 54)}<rect x="${x-40}" y="${y-132}" width="80" height="8" rx="2" style="fill:${D(c, .15)}"/>`,
    `<rect x="${x-36}" y="${y-126}" width="72" height="126" rx="3"/><rect x="${x-28}" y="${y-118}" width="56" height="104"/><path d="M${x-28} ${y-86} h56 M${x-28} ${y-50} h56 M${x-28} ${y-16} h56"/><rect x="${x-40}" y="${y-132}" width="80" height="8" rx="2"/><circle cx="${x+20}" cy="${y-58}" r="6"/>`);
  const plates = (px, py) => rows(2, i => `<circle cx="${px + i*14}" cy="${py}" r="6" style="fill:${CREAM}"/><circle cx="${px + i*14}" cy="${py}" r="3.4" style="fill:#7FA0D0"/>`);
  return sk(`<rect x="${x-40}" y="${y-60}" width="80" height="60" rx="3" style="fill:${c}"/><rect x="${x-44}" y="${y-66}" width="88" height="8" rx="2" style="fill:${OAK}"/>
      <rect x="${x-36}" y="${y-158}" width="72" height="92" style="fill:${D(c, .12)}"/><rect x="${x-40}" y="${y-166}" width="80" height="10" rx="2" style="fill:${D(c, .2)}"/>
      <rect x="${x-31}" y="${y-152}" width="29" height="80" style="fill:#EAF2F5"/><rect x="${x+2}" y="${y-152}" width="29" height="80" style="fill:#EAF2F5"/>
      ${plates(x - 23, y - 138)}${plates(x + 10, y - 138)}${plates(x - 23, y - 110)}${plates(x + 10, y - 110)}${rows(4, i => `<rect x="${(i < 2 ? x - 28 : x + 5) + (i % 2)*13}" y="${y-90}" width="9" height="14" rx="2" style="fill:${["#F3E7C8", "#C2505F", "#E3C58A", "#7FA0D0"][i]}"/>`)}
      <path d="M${x-26} ${y-150} l-5 18 M${x+8} ${y-150} l-5 18" style="stroke:${CREAM}" stroke-width="3" opacity=".7"/><path d="M${x+18} ${y-66} q-2 -16 7 -16 q9 0 7 16z" style="fill:${L(c, .5)}"/>`,
    `<rect x="${x-40}" y="${y-60}" width="80" height="60" rx="3"/><path d="M${x} ${y-58} v54"/><rect x="${x-35}" y="${y-54}" width="31" height="46" rx="2" opacity=".6"/><rect x="${x+4}" y="${y-54}" width="31" height="46" rx="2" opacity=".6"/><circle cx="${x-8}" cy="${y-32}" r="2"/><circle cx="${x+8}" cy="${y-32}" r="2"/>
      <rect x="${x-44}" y="${y-66}" width="88" height="8" rx="2"/><rect x="${x-36}" y="${y-158}" width="72" height="92"/><rect x="${x-40}" y="${y-166}" width="80" height="10" rx="2"/><rect x="${x-31}" y="${y-152}" width="29" height="80"/><rect x="${x+2}" y="${y-152}" width="29" height="80"/>
      <path d="M${x-31} ${y-124} h29 M${x+2} ${y-124} h29 M${x-31} ${y-96} h29 M${x+2} ${y-96} h29"/><circle cx="${x-4}" cy="${y-112}" r="1.6"/><circle cx="${x+4}" cy="${y-112}" r="1.6"/><path d="M${x+18} ${y-66} q-2 -16 7 -16 q9 0 7 16z"/>`);
}
const glow = (x, y, r, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#letglow)" opacity="${o}" pointer-events="none"/>`;
function lamp(x, y, t, c){
  if (t === 1) return glow(x, y - 100, 48, .5) + sk(`<path d="M${x} ${y} V${y-86}" style="stroke:${PINE}" stroke-width="4"/><path d="M${x-14} ${y} h28" style="stroke:${PINE}" stroke-width="4"/><circle cx="${x}" cy="${y-102}" r="18" style="fill:${L(c, .55)}"/>`,
    `<path d="M${x-2} ${y} V${y-84} M${x+2} ${y} V${y-84} M${x-14} ${y} h28"/><circle cx="${x}" cy="${y-102}" r="18"/><path d="M${x-17} ${y-108} q17 5 34 0 M${x-18} ${y-100} q18 5 36 0 M${x-15} ${y-92} q15 4 30 0" opacity=".5"/><path d="M${x} ${y-120} v-4"/>`);
  if (t === 2) return glow(x + 18, y - 96, 62, .6) + sk(`<ellipse cx="${x}" cy="${y-3}" rx="16" ry="5" style="fill:${BRASS}"/><path d="M${x} ${y-3} V${y-112} q0 -12 14 -12" style="stroke:${BRASS};fill:none" stroke-width="4"/><path d="M${x+4} ${y-104} h28 l-6 -24 h-16z" style="fill:${c}"/>`,
    `<ellipse cx="${x}" cy="${y-3}" rx="16" ry="5"/><path d="M${x} ${y-8} V${y-112} q0 -12 14 -12"/><path d="M${x+4} ${y-104} h28 l-6 -24 h-16z"/><path d="M${x+18} ${y-104} v6" opacity=".6"/>`);
  const seg = [c, "#F3C969", "#9DB08A", L(c, .4), "#F3C969", c];
  return glow(x, y - 74, 90, .75) + sk(`<ellipse cx="${x}" cy="${y-50}" rx="26" ry="7" style="fill:#C08D58"/><path d="M${x-6} ${y-46} V${y} M${x+6} ${y-46} V${y}" style="stroke:${OAK}" stroke-width="4"/><ellipse cx="${x}" cy="${y}" rx="18" ry="4" style="fill:${OAK}"/>
      <path d="M${x-8} ${y-54} q8 -6 16 0z" style="fill:#7A5A2A"/><path d="M${x} ${y-56} V${y-74}" style="stroke:#7A5A2A" stroke-width="4"/>
      ${seg.map((col, i) => `<path d="M${x-30 + i*10} ${y-72} L${x-26 + i*8.6} ${y-94 + Math.abs(i - 2.5)*1.4} L${x-26 + (i + 1)*8.6} ${y-94 + Math.abs(i - 1.5)*1.4} L${x-30 + (i + 1)*10} ${y-72}z" style="fill:${col}"/>`).join("")}<rect x="${x-32}" y="${y-74}" width="64" height="5" rx="2" style="fill:#7A5A2A"/><path d="M${x-26} ${y-94} Q${x} ${y-108} ${x+26} ${y-94}z" style="fill:${D(c, .25)}"/>`,
    `<ellipse cx="${x}" cy="${y-50}" rx="26" ry="7"/><path d="M${x-26} ${y-94} Q${x} ${y-108} ${x+26} ${y-94} L${x+30} ${y-72} H${x-30}z"/>${rows(5, i => `<path d="M${x-20 + i*10} ${y-72} L${x-17.4 + i*8.6} ${y-96}"/>`)}<path d="M${x-28} ${y-84} H${x+28}" opacity=".6"/><rect x="${x-32}" y="${y-74}" width="64" height="5" rx="2"/>`);
}
function rug(x, y, t, c){
  if (t === 1) { const cs = [c, "#F3E7C8", D(c, .25), "#E8C9A8", c, "#FFFDF6"];
    return `<g filter="url(#wob)">${cs.map((col, i) => `<ellipse cx="${x}" cy="${y}" rx="${80 - i*12}" ry="${32 - i*4.8}" style="fill:${col}"/>`).join("")}<ellipse cx="${x}" cy="${y}" rx="80" ry="32" fill="none" style="stroke:${LINE}" stroke-width="1.3"/>
      ${cs.map((_, i) => `<ellipse cx="${x}" cy="${y}" rx="${80 - i*12}" ry="${32 - i*4.8}" fill="none" style="stroke:${LINE}" stroke-width=".6" stroke-dasharray="2 5" opacity=".5"/>`).join("")}</g>`; }
  if (t === 2) return `<g filter="url(#wob)"><rect x="${x-104}" y="${y-38}" width="208" height="76" rx="3" style="fill:${L(c, .4)}"/>${[-30, -22, 18, 26].map(d => `<rect x="${x-104}" y="${y+d}" width="208" height="6" style="fill:${c}"/>`).join("")}
      <path d="M${x-96} ${y-4} ${rows(16, () => "l6 -6 l6 6 ").trim()}" fill="none" style="stroke:${D(c, .2)}" stroke-width="2"/><rect x="${x-104}" y="${y-38}" width="208" height="76" rx="3" fill="none" style="stroke:${LINE}" stroke-width="1.3"/>
      <path d="${rows(12, i => `M${x-104} ${y-34 + i*6.4} h-7 M${x+104} ${y-34 + i*6.4} h7 `)}" style="stroke:${LINE}" stroke-width=".9" opacity=".6"/></g>`;
  const deep = D(c, .35);
  return `<g filter="url(#wob)"><rect x="${x-124}" y="${y-48}" width="248" height="96" rx="3" style="fill:${deep}"/><rect x="${x-110}" y="${y-36}" width="220" height="72" style="fill:${c}"/><rect x="${x-104}" y="${y-30}" width="208" height="60" style="fill:${L(c, .2)}"/>
    ${rows(22, i => `<path d="M${x-118 + i*11} ${y-42} l4 -3 l4 3 l-4 3z M${x-118 + i*11} ${y+42} l4 -3 l4 3 l-4 3z" style="fill:#F3E7C8"/>`)}
    <path d="M${x-62} ${y} L${x} ${y-26} L${x+62} ${y} L${x} ${y+26}z" style="fill:${deep}"/><path d="M${x-40} ${y} L${x} ${y-16} L${x+40} ${y} L${x} ${y+16}z" style="fill:#F3E7C8"/><circle cx="${x}" cy="${y}" r="7" style="fill:#C2505F"/>
    ${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<path d="M${x + a*104} ${y + b*30} q${-a*22} 0 ${-a*28} ${-b*14} q${a*4} ${-b*2} ${a*28} ${-b*16}z" style="fill:${deep}"/>`).join("")}
    <rect x="${x-124}" y="${y-48}" width="248" height="96" rx="3" fill="none" style="stroke:${LINE}" stroke-width="1.3"/><rect x="${x-110}" y="${y-36}" width="220" height="72" fill="none" style="stroke:${LINE}" stroke-width=".8" opacity=".6"/>
    <path d="${rows(15, i => `M${x-124} ${y-44 + i*6.2} h-8 M${x+124} ${y-44 + i*6.2} h8 `)}" style="stroke:${LINE}" stroke-width=".9" opacity=".6"/></g>`;
}
function curtains(x, y, t, c){
  if (t === 1) { const cc = L(c, .2);
    return sk(`<rect x="${x-60}" y="${y-64}" width="24" height="122" style="fill:${cc}"/><rect x="${x+36}" y="${y-64}" width="24" height="122" style="fill:${cc}"/>`,
      `<path d="M${x-66} ${y-66} H${x+66}"/><rect x="${x-60}" y="${y-64}" width="24" height="122"/><rect x="${x+36}" y="${y-64}" width="24" height="122"/><path d="M${x-52} ${y-62} v118 M${x-44} ${y-62} v118 M${x+44} ${y-62} v118 M${x+52} ${y-62} v118" opacity=".35"/>`); }
  if (t === 2) { const cc = L(c, .3), panel = s => `M${x + s*68} ${y-66} H${x + s*30} Q${x + s*34} ${y} ${x + s*28} ${y+74} q${s*10} 4 ${s*20} 0 q${s*10} 4 ${s*20} 0 Q${x + s*70} ${y} ${x + s*68} ${y-66}z`;
    return sk(`<path d="${panel(-1)}" style="fill:${cc}"/><path d="${panel(1)}" style="fill:${cc}"/><rect x="${x-78}" y="${y-72}" width="156" height="6" rx="3" style="fill:${OAK}"/><circle cx="${x-80}" cy="${y-69}" r="6" style="fill:${OAK}"/><circle cx="${x+80}" cy="${y-69}" r="6" style="fill:${OAK}"/>`,
      `<path d="${panel(-1)}"/><path d="${panel(1)}"/><rect x="${x-78}" y="${y-72}" width="156" height="6" rx="3"/><circle cx="${x-80}" cy="${y-69}" r="6"/><circle cx="${x+80}" cy="${y-69}" r="6"/>
      <path d="M${x-58} ${y-62} q2 60 -2 130 M${x-46} ${y-62} q4 60 0 132 M${x+58} ${y-62} q-2 60 2 130 M${x+46} ${y-62} q-4 60 0 132" opacity=".35"/>${rows(4, i => `<circle cx="${x-62 + i*10}" cy="${y-66}" r="3"/><circle cx="${x+32 + i*10}" cy="${y-66}" r="3"/>`)}`); }
  const panel = s => `M${x + s*72} ${y-56} H${x + s*28} Q${x + s*30} ${y-10} ${x + s*56} ${y+12} Q${x + s*48} ${y+40} ${x + s*52} ${y+80} q${s*12} 4 ${s*24} 0 Q${x + s*74} ${y} ${x + s*72} ${y-56}z`;
  const flowers = s => rows(10, i => { const fx = x + s*(36 + (i % 3)*12 + (i > 5 ? 8 : 0)), fy = y - 46 + i*12; return `<circle cx="${fx}" cy="${fy}" r="3.4" style="fill:${["#C2505F", CREAM, "#F3C969"][i % 3]}"/><circle cx="${fx + s*4}" cy="${fy + 4}" r="2" style="fill:#7FA36E"/>`; });
  const val = `M${x-76} ${y-76} H${x+76} V${y-56} ${rows(8, () => "q-9.5 12 -19 0 ").trim()}z`;
  return sk(`<path d="${panel(-1)}" style="fill:${L(c, .2)}"/><path d="${panel(1)}" style="fill:${L(c, .2)}"/>${flowers(-1)}${flowers(1)}<path d="M${x-28} ${y-56} Q${x-30} ${y-10} ${x-56} ${y+12}" style="stroke:${CREAM};fill:none" stroke-width="3"/><path d="M${x+28} ${y-56} Q${x+30} ${y-10} ${x+56} ${y+12}" style="stroke:${CREAM};fill:none" stroke-width="3"/>
      <path d="${val}" style="fill:${c}"/><rect x="${x-62}" y="${y+6}" width="16" height="7" rx="3" style="fill:${BRASS}"/><rect x="${x+46}" y="${y+6}" width="16" height="7" rx="3" style="fill:${BRASS}"/><path d="M${x-54} ${y+13} l-3 14 h6z M${x+54} ${y+13} l-3 14 h6z" style="fill:${BRASS}"/>`,
    `<path d="${panel(-1)}"/><path d="${panel(1)}"/><path d="${val}"/><path d="M${x-76} ${y-66} H${x+76}" opacity=".4"/><rect x="${x-62}" y="${y+6}" width="16" height="7" rx="3"/><rect x="${x+46}" y="${y+6}" width="16" height="7" rx="3"/><path d="M${x-54} ${y+13} l-3 14 h6z M${x+54} ${y+13} l-3 14 h6z"/>`);
}
function picture(x, y, t, c){
  if (t === 1) return sk(`<rect x="${x-21}" y="${y-27}" width="42" height="54" style="fill:#5E5048"/><rect x="${x-17}" y="${y-23}" width="34" height="46" style="fill:${L(c, .5)}"/><rect x="${x-11}" y="${y-17}" width="22" height="34" style="fill:${CREAM}"/>
      <path d="M${x} ${y+14} V${y-12}" style="stroke:#6F9A5E" stroke-width="1.6"/><path d="M${x} ${y+4} q-8 -2 -8 -8 q6 0 8 6z M${x} ${y-2} q8 -2 8 -8 q-6 0 -8 6z" style="fill:#9DB08A"/><circle cx="${x}" cy="${y-13}" r="3.5" style="fill:#C2505F"/>`,
    `<path d="M${x} ${y-40} l-14 13 M${x} ${y-40} l14 13"/><rect x="${x-21}" y="${y-27}" width="42" height="54"/><rect x="${x-11}" y="${y-17}" width="22" height="34"/>`);
  if (t === 2) return sk(`<rect x="${x-38}" y="${y-28}" width="76" height="56" style="fill:#D9B98A"/><rect x="${x-33}" y="${y-23}" width="66" height="46" style="fill:${CREAM}"/><rect x="${x-26}" y="${y-16}" width="52" height="32" style="fill:#E3EEF2"/>
      <path d="M${x-26} ${y+2} q14 -8 26 -2 q14 -8 26 -2 v18 h-52z" style="fill:#A9C79A"/><path d="M${x-10} ${y+16} q4 -8 14 -10 q10 -2 14 -6 l4 2 q-6 6 -16 8 q-8 2 -10 6z" style="fill:#8FC1DE"/><circle cx="${x-16}" cy="${y-2}" r="6" style="fill:#7FA36E"/><path d="M${x-16} ${y+4} v6" style="stroke:#8A6A52" stroke-width="1.5"/>`,
    `<path d="M${x} ${y-42} l-24 14 M${x} ${y-42} l24 14"/><rect x="${x-38}" y="${y-28}" width="76" height="56"/><rect x="${x-26}" y="${y-16}" width="52" height="32"/>`);
  return glow(x, y - 30, 70, .35) + sk(`<rect x="${x-56}" y="${y-42}" width="112" height="82" rx="3" style="fill:${BRASS}"/><rect x="${x-48}" y="${y-34}" width="96" height="66" style="fill:#A87E2A"/><rect x="${x-44}" y="${y-30}" width="88" height="58" style="fill:#F5C99A"/>
      <rect x="${x-44}" y="${y-30}" width="88" height="20" style="fill:#F3B07E"/><path d="M${x-44} ${y-4} q24 -14 44 -6 q22 -12 44 -2 v40 h-88z" style="fill:#9DB08A"/><path d="M${x-44} ${y+6} q44 -14 88 0 v22 h-88z" style="fill:#7FA36E"/>
      ${rows(5, i => `<path d="M${x-40} ${y+10 + i*4} Q${x} ${y+2 + i*5} ${x+40} ${y+10 + i*4}" style="stroke:#4E7A44;fill:none" stroke-dasharray="3 2" stroke-width="2"/>`)}<path d="M${x+28} ${y+4} q-4 -18 2 -26 q6 8 2 26z" style="fill:#4E6A3E"/><rect x="${x-26}" y="${y-12}" width="12" height="8" style="fill:#F3E7C8"/><path d="M${x-28} ${y-12} l8 -6 l8 6z" style="fill:#C2505F"/><circle cx="${x+18}" cy="${y-20}" r="6" style="fill:#FFE6A8"/>
      ${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<circle cx="${x + a*52}" cy="${y - 1 + b*37}" r="5" style="fill:#E8C25A"/>`).join("")}<rect x="${x-18}" y="${y-56}" width="36" height="6" rx="3" style="fill:${BRASS}"/>`,
    `<rect x="${x-56}" y="${y-42}" width="112" height="82" rx="3"/><rect x="${x-48}" y="${y-34}" width="96" height="66"/><rect x="${x-44}" y="${y-30}" width="88" height="58"/><path d="M${x} ${y-50} v8"/><rect x="${x-18}" y="${y-56}" width="36" height="6" rx="3"/>
      ${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<circle cx="${x + a*52}" cy="${y - 1 + b*37}" r="5"/>`).join("")}`);
}
function plantP(x, y, t, c){
  if (t === 1) { const fl = D(c, .1);
    return sk(`<path d="M${x-15} ${y-26} h30 l-4 26 h-22z" style="fill:#D98A5E"/><rect x="${x-17}" y="${y-30}" width="34" height="7" rx="2" style="fill:#E3A27E"/>
      ${[[-12, -40], [10, -42], [0, -50], [-6, -34], [14, -32]].map(([dx, dy]) => `<circle cx="${x+dx}" cy="${y+dy}" r="8" style="fill:#7FA36E"/>`).join("")}${[[-10, -56], [8, -60], [-2, -66]].map(([dx, dy]) => `<circle cx="${x+dx}" cy="${y+dy}" r="7" style="fill:${fl}"/><circle cx="${x+dx}" cy="${y+dy}" r="2" style="fill:${CREAM}"/>`).join("")}`,
      `<path d="M${x-15} ${y-26} h30 l-4 26 h-22z"/><rect x="${x-17}" y="${y-30}" width="34" height="7" rx="2"/><path d="M${x-10} ${y-48} v-6 M${x+8} ${y-48} v-10 M${x} ${y-52} v-8" opacity=".5"/>${[[-10, -56], [8, -60], [-2, -66]].map(([dx, dy]) => `<circle cx="${x+dx}" cy="${y+dy}" r="7"/>`).join("")}`); }
  if (t === 2) { const fr = [[-1, 40, 30], [1, 40, 30], [-1, 26, 46], [1, 26, 46], [0, 0, 52]];
    const frond = ([s, dx, h]) => `M${x} ${y-74} Q${x + s*dx*.4} ${y-74-h} ${x + s*dx} ${y-74-h*.4 + (s ? 0 : -h*.5)}`;
    return sk(`<path d="M${x-16} ${y-50} L${x-20} ${y} M${x+16} ${y-50} L${x+20} ${y}" style="stroke:${OAK}" stroke-width="4"/><rect x="${x-22}" y="${y-54}" width="44" height="7" rx="2" style="fill:${OAK}"/><path d="M${x-18} ${y-22} h36" style="stroke:${OAK}" stroke-width="3"/>
      <path d="M${x-16} ${y-76} h32 l-4 22 h-24z" style="fill:${c}"/>${fr.map(f => `<path d="${frond(f)}" style="stroke:#6F9A5E;fill:none" stroke-width="6" stroke-linecap="round"/><path d="${frond(f)}" style="stroke:#9EBE8C;fill:none" stroke-width="2.5" stroke-dasharray="1 3" stroke-linecap="round"/>`).join("")}`,
      `<path d="M${x-16} ${y-76} h32 l-4 22 h-24z"/><rect x="${x-22}" y="${y-54}" width="44" height="7" rx="2"/><path d="M${x-16} ${y-47} L${x-20} ${y} M${x+16} ${y-47} L${x+20} ${y}"/>${fr.map(f => `<path d="${frond(f)}" opacity=".6"/>`).join("")}`); }
  const leaves = [[-22, -128, 22], [20, -132, 22], [0, -150, 22], [-30, -108, 16], [30, -110, 16], [0, -118, 22], [-12, -140, 16], [14, -150, 14]];
  const lemons = [[-18, -116], [16, -126], [4, -140], [-26, -136], [26, -104]];
  return `<g transform="translate(${x} ${y}) scale(.84) translate(${-x} ${-y})">` + sk(`<rect x="${x-26}" y="${y-46}" width="52" height="46" rx="3" style="fill:${c}"/><rect x="${x-30}" y="${y-50}" width="60" height="8" rx="2" style="fill:${D(c, .15)}"/><circle cx="${x-26}" cy="${y-52}" r="4" style="fill:${D(c, .15)}"/><circle cx="${x+26}" cy="${y-52}" r="4" style="fill:${D(c, .15)}"/>
      <path d="M${x} ${y-50} V${y-110}" style="stroke:#8A6A52" stroke-width="5"/>${leaves.map(([dx, dy, r]) => `<circle cx="${x+dx}" cy="${y+dy}" r="${r}" style="fill:${["#6F9A5E", "#7FA36E", "#5E8A48"][Math.abs(dx) % 3]}"/>`).join("")}
      ${lemons.map(([dx, dy]) => `<ellipse cx="${x+dx}" cy="${y+dy}" rx="6" ry="4.6" style="fill:#F3D34A"/>`).join("")}${[[-6, -160], [24, -140], [-34, -122]].map(([dx, dy]) => `<circle cx="${x+dx}" cy="${y+dy}" r="2.4" style="fill:${CREAM}"/>`).join("")}`,
    `<rect x="${x-26}" y="${y-46}" width="52" height="46" rx="3"/><rect x="${x-18}" y="${y-38}" width="36" height="30" rx="2" opacity=".5"/><rect x="${x-30}" y="${y-50}" width="60" height="8" rx="2"/><path d="M${x-44} ${y-118} q-6 -30 16 -40 q14 -22 40 -10 q26 -2 26 26 q16 18 0 34" opacity=".6"/>
      ${lemons.map(([dx, dy]) => `<ellipse cx="${x+dx}" cy="${y+dy}" rx="6" ry="4.6"/>`).join("")}`) + `</g>`;
}
function touches(x, y, t, c){
  if (t === 1) return sk(`<ellipse cx="${x}" cy="${y-30}" rx="16" ry="5" style="fill:${OAK}"/><path d="M${x-10} ${y-28} l-4 28 M${x+10} ${y-28} l4 28 M${x} ${y-26} v26" style="stroke:${OAK}" stroke-width="3"/>
      <path d="M${x-8} ${y-34} v-18 h16 v18z" style="fill:#D6E8F2" opacity=".85"/>${[[-12, -66, "#7FA0D0"], [0, -72, CREAM], [10, -64, "#C2505F"], [-4, -60, c], [6, -76, "#F3C969"]].map(([dx, dy, col]) => `<path d="M${x} ${y-50} L${x+dx} ${y+dy}" style="stroke:#6F9A5E" stroke-width="1.4"/><circle cx="${x+dx}" cy="${y+dy}" r="4" style="fill:${col}"/>`).join("")}`,
    `<ellipse cx="${x}" cy="${y-30}" rx="16" ry="5"/><path d="M${x-8} ${y-34} v-18 h16 v18z"/><path d="M${x-9} ${y-46} h18" opacity=".5"/>`);
  if (t === 2) return sk(`<path d="M${x-24} ${y-30} h48 l-4 30 h-40z" style="fill:#D9B97E"/><path d="M${x-22} ${y-30} q4 -22 22 -20 q18 -2 22 20z" style="fill:${c}"/><path d="M${x+16} ${y-30} q8 10 4 24 l-8 -2 q2 -12 -4 -22z" style="fill:${D(c, .12)}"/>
      <rect x="${x-56}" y="${y-30}" width="28" height="28" rx="7" transform="rotate(-10 ${x-42} ${y-16})" style="fill:${L(c, .3)}"/><rect x="${x+28}" y="${y-28}" width="26" height="26" rx="7" transform="rotate(8 ${x+41} ${y-15})" style="fill:${CREAM}"/><path d="M${x+30} ${y-16} h22" style="stroke:${c}" stroke-width="4" transform="rotate(8 ${x+41} ${y-15})"/>`,
    `<path d="M${x-24} ${y-30} h48 l-4 30 h-40z"/><path d="M${x-22} ${y-20} h44 M${x-21} ${y-10} h42" opacity=".4"/><path d="M${x-22} ${y-30} q4 -22 22 -20 q18 -2 22 20"/>${rows(4, i => `<path d="M${x+18 + i*1.5} ${y-6} v5"/>`)}
      <rect x="${x-56}" y="${y-30}" width="28" height="28" rx="7" transform="rotate(-10 ${x-42} ${y-16})"/><rect x="${x+28}" y="${y-28}" width="26" height="26" rx="7" transform="rotate(8 ${x+41} ${y-15})"/>`);
  return sk(`<rect x="${x-40}" y="${y-30}" width="80" height="9" rx="3" style="fill:${OAK}"/><path d="M${x-34} ${y-21} V${y} M${x+34} ${y-21} V${y}" style="stroke:${DARK}" stroke-width="5"/>
      <rect x="${x-8}" y="${y-36}" width="44" height="7" rx="3" style="fill:${c}"/><ellipse cx="${x+10}" cy="${y-46}" rx="11" ry="10" style="fill:${CREAM}"/><path d="M${x+2} ${y-50} h16" style="stroke:${c}" stroke-width="3"/><path d="M${x+21} ${y-48} l8 -6" style="stroke:${CREAM}" stroke-width="3"/><rect x="${x+26}" y="${y-42}" width="8" height="7" rx="2" style="fill:${CREAM}"/>
      <path d="M${x-30} ${y-30} q-4 -14 4 -18 q8 4 4 18z" style="fill:#7FA0D0"/>${[[-38, -60, "#F3C969"], [-28, -66, CREAM], [-18, -58, "#C2505F"]].map(([dx, dy, col]) => `<path d="M${x-26} ${y-46} L${x+dx} ${y+dy}" style="stroke:#6F9A5E" stroke-width="1.4"/><circle cx="${x+dx}" cy="${y+dy}" r="4.4" style="fill:${col}"/>`).join("")}
      <path d="M${x+46} ${y-22} h34 l-3 22 h-28z" style="fill:#D9B97E"/>${[[50, "#C2505F"], [57, "#7FA0D0"], [64, "#F3C969"], [71, "#9DB08A"]].map(([dx, col], i) => `<rect x="${x+dx}" y="${y-34 + i % 2*3}" width="6" height="14" style="fill:${col}"/>`).join("")}`,
    `<rect x="${x-40}" y="${y-30}" width="80" height="9" rx="3"/><rect x="${x-8}" y="${y-36}" width="44" height="7" rx="3"/><ellipse cx="${x+10}" cy="${y-46}" rx="11" ry="10"/><path d="M${x+10} ${y-56} v-3"/><rect x="${x+26}" y="${y-42}" width="8" height="7" rx="2"/><path d="M${x-30} ${y-30} q-4 -14 4 -18 q8 4 4 18z"/>
      <path d="M${x+46} ${y-22} h34 l-3 22 h-28z"/><path d="M${x+47} ${y-12} h32" opacity=".4"/>`);
}
// brown-paper parcels tied with string, waiting in the hall
function parcels(n, x, y){
  n = Math.min(6, n || 0); if (!n) return "";
  const spots = [[-26, 0, 24, 18], [0, 0, 24, 20], [26, 0, 22, 16], [-13, -20, 22, 16], [13, -20, 24, 18], [0, -38, 20, 14]].slice(0, n);
  return sk(spots.map(([dx, dy, w, h]) => `<rect x="${x+dx-w/2}" y="${y+dy-h}" width="${w}" height="${h}" rx="2" style="fill:#C9A06E"/><rect x="${x+dx+2}" y="${y+dy-h+3}" width="7" height="5" style="fill:${CREAM}"/>`).join(""),
    spots.map(([dx, dy, w, h]) => `<rect x="${x+dx-w/2}" y="${y+dy-h}" width="${w}" height="${h}" rx="2"/><path d="M${x+dx} ${y+dy-h} v${h} M${x+dx-w/2} ${y+dy-h/2} h${w}" style="stroke:#8A5A3A" stroke-width="1.1"/><path d="M${x+dx} ${y+dy-h} q-4 -5 -6 -1 q2 3 6 1 q4 -5 6 -1 q-2 3 -6 1" style="stroke:#8A5A3A" stroke-width="1"/>`).join(""));
}

const DRAW = {seat, table, shelf, lamp, rug, curtains, picture, plant: plantP, touches};
const FLAT = {rug: 0, curtains: 1, picture: 1};   // drawn first, in this order; everything else by how far forward it stands
export function letFurniture(id, slots, pos, n, up = false){
  const C = COTTAGES[id]; if (!C) return "";
  slots = Object.fromEntries(Object.entries(slots).filter(([s]) => C.up.includes(s) === up));
  const tint = p => (COLOURS[p.col] || COLOURS.cream)[1];
  const items = Object.keys(slots).filter(s => pos[s] && slots[s]).map(s => ({s, cat: catOf(id, s), p: slots[s], at: pos[s]}));
  const bedFor = s => s.replace("linen", "bed");
  items.forEach(it => { it.z = it.cat in FLAT ? -1000 + FLAT[it.cat] : (it.cat === "linen" && slots[bedFor(it.s)] ? pos[bedFor(it.s)][1] + .5 : it.at[1]); });
  items.sort((a, b) => a.z - b.z);
  let h = `<defs><radialGradient id="letglow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".9"/><stop offset=".45" stop-color="#FFD27A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>`;
  for (const it of items) {
    const [x, y] = it.at, t = Math.max(1, Math.min(3, it.p.tier || 1)), c = tint(it.p);
    if (it.cat === "bed") {
      const b = bed(x, y, t), ls = it.s.replace("bed", "linen"), lp = slots[ls];
      h += b.back + (lp ? linen(x, y - (t === 2 ? 4 : 0), Math.max(1, Math.min(3, lp.tier || 1)), tint(lp), true) : "") + b.front;
    } else if (it.cat === "linen") { if (!slots[bedFor(it.s)]) h += linen(x, y, t, c, false); }
    else if (DRAW[it.cat]) h += DRAW[it.cat](x, y, t, c);
  }
  return `<g pointer-events="none">${h}</g>` + (up ? "" : parcels(n, 340, 584));
}
// the hall table: a console with the guest book, a pen, a little vase and the catalogue
export const hallTable = (x, y) => sk(`<rect x="${x-50}" y="${y-44}" width="100" height="8" rx="2" style="fill:#9A6E48"/><rect x="${x-46}" y="${y-36}" width="92" height="12" style="fill:${OAK}"/><rect x="${x-10}" y="${y-33}" width="20" height="6" rx="2" style="fill:#C08D58"/>
    <path d="M${x-42} ${y-24} V${y} M${x+42} ${y-24} V${y}" style="stroke:${DARK}" stroke-width="5"/><path d="M${x-42} ${y-8} H${x+42}" style="stroke:${DARK}" stroke-width="3"/>
    <path d="M${x-40} ${y-46} l2 -8 h17 l2 8z M${x-19} ${y-46} l2 -8 h17 l2 8z" style="fill:${CREAM}"/><path d="M${x-20} ${y-54} v12" style="stroke:#C2505F" stroke-width="2"/>
    <path d="M${x-6} ${y-48} l14 -6" style="stroke:#2F3B73" stroke-width="2.4"/><rect x="${x+8}" y="${y-50}" width="18" height="6" rx="1" style="fill:#7FA0D0"/><rect x="${x+11}" y="${y-49}" width="9" height="2" style="fill:${CREAM}"/>
    <path d="M${x+32} ${y-46} q-6 0 -5 -8 q1 -5 4 -6 h2 q3 1 4 6 q1 8 -5 8z" style="fill:#E3EEF2"/><path d="M${x+33} ${y-58} q-6 -8 -10 -10 M${x+33} ${y-58} q4 -10 8 -12 M${x+33} ${y-58} v-12" style="stroke:#6F9A5E;fill:none" stroke-width="1.4"/>
    <circle cx="${x+23}" cy="${y-68}" r="3" style="fill:#F3C969"/><circle cx="${x+41}" cy="${y-70}" r="3" style="fill:#E3A5B0"/><circle cx="${x+33}" cy="${y-71}" r="3" style="fill:${CREAM}"/>`,
  `<rect x="${x-50}" y="${y-44}" width="100" height="8" rx="2"/><rect x="${x-46}" y="${y-36}" width="92" height="12"/><rect x="${x-10}" y="${y-33}" width="20" height="6" rx="2"/><path d="M${x-42} ${y-24} V${y} M${x+42} ${y-24} V${y}"/>
    <path d="M${x-40} ${y-46} l2 -8 h17 l2 8z M${x-19} ${y-46} l2 -8 h17 l2 8z"/><path d="M${x-36} ${y-51} h12 M${x-15} ${y-51} h12" opacity=".5"/><rect x="${x+8}" y="${y-50}" width="18" height="6" rx="1"/><path d="M${x+32} ${y-46} q-6 0 -5 -8 q1 -5 4 -6 h2 q3 1 4 6 q1 8 -5 8z"/>`);
