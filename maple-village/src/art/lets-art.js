// Elena's cottages, inside (round 219; redrawn to scale in round 222): Bluebell and Fig Tree, the shells plus whatever
// you've furnished them with. Everything is drawn to the size of the player, who stands P = 64 units from her feet to
// the top of her head (about 1.65 m): a bath is about 68 long, a double bed 54 wide, a sofa 78, a door 80 tall. The back
// wall comes down to WALL; a piece that stands against it has its base a little in front (WALL + 10 to 20), and a bed's
// headboard is against it. Every piece comes in three tiers (simple, good, fine) and is tinted with its colour. The
// window in each shell sits where COTTAGES[id].slots.curtains says, so the curtains always hang on it.
import { COLOURS, COTTAGES, catOf, floorOf } from "../data/lets.js";

const rows = (n, f) => Array.from({length: n}, (_, i) => f(i)).join("");
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*t).toString(16).padStart(2, "0")).join(""); };
const L = (c, t) => mix(c, "#FFFDF6", t), D = (c, t) => mix(c, "#3A2E28", t);
const PINE = "#E3C38C", OAK = "#B07D4A", DARK = "#7A5638", BRASS = "#D4A93A", CREAM = "#FFFDF6", LINE = "#3A2E28";
const WATER = "#C4E0EC", PORC = "#F7F6F1", CHROME = "#C9D3D9";
export const P = 64;      // the player's height, feet to the top of her head
const WALL = 172;         // the back wall runs down to here; the floor starts below

// The hand-drawn look: a wobbly fill and a wobbly ink line. Pieces drawn at full size use a finer wobble than the rest
// of the village (they're small); older pieces drawn big and scaled down with `sc` keep the village's own filters,
// which shrink with them, and their ink is thickened back up so every line in the room is the same weight.
let SC = 1;
const sk = (art, lines) => SC === 1
  ? `<g filter="url(#letmk)">${art}</g><g filter="url(#letwob)" fill="none" style="stroke:var(--line)" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round">${lines}</g>`
  : `<g filter="url(#marker)">${art}</g><g filter="url(#wob)" fill="none" style="stroke:var(--line)" stroke-width="${(1.15/SC).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">${lines}</g>`;
// draw f() (made around (x, y)) at scale s, standing at (tx, ty)
// (s can be [sx, sy] for flat things on the floor, which are seen more steeply than they're drawn)
const sc = (x, y, s, f, tx = x, ty = y) => { const o = SC, [sx, sy] = Array.isArray(s) ? s : [s, s]; SC = SC*Math.sqrt(sx*sy); try { return `<g transform="translate(${tx} ${ty}) scale(${sx} ${sy}) translate(${-x} ${-y})">${f()}</g>`; } finally { SC = o; } };
// shapes filled with their colours, then the same shapes inked: [svg, fill] (fill null: ink only; third item 0: fill only)
const shp = (list, xa = "", xl = "") => sk(list.map(([s, f]) => f ? s.replace(/\/>$/, ` style="fill:${f}"/>`) : "").join("") + xa, list.map(([s, , o]) => o === 0 ? "" : s).join("") + xl);
const R = (x, y, w, h, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ""}/>`;
const E = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const Pa = d => `<path d="${d}"/>`;
const st = (d, col, w, extra = "") => `<path d="${d}" style="stroke:${col};fill:none" stroke-width="${w}"${extra}/>`;
const glow = (x, y, r, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#letglow)" opacity="${o}" pointer-events="none"/>`;
const DEFS = `<defs><filter id="letmk" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="2" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="1.3 0.14" numOctaves="2" seed="2" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .35  0 0 0 0 .16  0 0 0 0 .06  0 0 0 1.1 -.45" result="ga"/>
  <feComposite in="ga" in2="d" operator="in" result="streaks"/><feMerge><feMergeNode in="d"/><feMergeNode in="streaks"/></feMerge></filter>
  <filter id="letwob" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.4"/></filter>
  <radialGradient id="letglow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".9"/><stop offset=".45" stop-color="#FFD27A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
  <radialGradient id="gdnglow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".8"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>`;
const tape = (x, y, t) => `<g pointer-events="none"><rect x="${x - t.length*3.2 - 8}" y="${y - 10}" width="${t.length*6.4 + 16}" height="17" rx="2" fill="#F3E1A0" opacity=".95"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-family="Klee One,serif" font-size="10" fill="#3A2E28">${t}</text></g>`;

// ---------- the rooms' bones ----------
const boards = (fill, line) => `<rect width="520" height="640" style="fill:${fill}"/><g opacity=".45" style="stroke:${line}" stroke-width="1">${rows(26, i => `<path d="M0 ${WALL + 6 + i*18} H520"/>`)}${rows(26, i => rows(3, k => `<path d="M${(i*53 + k*173 + 29) % 520} ${WALL + 6 + i*18} v18"/>`))}</g>`;
const flags = () => `<rect width="520" height="640" style="fill:#D9BD96"/><g style="fill:#E0C7A2" opacity=".7">${rows(30, i => { const r = (i*7) % 17, k = (i*5 + r) % 11; return `<rect x="${k*48 + (r % 2)*24 + 3}" y="${WALL + 4 + r*28 + 3}" width="42" height="22" rx="3"/>`; })}</g>
  <g opacity=".5" style="stroke:#BE9E74" stroke-width="1.1" fill="none">${rows(17, r => `<path d="M0 ${WALL + 4 + r*28} H520"/>${rows(12, c => `<path d="M${c*48 + (r % 2)*24} ${WALL + 4 + r*28} v28"/>`)}`)}</g>`;
const terracotta = () => `<rect width="520" height="640" style="fill:#C98B6B"/><g style="fill:#D49A78" opacity=".6">${rows(40, i => { const r = (i*7) % 23, k = (i*3 + r) % 26; return `<rect x="${k*20 + 2}" y="${WALL + 4 + r*20 + 2}" width="16" height="16"/>`; })}</g>
  <g opacity=".55" style="stroke:#A0664A" stroke-width="1.1">${rows(24, r => `<path d="M0 ${WALL + 4 + r*20} H520"/>`)}${rows(26, k => `<path d="M${k*20} ${WALL + 4} V640"/>`)}</g>`;
// a chequered tile floor, laid on the diagonal
const chequer = (a, b) => `<rect width="520" height="640" style="fill:${a}"/><g style="fill:${b}" opacity=".75">${rows(24, r => rows(14, k => `<path d="M${k*40 + (r % 2)*20} ${WALL + 4 + r*20} l10 -10 l10 10 l-10 10z"/>`))}</g>`;
const sprigs = (y0, n, col) => `<g style="fill:none;stroke:${col}" stroke-width="1" opacity=".75">${rows(n, r => rows(20, i => `<path transform="translate(${i*26 + (r % 2)*13 + 6} ${y0 + r*18})" d="M0 0 l-2 -3.5 M0 0 l2 -3.5 M0 0 v3"/>`))}</g>`;
const skirting = col => sk(`<rect y="${WALL - 6}" width="520" height="6" style="fill:${col}"/>`, `<path d="M0 ${WALL - 6} H520"/>`);

// a cottage casement: 52 x 62 of glass with glazing bars, a frame in the trim colour and a sill (the curtains fit it)
const WW = 52, WH = 62;
const windowArt = (x, y, trim, view) => { const X = x - WW/2, Y = y - WH/2;
  return sk(`<rect x="${X-4}" y="${Y-4}" width="${WW+8}" height="${WH+8}" rx="2" style="fill:${trim}"/><rect x="${X}" y="${Y}" width="${WW}" height="${WH}" style="fill:#D6E8F2"/>${view(X, Y)}<rect x="${X-7}" y="${Y+WH+3}" width="${WW+14}" height="5" rx="1.5" style="fill:${CREAM}"/>`,
    `<rect x="${X-4}" y="${Y-4}" width="${WW+8}" height="${WH+8}" rx="2"/><rect x="${X}" y="${Y}" width="${WW}" height="${WH}"/><path d="M${x} ${Y} v${WH} M${X} ${Y + WH/3} h${WW} M${X} ${Y + 2*WH/3} h${WW}"/><rect x="${X-7}" y="${Y+WH+3}" width="${WW+14}" height="5" rx="1.5"/>`); };
const hills = (X, Y) => `<path d="M${X} ${Y+38} q15 -12 28 -4 q12 -7 24 -2 V${Y+WH} H${X}z" style="fill:#A9C79A"/><path d="M${X} ${Y+48} q22 -9 52 -4 V${Y+WH} H${X}z" style="fill:#8FB383"/><ellipse cx="${X+36}" cy="${Y+11}" rx="7" ry="3" style="fill:${CREAM}"/>`;
const garden = (X, Y) => `<rect x="${X}" y="${Y+36}" width="${WW}" height="${WH-36}" style="fill:#B9D2A6"/><path d="M${X+WW} ${Y+6} q-12 4 -15 14 q8 -2 15 -1z M${X+WW} ${Y+26} q-15 0 -20 12 q10 0 20 -4z" style="fill:#6F9A5E"/><path d="M${X} ${Y+14} q10 2 13 13 q-7 -1 -13 -4z" style="fill:#7FA36E"/><circle cx="${X+40}" cy="${Y+22}" r="2.4" style="fill:#7B5A7A"/>`;
// a dormer window under the eaves (40 x 46), set into a little recess
const dormer = (x, y, trim) => sk(`<path d="M${x-30} ${y+30} V${y-30} L${x} ${y-50} L${x+30} ${y-30} V${y+30}z" style="fill:#E9EEF2"/><rect x="${x-24}" y="${y-27}" width="48" height="54" rx="2" style="fill:${trim}"/><rect x="${x-20}" y="${y-23}" width="40" height="46" style="fill:#D6E8F2"/>
    <path d="M${x-20} ${y+6} q12 -8 22 -2 q10 -5 18 -1 v20 h-40z" style="fill:#A9C79A"/><rect x="${x-27}" y="${y+27}" width="54" height="5" rx="1.5" style="fill:${CREAM}"/>`,
  `<path d="M${x-30} ${y+30} V${y-30} L${x} ${y-50} L${x+30} ${y-30} V${y+30}" opacity=".6"/><rect x="${x-24}" y="${y-27}" width="48" height="54" rx="2"/><rect x="${x-20}" y="${y-23}" width="40" height="46"/><path d="M${x} ${y-23} v46 M${x-20} ${y} h40"/><rect x="${x-27}" y="${y+27}" width="54" height="5" rx="1.5"/>`);
// a wall light: a brass bracket and a little pleated shade, lit
const sconce = (x, y) => glow(x, y + 2, 26, .45) + shp([[Pa(`M${x} ${y+12} v-6 q0 -3 3 -3`), null], [R(x-2, y+10, 4, 6, 1), BRASS], [Pa(`M${x-6} ${y+3} h12 l-2 -8 h-8z`), "#F6E7C4"]]);
// a small cast-iron radiator, on the wall just above the floor
const radiator = (x, y, w, col) => shp([[R(x, y, w, 20, 2), col]], "", rows(Math.floor(w/5) - 1, i => `<path d="M${x + 5 + i*5} ${y + 2} v16" opacity=".5"/>`) + `<path d="M${x + 2} ${y + 20} v4 M${x + w - 2} ${y + 20} v4"/>`);

// the stairs up the left wall of the sitting room, seen side-on: twelve steps, a handrail and a cupboard under
const tapeTop = (x, y, t) => tape(x, y, t);
function stairsUp(){
  const X = 24, B = 612, RW = 10, RH = 8, N = 12, top = B - N*RH, prof = `M${X} ${B} ${rows(N, k => `V${B - (k + 1)*RH} H${X + (k + 1)*RW}`)} V${B} Z`;
  // mirrored, so the flight rises to the left towards the wall and you step on at the right-hand end
  return `<g data-letstairs="1" aria-label="Up the stairs to the bedroom"><ellipse class="hov" cx="${X + 62}" cy="${B - 4}" rx="66" ry="12" style="fill:var(--butter)"/>
    <g transform="translate(${2*X + N*RW} 0) scale(-1 1)">${sk(`<path d="${prof}" style="fill:#8A6340"/>${rows(N, k => `<rect x="${X + k*RW - 1}" y="${B - (k + 1)*RH - 1.5}" width="${RW + 2}" height="3" rx="1" style="fill:#B9875E"/>`)}
      <rect x="${X + N*RW - 36}" y="${B - 46}" width="26" height="46" rx="1" style="fill:#9A6E48"/><circle cx="${X + N*RW - 31}" cy="${B - 24}" r="1.6" style="fill:${BRASS}"/>
      ${rows(N, k => `<path d="M${X + k*RW + RW/2} ${B - (k + 1)*RH - 1} V${B - (k + 1)*RH - 32}" style="stroke:#6B4A2E" stroke-width="1.6"/>`)}
      <path d="M${X + 3} ${B - 40} L${X + N*RW} ${top - 34}" style="stroke:#5A3A2A" stroke-width="3" stroke-linecap="round"/><rect x="${X - 2}" y="${B - 44}" width="6" height="44" rx="1.5" style="fill:#6B4A2E"/><circle cx="${X + 1}" cy="${B - 46}" r="3.4" style="fill:#5A3A2A"/>`,
      `<path d="${prof}"/><rect x="${X + N*RW - 36}" y="${B - 46}" width="26" height="46" rx="1"/><rect x="${X + N*RW - 32}" y="${B - 42}" width="18" height="16" opacity=".5"/><path d="M${X + 3} ${B - 40} L${X + N*RW} ${top - 34}"/><rect x="${X - 2}" y="${B - 44}" width="6" height="44" rx="1.5"/>`)}</g>
    ${tapeTop(X + 62, 628, "Upstairs")}</g>`;
}
// and the top of the stairwell upstairs, bottom left, with a banister: the way back down
const stairsDown = () => `<g data-exit="1" aria-label="Down the stairs"><ellipse class="hov" cx="86" cy="594" rx="56" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="30" y="500" width="124" height="116" style="fill:#5A3A2A"/>${rows(8, i => `<rect x="${34 + i*2}" y="${505 + i*14}" width="${116 - i*4}" height="9" style="fill:#A8754F"/>`)}
      ${rows(14, i => `<path d="M${34 + i*9} 500 v-27" style="stroke:#6B4A2E" stroke-width="1.6"/>`)}${rows(5, i => `<path d="M156 ${512 + i*22} v-27" style="stroke:#6B4A2E" stroke-width="1.6"/>`)}
      <path d="M28 473 H156 V590" style="stroke:#5A3A2A;fill:none" stroke-width="3"/><rect x="152" y="466" width="8" height="36" rx="1.5" style="fill:#6B4A2E"/><rect x="152" y="584" width="8" height="34" rx="1.5" style="fill:#6B4A2E"/><circle cx="156" cy="465" r="3.6" style="fill:#5A3A2A"/>`,
      `<rect x="30" y="500" width="124" height="116"/><path d="M28 473 H156 V590"/><rect x="152" y="466" width="8" height="36" rx="1.5"/><rect x="152" y="584" width="8" height="34" rx="1.5"/>`)}
    ${tapeTop(86, 630, "Downstairs")}</g>`;

// the back door out to the garden, on the right-hand wall of the sitting room, seen side-on (a narrow parallelogram:
// the far edge is higher and shorter than the near one). 80 tall at the near edge.
function gardenDoor(trim, door){
  const fr = "M488 298 L488 368 L520 388 L520 288z", dr = "M492 303 L492 364 L516 380 L516 295z", gl = "M495 309 L495 327 L513 323 L513 303z";
  return `<g data-letgarden="1" aria-label="The back door to the garden"><ellipse class="hov" cx="494" cy="388" rx="30" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="${fr}" style="fill:${trim}"/><path d="${dr}" style="fill:${door}"/><path d="${gl}" style="fill:#D6E8F2"/><path d="M495 322 q6 -6 18 -8 v9 l-18 4z" style="fill:#A9C79A"/>
      <path d="M486 369 L520 390 L520 395 L484 373z" style="fill:#BDB3A6"/><circle cx="497" cy="342" r="2" style="fill:${BRASS}"/>`,
      `<path d="${fr}"/><path d="${dr}"/><path d="${gl}"/><path d="M504 306 v19" opacity=".6"/><path d="M496 334 L512 331 V372 L496 361z" opacity=".45"/><circle cx="497" cy="342" r="2"/>`)}
    ${tape(478, 408, "Garden")}</g>`;
}
// the bathroom door upstairs: a cottage plank door, 36 x 80, on the back wall at x 466
function bathDoor(trim, wood, ledge){
  const x = 466, top = WALL - 80;
  return `<g data-letbath="1" aria-label="The bathroom door"><ellipse class="hov" cx="${x}" cy="${WALL + 16}" rx="34" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x-22}" y="${top-4}" width="44" height="${WALL - top + 4}" rx="2" style="fill:${trim}"/><rect x="${x-18}" y="${top}" width="36" height="${WALL - top}" style="fill:${wood}"/>
      <rect x="${x-18}" y="${top+10}" width="36" height="5" style="fill:${ledge}"/><rect x="${x-18}" y="${WALL-16}" width="36" height="5" style="fill:${ledge}"/><path d="M${x-16} ${WALL-15} L${x+16} ${top+14}" style="stroke:${ledge}" stroke-width="4"/>
      <path d="M${x+11} ${top+38} v9" style="stroke:#3A3430" stroke-width="2.2"/><rect x="${x+9}" y="${top+42}" width="6" height="2" style="fill:#3A3430"/>`,
      `<rect x="${x-22}" y="${top-4}" width="44" height="${WALL - top + 4}" rx="2"/><rect x="${x-18}" y="${top}" width="36" height="${WALL - top}"/><path d="M${x-9} ${top} V${WALL} M${x} ${top} V${WALL} M${x+9} ${top} V${WALL}" opacity=".4"/>
      <rect x="${x-18}" y="${top+10}" width="36" height="5" opacity=".7"/><rect x="${x-18}" y="${WALL-16}" width="36" height="5" opacity=".7"/>`)}
    ${tape(x, top + 30, "Bathroom")}</g>`;
}

// ---------- fixtures drawn into the shells ----------
// a run of kitchen units: worktop 36 high (just over half the player), 18 deep, so the front stands at WALL + 18
const KTOP = WALL - 36, KFRONT = WALL + 18;
function kitchen(x0, x1, unit, top, sinkX){
  const w = x1 - x0, doors = Math.round(w/22);
  return shp([[R(x0, KTOP, w, 18, 1), top], [R(x0, KTOP + 18, w, 36, 1), unit], [R(x0 + 1, KFRONT - 4, w - 2, 4), D(unit, .25), 0]],
      sinkX ? `<rect x="${sinkX-14}" y="${KTOP+3}" width="28" height="12" rx="2" style="fill:${PORC}"/><rect x="${sinkX-11}" y="${KTOP+5}" width="22" height="8" rx="2" style="fill:#DDE7EC"/><rect x="${sinkX-15}" y="${KTOP+18}" width="30" height="13" rx="1" style="fill:${PORC}"/>
        <path d="M${sinkX} ${KTOP+4} v-9 q0 -3 4 -3 h2" style="stroke:${CHROME};fill:none" stroke-width="2"/>` : "",
      rows(doors, i => `<rect x="${x0 + 3 + i*w/doors}" y="${KTOP + 22}" width="${w/doors - 6}" height="${KFRONT - KTOP - 30}" rx="1" opacity=".55"/><circle cx="${x0 + (i + .5)*w/doors}" cy="${KTOP + 26}" r="1.2"/>`)
      + (sinkX ? `<rect x="${sinkX-14}" y="${KTOP+3}" width="28" height="12" rx="2"/><rect x="${sinkX-15}" y="${KTOP+18}" width="30" height="13" rx="1"/>` : ""));
}
// the fridge the welcome goes in: a little rounded one, 70 tall, a magnet or two and a note
const fridge = (x, col) => shp([[R(x-19, KFRONT - 76, 38, 6, 3), L(col, .3)], [R(x-19, KFRONT - 72, 38, 72, 5), col], [Pa(`M${x-19} ${KFRONT - 50} h38`), null]],
  `<rect x="${x+12}" y="${KFRONT - 66}" width="3" height="10" rx="1.5" style="fill:${CHROME}"/><rect x="${x+12}" y="${KFRONT - 44}" width="3" height="16" rx="1.5" style="fill:${CHROME}"/>
   <rect x="${x-12}" y="${KFRONT - 42}" width="10" height="12" style="fill:${CREAM}"/><circle cx="${x-7}" cy="${KFRONT - 43}" r="1.6" style="fill:#C2505F"/><circle cx="${x+4}" cy="${KFRONT - 62}" r="2" style="fill:#F3C969"/><circle cx="${x-8}" cy="${KFRONT - 60}" r="1.8" style="fill:#7FA0D0"/>`,
  `<rect x="${x+12}" y="${KFRONT - 66}" width="3" height="10" rx="1.5"/><rect x="${x+12}" y="${KFRONT - 44}" width="3" height="16" rx="1.5"/><path d="M${x-16} ${KFRONT} v3 M${x+16} ${KFRONT} v3"/>`);
// a chest of drawers (30 tall): the little touches stand on it
const chest = (x, y, wood) => shp([[R(x-22, y-38, 44, 8, 2), D(wood, .15)], [R(x-21, y-31, 42, 27, 2), wood]], "",
  `<path d="M${x-21} ${y-22} h42 M${x-21} ${y-13} h42" opacity=".6"/>${rows(3, r => `<circle cx="${x-8}" cy="${y-27 + r*9}" r="1.2"/><circle cx="${x+8}" cy="${y-27 + r*9}" r="1.2"/>`)}<path d="M${x-18} ${y-4} v4 M${x+18} ${y-4} v4"/>`);
// a bedside table with a little lamp on it (lit)
const bedside = (x, y, wood, shade) => glow(x, y - 34, 22, .5) + shp([[R(x-10, y-24, 20, 4, 1), D(wood, .12)], [R(x-9, y-20, 18, 12, 1), wood], [R(x-3, y-28, 6, 4, 1), BRASS], [Pa(`M${x-6} ${y-28} h12 l-2 -8 h-8z`), shade]], "",
  `<path d="M${x-9} ${y-14} h18" opacity=".5"/><circle cx="${x}" cy="${y-11}" r="1"/><path d="M${x-8} ${y-8} v8 M${x+8} ${y-8} v8"/>`);
// a tall wardrobe, 44 x 76
const wardrobe = (x, y, wood) => shp([[R(x-23, y-80, 46, 6, 2), D(wood, .15)], [R(x-22, y-75, 44, 71, 2), wood]], "",
  `<path d="M${x} ${y-75} v71"/><rect x="${x-18}" y="${y-70}" width="15" height="58" rx="1" opacity=".5"/><rect x="${x+3}" y="${y-70}" width="15" height="58" rx="1" opacity=".5"/><circle cx="${x-3}" cy="${y-42}" r="1.2"/><circle cx="${x+3}" cy="${y-42}" r="1.2"/><path d="M${x-20} ${y-4} v4 M${x+20} ${y-4} v4"/>`);
// a coat stand by the front door, with a coat, a scarf and a hat, and wellies underneath
const coatStand = (x, y, coat) => shp([[R(x-2, y-72, 4, 70, 1), DARK], [Pa(`M${x-9} ${y} l9 -6 l9 6`), null], [Pa(`M${x-7} ${y-64} q-9 2 -10 12 l-2 30 h18 l-1 -32 q-1 -8 -5 -10z`), coat], [Pa(`M${x+2} ${y-62} q6 0 6 6 v22 h-4 v-20 q0 -3 -2 -3z`), "#C2505F"],
    [E(x, y-73, 8, 2.6), "#C9A06E"], [Pa(`M${x-5} ${y-73} q0 -7 5 -7 q5 0 5 7z`), "#C9A06E"], [Pa(`M${x+6} ${y} v-12 h5 v9 h4 v3z`), "#4E6A3E"], [Pa(`M${x+12} ${y} v-11 h4 v8 h4 v3z`), "#4E6A3E"]],
  `<path d="M${x-9} ${y} l9 -6 l9 6" style="stroke:${DARK};fill:none" stroke-width="2"/>`);
// a log basket by the hearth
const logBasket = (x, y) => shp([[R(x-9, y-12, 18, 12, 2), "#B98552"], [C(x-4, y-13, 3), "#8A6448"], [C(x+2, y-14, 3), "#9A7454"], [C(x+6, y-12, 2.6), "#8A6448"]], "", `<path d="M${x-9} ${y-6} h18" opacity=".5"/>`);

// fixings on the floor: a jute rug under the dining table, a runner in from the front door, a mat by the back door,
// a rag rug by the beds, a blanket box at the foot of a bed
const flat = (art, x0, y0, w, h, rx = 3) => `<g filter="url(#letwob)">${art}<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${rx}" fill="none" style="stroke:${LINE}" stroke-width="1"/></g>`;
const juteRug = (x, y) => flat(`<rect x="${x-66}" y="${y-70}" width="132" height="84" rx="4" style="fill:#D8C4A0"/><rect x="${x-59}" y="${y-63}" width="118" height="70" rx="3" fill="none" style="stroke:#BFA77E" stroke-width="2.4"/><g style="stroke:#C9B48E" stroke-width="1" opacity=".7">${rows(13, i => `<path d="M${x-66} ${y-66 + i*6.4} h132"/>`)}</g>`, x-66, y-70, 132, 84);
const runner = (x, y0, y1, col) => flat(`<rect x="${x-22}" y="${y0}" width="44" height="${y1 - y0}" rx="2" style="fill:${col}"/><rect x="${x-16}" y="${y0 + 6}" width="32" height="${y1 - y0 - 12}" style="fill:${L(col, .45)}"/>${rows(Math.floor((y1 - y0 - 20)/14), i => `<path d="M${x-10} ${y0 + 16 + i*14} l10 -5 l10 5 l-10 5z" style="fill:${col}"/>`)}
  <path d="${rows(9, i => `M${x-20 + i*5} ${y0} v-4 M${x-20 + i*5} ${y1} v4 `)}" style="stroke:${LINE}" stroke-width=".7" opacity=".6"/>`, x-22, y0, 44, y1 - y0, 2);
const doormat = () => `<g filter="url(#letwob)"><path d="M462 392 L494 392 L508 402 L474 404z" style="fill:#B98552;stroke:${LINE}" stroke-width="1"/><path d="M468 396 L496 395 L503 400 L475 401z" style="fill:none;stroke:#8A6448" stroke-width="1"/></g>`;
const ragOval = (x, y, rx, ry, cols) => `<g filter="url(#letwob)">${cols.map((c, i) => `<ellipse cx="${x}" cy="${y}" rx="${rx - i*rx/cols.length}" ry="${ry - i*ry/cols.length}" style="fill:${c}"/>`).join("")}<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" style="stroke:${LINE}" stroke-width="1"/>
  ${cols.map((_, i) => `<ellipse cx="${x}" cy="${y}" rx="${rx - i*rx/cols.length}" ry="${ry - i*ry/cols.length}" fill="none" style="stroke:${LINE}" stroke-width=".5" stroke-dasharray="2 4" opacity=".45"/>`).join("")}</g>`;
const blanketBox = (x, y, wood, throwC) => shp([[R(x-21, y-18, 42, 6, 2), D(wood, .12)], [R(x-20, y-13, 40, 13, 1.5), wood], [Pa(`M${x+4} ${y-18} h12 v12 l-3 2 l-3 -2 l-3 2 l-3 -2z`), throwC]], "", `<path d="M${x-20} ${y-7} h40" opacity=".4"/><rect x="${x-3}" y="${y-12}" width="6" height="3" rx="1"/>`);
// a little shade along the front of the room, where it runs out of the picture
const frontShade = () => `<defs><linearGradient id="letfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2E28" stop-opacity="0"/><stop offset="1" stop-color="#3A2E28" stop-opacity=".14"/></linearGradient></defs><rect y="400" width="520" height="240" fill="url(#letfade)" pointer-events="none"/>`;
// a wicker laundry basket
const laundry = (x, y) => shp([[Pa(`M${x-11} ${y-24} h22 l-2 24 h-18z`), "#D9B97E"], [E(x, y-24, 12, 3.5), "#C9A46A"], [Pa(`M${x-6} ${y-27} q4 -6 10 -2 q3 2 2 4z`), CREAM]], "", `<g opacity=".45">${rows(4, i => `<path d="M${x-10} ${y-19 + i*5} h20"/>`)}</g>`);

// ---------- the bathroom bits ----------
// a small frosted window, 40 x 46
const frosted = (x, y, trim) => sk(`<rect x="${x-23}" y="${y-26}" width="46" height="52" rx="2" style="fill:${trim}"/><rect x="${x-20}" y="${y-23}" width="40" height="46" rx="1" style="fill:#E4EDF1"/>
    ${rows(14, i => `<circle cx="${x - 16 + (i*13) % 32}" cy="${y - 19 + (i*11) % 40}" r="${1.2 + (i % 3)*.6}" style="fill:#FFFFFF" opacity=".75"/>`)}<rect x="${x-26}" y="${y+26}" width="52" height="5" rx="1.5" style="fill:${CREAM}"/>`,
  `<rect x="${x-23}" y="${y-26}" width="46" height="52" rx="2"/><rect x="${x-20}" y="${y-23}" width="40" height="46" rx="1"/><path d="M${x} ${y-23} v46 M${x-20} ${y} h40"/><rect x="${x-26}" y="${y+26}" width="52" height="5" rx="1.5"/>`);
// a peg rail with a dressing gown and a wash bag (drawn big, hung at half size)
const pegRailBig = (rail, robe, bag) => sk(`<rect x="246" y="96" width="74" height="8" rx="2" style="fill:${rail}"/><circle cx="266" cy="104" r="3.5" style="fill:${DARK}"/><circle cx="302" cy="104" r="3.5" style="fill:${DARK}"/>
    <path d="M266 106 c-10 0 -20 6 -22 18 l-6 68 h56 l-6 -68 c-2 -12 -12 -18 -22 -18z" style="fill:${robe}"/><path d="M256 110 l10 24 l10 -24z" style="fill:${L(robe, .5)}"/><rect x="240" y="150" width="52" height="5" style="fill:${D(robe, .2)}"/><path d="M262 155 l-4 22 M270 155 l4 20" style="stroke:${D(robe, .2)}" stroke-width="3"/>
    <path d="M302 108 v8" style="stroke:${LINE}" stroke-width="1.2"/><path d="M291 118 q11 -6 22 0 l3 30 q-14 6 -28 0z" style="fill:${bag}"/>`,
  `<rect x="246" y="96" width="74" height="8" rx="2"/><path d="M266 106 c-10 0 -20 6 -22 18 l-6 68 h56 l-6 -68 c-2 -12 -12 -18 -22 -18z"/><path d="M256 110 l10 24 l10 -24"/><path d="M266 134 v58" opacity=".5"/><path d="M291 118 q11 -6 22 0 l3 30 q-14 6 -28 0z"/><path d="M293 124 q9 4 18 0" opacity=".6"/>`);
const pegRail = (x, y, rail, robe, bag) => sc(283, 96, .55, () => pegRailBig(rail, robe, bag), x, y);
// a loo with a high cistern and a pull chain
const loo = (x, y, seat) => shp([[R(x-13, y-112, 26, 13, 2), PORC], [Pa(`M${x-8} ${y-99} V${y-40}`), null], [R(x-11, y-44, 22, 20, 7), seat], [Pa(`M${x-12} ${y-22} h24 q0 9 -6 12 v10 h-12 v-10 q-6 -3 -6 -12z`), PORC], [R(x-13, y-25, 26, 4, 2), seat]],
  `<path d="M${x-8} ${y-99} V${y-42}" style="stroke:${CHROME}" stroke-width="2.4"/><path d="M${x+9} ${y-99} v34" style="stroke:#8A8F94" stroke-width="1" stroke-dasharray="1.5 1.5"/><rect x="${x+7}" y="${y-66}" width="4" height="7" rx="2" style="fill:${seat}"/>`,
  `<rect x="${x+7}" y="${y-66}" width="4" height="7" rx="2"/>`);
// a towel cupboard (an airing cupboard), 46 x 80
const towelCupboard = (x, y, col) => shp([[R(x-24, y-84, 48, 6, 2), D(col, .15)], [R(x-23, y-79, 46, 75, 2), col]],
  `<rect x="${x-17}" y="${y-92}" width="34" height="8" rx="3" style="fill:#D9B97E"/><rect x="${x-14}" y="${y-97}" width="13" height="6" rx="2" style="fill:${CREAM}"/><rect x="${x+1}" y="${y-96}" width="13" height="5" rx="2" style="fill:#E3A5B0"/>`,
  `<path d="M${x} ${y-79} v75"/>${rows(5, i => `<path d="M${x-19} ${y-70 + i*12} h15 M${x+4} ${y-70 + i*12} h15" opacity=".45"/>`)}<circle cx="${x-3}" cy="${y-42}" r="1.2"/><circle cx="${x+3}" cy="${y-42}" r="1.2"/><rect x="${x-17}" y="${y-92}" width="34" height="8" rx="3"/>`);
const wallShelf = (x, y, wood) => shp([[R(x-16, y, 32, 3, 1), wood], [R(x-12, y-9, 7, 9, 2), CREAM], [R(x-3, y-8, 7, 8, 2), CREAM], [R(x+6, y-10, 6, 10, 2), "#9DB08A"]], "", `<path d="M${x-12} ${y+3} l3 4 M${x+12} ${y+3} l-3 4"/>`);

// ---------- the gardens ----------
// the back of the cottage along the top (two storeys, the back door 80 tall), a fence or hedge down each side, and a
// lawn: scruffy long grass until you buy a proper garden (flower beds, a mown lawn, a gravel path).
const GH = 196;   // the back wall of the cottage comes down to here
const qpt = (a, c, b, t) => [0, 1].map(i => (1 - t)*(1 - t)*a[i] + 2*(1 - t)*t*c[i] + t*t*b[i]);
function houseBack(o){
  const pick = o.fence === "picket";
  const win = (wx, y0, w, h, shut) => sk(`${shut ? `<rect x="${wx - w/2 - 13}" y="${y0}" width="11" height="${h}" rx="1" style="fill:${o.trim}"/><rect x="${wx + w/2 + 2}" y="${y0}" width="11" height="${h}" rx="1" style="fill:${o.trim}"/>` : ""}
      <rect x="${wx - w/2}" y="${y0}" width="${w}" height="${h}" rx="2" style="fill:${pick ? CREAM : o.trim}"/><rect x="${wx - w/2 + 3}" y="${y0 + 3}" width="${w - 6}" height="${h - 6}" style="fill:#C9DCE6"/><path d="M${wx - w/2 + 3} ${y0 + h*.62} q${w*.2} -6 ${w*.4} -2 v${h*.38 - 3} h-${w*.4}z M${wx + w/2 - 3} ${y0 + h*.62} q-${w*.2} -6 -${w*.4} -2 v${h*.38 - 3} h${w*.4}z" style="fill:#E6D2AE" opacity=".8"/><rect x="${wx - w/2 - 4}" y="${y0 + h}" width="${w + 8}" height="4" rx="1" style="fill:${CREAM}"/>`,
    `${shut ? `<rect x="${wx - w/2 - 13}" y="${y0}" width="11" height="${h}" rx="1"/><rect x="${wx + w/2 + 2}" y="${y0}" width="11" height="${h}" rx="1"/><path d="${rows(4, i => `M${wx - w/2 - 11} ${y0 + 6 + i*h/4.5} h7 M${wx + w/2 + 4} ${y0 + 6 + i*h/4.5} h7 `)}" opacity=".45"/>` : ""}
      <rect x="${wx - w/2}" y="${y0}" width="${w}" height="${h}" rx="2"/><rect x="${wx - w/2 + 3}" y="${y0 + 3}" width="${w - 6}" height="${h - 6}"/><path d="M${wx} ${y0 + 3} v${h - 6} M${wx - w/2 + 3} ${y0 + h/2} h${w - 6}"/><rect x="${wx - w/2 - 4}" y="${y0 + h}" width="${w + 8}" height="4" rx="1"/>`);
  return sk(`<rect width="520" height="${GH}" style="fill:${o.wall}"/>`, `<path d="M0 ${GH} H520"/>`)
    + `<g style="fill:${o.course}" opacity=".75">${rows(30, i => `<rect x="${(i*137) % 500 + 6}" y="${36 + (i*37) % 150}" width="${12 + (i % 3)*5}" height="6" rx="3"/>`)}</g>`
    + sk(`<rect width="520" height="22" style="fill:${o.roof}"/><rect y="22" width="520" height="6" style="fill:${D(o.roof, .3)}"/>`, `<path d="M0 22 H520 M0 28 H520"/><g opacity=".35">${rows(20, i => `<path d="M${i*26 + 13} 0 v22"/>`)}<path d="M0 11 H520"/></g>`)
    + o.wins.map(wx => win(wx, 44, 36, 36, false) + win(wx, 96, 46, 52, pick)).join("") + win(260, 42, 28, 32, false)
    + sk(`<rect x="236" y="${GH - 84}" width="48" height="84" rx="2" style="fill:${CREAM}"/><rect x="240" y="${GH - 80}" width="40" height="80" style="fill:${o.door}"/>${rows(4, i => `<rect x="${245 + (i % 2)*16}" y="${GH - 74 + (i > 1 ? 12 : 0)}" width="14" height="10" style="fill:#D6E8F2"/>`)}
      <circle cx="275" cy="${GH - 40}" r="2" style="fill:${BRASS}"/><rect x="232" y="${GH - 2}" width="56" height="7" rx="2" style="fill:#BDB3A6"/>
      <rect x="292" y="${GH - 76}" width="9" height="13" rx="1.5" style="fill:#3A3430"/><rect x="293.5" y="${GH - 73}" width="6" height="8" style="fill:#FFE6A8"/><path d="M291 ${GH - 76} h11 l-5.5 -5z" style="fill:#3A3430"/>`,
      `<rect x="236" y="${GH - 84}" width="48" height="84" rx="2"/><rect x="240" y="${GH - 80}" width="40" height="80"/><rect x="244" y="${GH - 46}" width="32" height="40" opacity=".45"/><circle cx="275" cy="${GH - 40}" r="2"/><rect x="232" y="${GH - 2}" width="56" height="7" rx="2"/><rect x="292" y="${GH - 76}" width="9" height="13" rx="1.5"/>`);
}
// a picket fence (or a hedge) down the left side; the right side is the same, mirrored
const picketSide = col => sk(rows(30, i => { const yb = GH + 12 + i*15; return `<path d="M4 ${yb} V${yb-30} l6 -6 l6 6 V${yb}z" style="fill:${col}"/><rect x="12" y="${yb-29}" width="4" height="29" style="fill:${D(col, .12)}"/>`; }),
  rows(30, i => { const yb = GH + 12 + i*15; return `<path d="M4 ${yb} V${yb-30} l6 -6 l6 6 V${yb}"/>`; }));
const hedgeSide = w => sk(`<rect x="0" y="${GH - 14}" width="${w - 6}" height="${640 - GH + 14}" style="fill:#4E7A3E"/>${rows(20, i => `<circle cx="${w - 8}" cy="${GH - 4 + i*24}" r="14" style="fill:${i % 2 ? "#5E8A48" : "#6F9A5E"}"/><circle cx="${w - 22}" cy="${GH + 8 + i*24}" r="10" style="fill:#5E8A48"/>`)}
    ${rows(16, i => `<circle cx="${8 + (i*13) % (w - 14)}" cy="${GH + 10 + (i*67) % 420}" r="2" style="fill:#9EBE8C"/>`)}`,
  `<path d="M${w + 6} ${GH - 14} ${rows(19, () => "q8 12 0 24 ").trim()}"/>`);
// the fig tree in the corner: about two and a half times the player's height
function figTreeBig(){
  const leaf = [[34, 168, 40], [88, 146, 44], [132, 178, 34], [70, 202, 36], [18, 214, 30], [112, 216, 28], [56, 120, 30]];
  return `<ellipse cx="86" cy="300" rx="70" ry="12" style="fill:#3A2E28" opacity=".1"/>` + sk(`<path d="M58 300 Q64 256 52 214 Q66 236 70 206 Q78 250 80 300z" style="fill:#8A7058"/><path d="M60 236 Q40 214 30 196 M74 226 Q100 204 116 196" style="stroke:#8A7058;fill:none" stroke-width="6" stroke-linecap="round"/>
      ${leaf.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3}" style="fill:#44683A"/>`).join("")}${leaf.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${["#5E8A48", "#6F9A5E", "#567F42"][i % 3]}"/>`).join("")}
      ${[[30, 150], [74, 132], [110, 160], [52, 196], [124, 200], [90, 186], [14, 196]].map(([x, y]) => `<path d="M${x} ${y} q-9 -4 -8 -12 q4 4 8 2 q-1 -8 4 -12 q3 7 1 12 q6 0 8 -4 q1 9 -9 14z" style="fill:#86AE6E"/>`).join("")}
      ${[[44, 178], [98, 168], [66, 214], [118, 196], [22, 222], [84, 116]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="6" style="fill:#7B5A7A"/>`).join("")}`,
    `<path d="M58 300 Q64 256 52 214 Q66 236 70 206 Q78 250 80 300"/>
      ${[[44, 178], [98, 168], [66, 214], [118, 196], [22, 222], [84, 116]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="6"/>`).join("")}`);
}
const figTree = () => sc(69, 300, .8, figTreeBig, 62, 296);
// the extras, drawn big and set down at the player's scale (a bike wheel about 0.4 of her height, the hot tub a
// little more than her height across)
const GXBIG = {
  patio: (x, y, o) => { const chair = (cx, d) => [`<rect x="${cx-12}" y="${y-14}" width="24" height="6" rx="2" style="fill:${o.trim}"/><rect x="${cx - d*12 - 2}" y="${y-46}" width="5" height="34" rx="2" style="fill:${o.trim}"/>`,
      `<rect x="${cx-12}" y="${y-14}" width="24" height="6" rx="2"/><rect x="${cx - d*12 - 2}" y="${y-46}" width="5" height="34" rx="2"/><path d="M${cx-10} ${y-8} l-2 12 M${cx+10} ${y-8} l2 12"/>`];
    const cl = chair(x - 44, 1), cr = chair(x + 44, -1);
    return sk(`${rows(8, i => `<rect x="${x - 70 + (i % 4)*35}" y="${y - 30 + Math.floor(i/4)*28}" width="35" height="28" style="fill:${(i + Math.floor(i/4)) % 2 ? "#D8D0C2" : "#CBC1B0"}"/>`)}${cl[0]}${cr[0]}
      <rect x="${x-2}" y="${y-28}" width="4" height="30" style="fill:${o.trim}"/><ellipse cx="${x}" cy="${y+2}" rx="12" ry="3" style="fill:${o.trim}"/><ellipse cx="${x}" cy="${y-30}" rx="26" ry="7" style="fill:${o.trim}"/>
      <path d="M${x-10} ${y-32} q0 -14 10 -14 q10 0 10 14z" style="fill:${CREAM}"/><path d="M${x+10} ${y-40} l8 -4" style="stroke:${CREAM}" stroke-width="3"/><rect x="${x+12}" y="${y-38}" width="7" height="6" rx="2" style="fill:${CREAM}"/><rect x="${x-22}" y="${y-38}" width="7" height="6" rx="2" style="fill:${CREAM}"/>`,
      `<rect x="${x-70}" y="${y-30}" width="140" height="56"/><path d="M${x-35} ${y-30} v56 M${x} ${y-30} v56 M${x+35} ${y-30} v56 M${x-70} ${y-2} h140" opacity=".45"/>${cl[1]}${cr[1]}<ellipse cx="${x}" cy="${y-30}" rx="26" ry="7"/><path d="M${x-2} ${y-23} v24 M${x+2} ${y-23} v24"/><path d="M${x-10} ${y-32} q0 -14 10 -14 q10 0 10 14"/>`); },
  bbq: (x, y) => sk(`<path d="M${x-12} ${y-22} L${x-17} ${y} M${x+12} ${y-22} L${x+17} ${y} M${x} ${y-20} V${y-2}" style="stroke:#3A3A3A" stroke-width="3"/><path d="M${x-20} ${y-38} Q${x-20} ${y-18} ${x} ${y-18} Q${x+20} ${y-18} ${x+20} ${y-38}z" style="fill:#3E3E3E"/>
      <rect x="${x-14}" y="${y-44}" width="9" height="5" rx="2.5" style="fill:#B8674A"/><rect x="${x-3}" y="${y-45}" width="9" height="5" rx="2.5" style="fill:#A85A3E"/><rect x="${x+8}" y="${y-44}" width="8" height="5" rx="2.5" style="fill:#B8674A"/>
      <path d="M${x-28} ${y} q-4 -18 2 -24 h12 q6 6 2 24z" style="fill:#C9A06E"/><path d="M${x-2} ${y-50} q-6 -8 0 -16 q6 -8 0 -16" style="stroke:#E8E4DC;fill:none" stroke-width="3" opacity=".8"/>`,
    `<path d="M${x-20} ${y-38} Q${x-20} ${y-18} ${x} ${y-18} Q${x+20} ${y-18} ${x+20} ${y-38}z"/><path d="M${x-20} ${y-38} h40" /><path d="M${x-28} ${y} q-4 -18 2 -24 h12 q6 6 2 24z"/><path d="M${x-24} ${y-16} h10" opacity=".5"/>`),
  bikes: (x, y, o) => { const bike = (cx, col, load) => [`<circle cx="${cx-26}" cy="${y-17}" r="16" style="fill:none;stroke:#3A3430" stroke-width="3.5"/><circle cx="${cx+26}" cy="${y-17}" r="16" style="fill:none;stroke:#3A3430" stroke-width="3.5"/>
        <path d="M${cx-26} ${y-17} L${cx-2} ${y-17} L${cx-8} ${y-44} M${cx-2} ${y-17} Q${cx+6} ${y-30} ${cx+18} ${y-46} L${cx+26} ${y-17} M${cx-26} ${y-17} L${cx-8} ${y-38}" style="stroke:${col};fill:none" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="${cx-9}" cy="${y-47}" rx="8" ry="3.4" style="fill:#5A3A2A"/><path d="M${cx+16} ${y-50} q4 -6 12 -4" style="stroke:#3A3430;fill:none" stroke-width="3"/>
        <rect x="${cx+18}" y="${y-62}" width="22" height="16" rx="2" style="fill:#D9B97E"/>${load}`,
      `<path d="M${cx-26} ${y-17} m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 M${cx+26} ${y-17} m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0" opacity=".5"/><path d="M${cx-26} ${y-27} v20 M${cx-36} ${y-17} h20 M${cx+26} ${y-27} v20 M${cx+16} ${y-17} h20" opacity=".3"/><rect x="${cx+18}" y="${y-62}" width="22" height="16" rx="2"/><path d="M${cx+18} ${y-54} h22 M${cx+25} ${y-62} v16 M${cx+33} ${y-62} v16" opacity=".5"/>`];
    const a = bike(x - 30, o.trim, `${[0, 1, 2].map(i => `<circle cx="${x - 7 + i*6}" cy="${y - 66 + (i % 2)*3}" r="3.6" style="fill:${["#E3A5B0", "#F3C969", CREAM][i]}"/>`).join("")}`),
      b = bike(x + 32, o.bike2, `<rect x="${x+52}" y="${y-76}" width="7" height="22" rx="3" transform="rotate(14 ${x+55} ${y-65})" style="fill:#D9A066"/>`);
    return sk(a[0] + b[0], a[1] + b[1]); },
  hottub: (x, y) => { const body = `M${x-58} ${y-62} V${y-6} Q${x} ${y+8} ${x+58} ${y-6} V${y-62}z`;
    return sk(`<rect x="${x-80}" y="${y-46}" width="22" height="32" rx="2" style="fill:#3A3A3A"/><rect x="${x-74}" y="${y-124}" width="9" height="80" style="fill:#4A4A4A"/><rect x="${x-77}" y="${y-128}" width="15" height="6" style="fill:#3A3A3A"/><rect x="${x-75}" y="${y-36}" width="12" height="9" rx="2" style="fill:#F2A65A"/>
      <path d="${body}" style="fill:#A8754F"/><path d="M${x-58} ${y-48} Q${x} ${y-34} ${x+58} ${y-48} M${x-58} ${y-18} Q${x} ${y-4} ${x+58} ${y-18}" style="stroke:#5A5550;fill:none" stroke-width="4"/>
      <ellipse cx="${x}" cy="${y-62}" rx="58" ry="16" style="fill:#C08D58"/><ellipse cx="${x}" cy="${y-62}" rx="50" ry="12" style="fill:#9CCFE0"/><path d="M${x-30} ${y-62} q8 -3 16 0 M${x+8} ${y-58} q8 -3 16 0" style="stroke:#E3F2F7;fill:none" stroke-width="2"/>
      <path d="M${x-22} ${y-72} q-6 -10 0 -18 q6 -8 0 -18 M${x+2} ${y-74} q-6 -10 0 -18 q6 -8 0 -18 M${x+26} ${y-72} q-6 -10 0 -18 q6 -8 0 -16" style="stroke:#FFFFFF;fill:none" stroke-width="3" opacity=".85"/>
      <circle cx="${x-70}" cy="${y-136}" r="5" style="fill:#D8D4CC" opacity=".8"/><circle cx="${x-62}" cy="${y-146}" r="4" style="fill:#D8D4CC" opacity=".6"/>
      <rect x="${x+36}" y="${y-20}" width="34" height="20" rx="2" style="fill:#B07D4A"/>`,
      `<rect x="${x-80}" y="${y-46}" width="22" height="32" rx="2"/><rect x="${x-74}" y="${y-124}" width="9" height="80"/><path d="${body}"/><ellipse cx="${x}" cy="${y-62}" rx="58" ry="16"/><ellipse cx="${x}" cy="${y-62}" rx="50" ry="12"/>
      <g opacity=".4">${rows(9, i => `<path d="M${x-46 + i*11.5} ${y-48 + Math.abs(i - 4)*1.5} V${y + 2 - Math.abs(i - 4)*1.5}"/>`)}</g><rect x="${x+36}" y="${y-20}" width="34" height="20" rx="2"/><path d="M${x+36} ${y-10} h34" opacity=".5"/>`); }
};
// a stretch of feather-edged fence for the bikes to lean on
const bikeFence = (x, y) => shp([[R(x-50, y-46, 100, 40, 1), "#B08A62"], [R(x-52, y-50, 6, 50, 1), "#8A6448"], [R(x+46, y-50, 6, 50, 1), "#8A6448"]], "", `<g opacity=".45">${rows(11, i => `<path d="M${x-46 + i*9} ${y-46} v40"/>`)}</g><path d="M${x-50} ${y-30} h96" opacity=".6"/>`);
// a trellis screen with a climbing rose, behind the hot tub
const screenArt = (x, y) => shp([[R(x-62, y-96, 6, 96, 1), "#8A6448"], [R(x+56, y-96, 6, 96, 1), "#8A6448"], [R(x-56, y-92, 112, 80), "#E9DCC4", 0]],
  `<g style="stroke:#B08A62" stroke-width="2">${rows(9, i => `<path d="M${x-56 + i*14} ${y-92} l${-14 + 28} 80 M${x-56 + i*14} ${y-12} l14 -80"/>`)}</g>${rows(16, i => `<circle cx="${x - 52 + (i*29) % 106}" cy="${y - 86 + (i*23) % 70}" r="${5 + i % 3}" style="fill:${i % 2 ? "#5E8A48" : "#6F9A5E"}"/>`)}${rows(7, i => `<circle cx="${x - 46 + (i*37) % 96}" cy="${y - 80 + (i*19) % 60}" r="2.6" style="fill:${["#E3A5B0", "#C2505F", CREAM][i % 3]}"/>`)}`,
  `<path d="M${x-56} ${y-92} h112"/>`);
const GX = {
  patio: (x, y, o) => sc(x, y, .85, () => GXBIG.patio(x, y, o)),
  bbq: (x, y, o) => sc(x, y, .8, () => GXBIG.bbq(x, y, o)),
  // a ring of stones with logs burning, and five log seats in a circle round it (the gap is the way in)
  firepit: (x, y) => { const stone = s => `<ellipse cx="${s.sx.toFixed(1)}" cy="${s.sy.toFixed(1)}" rx="4.4" ry="3.2" style="fill:${["#A8A39A", "#BDB8AE", "#958F86"][s.i % 3]}"/>`;
    const ring = Array.from({length: 14}, (_, i) => { const a = i/14*Math.PI*2; return {sx: x + 21*Math.cos(a), sy: y + 8*Math.sin(a), i, back: Math.sin(a) < 0}; });
    const seats = [[-40, -10], [-14, -26], [16, -26], [42, -10], [-44, 16], [44, 16]].map(([dx, dy]) => [x + dx, y + dy]);
    const log = ([sx, sy]) => [`<rect x="${sx-7}" y="${sy-16}" width="14" height="16" style="fill:#8A6448"/><ellipse cx="${sx}" cy="${sy-16}" rx="7" ry="2.8" style="fill:#D9B98A"/>`, `<rect x="${sx-7}" y="${sy-16}" width="14" height="16"/><ellipse cx="${sx}" cy="${sy-16}" rx="7" ry="2.8"/><ellipse cx="${sx}" cy="${sy-16}" rx="2.6" ry="1" opacity=".5"/>`];
    const back = seats.filter(s => s[1] < y).map(log), front = seats.filter(s => s[1] >= y).map(log);
    return `<circle cx="${x}" cy="${y-10}" r="40" fill="url(#gdnglow)" opacity=".55"/>` + sk(back.map(s => s[0]).join(""), back.map(s => s[1]).join(""))
      + sk(`${ring.filter(s => s.back).map(stone).join("")}<ellipse cx="${x}" cy="${y}" rx="18" ry="6" style="fill:#4A403A"/>
      <rect x="${x-13}" y="${y-5}" width="26" height="4.5" rx="2" transform="rotate(-14 ${x} ${y-3})" style="fill:#8A6448"/><rect x="${x-13}" y="${y-5}" width="26" height="4.5" rx="2" transform="rotate(14 ${x} ${y-3})" style="fill:#7A5638"/>
      <path d="M${x-8} ${y-3} q0 -12 6 -18 q1 8 5 6 q2 -6 1 -13 q8 10 5 25z" style="fill:#F2A65A"/><path d="M${x-3} ${y-3} q1 -7 3 -9 q1 5 3 2 q1 4 -1 7z" style="fill:#F3D36A"/>${ring.filter(s => !s.back).map(stone).join("")}`,
      `<ellipse cx="${x}" cy="${y}" rx="24" ry="10" opacity=".5"/><path d="M${x-8} ${y-3} q0 -12 6 -18 q1 8 5 6 q2 -6 1 -13 q8 10 5 25z"/>`)
      + sk(front.map(s => s[0]).join(""), front.map(s => s[1]).join("")); },
  bikes: (x, y, o) => bikeFence(x, y - 4) + sc(x, y, .78, () => GXBIG.bikes(x, y, o)),
  // a hammock slung between two posts, a cushion in it
  hammock: (x, y, o) => `<ellipse cx="${x}" cy="${y+1}" rx="50" ry="5" style="fill:#3A2E28" opacity=".12"/>` + shp([[R(x-64, y-60, 5, 60, 1.5), "#8A6448"], [R(x+59, y-60, 5, 60, 1.5), "#8A6448"],
      [Pa(`M${x-42} ${y-40} Q${x} ${y-12} ${x+42} ${y-40} L${x+42} ${y-34} Q${x} ${y-4} ${x-42} ${y-34}z`), CREAM], [E(x-24, y-32, 9, 4.5), L(o.trim, .35)]],
    `<path d="M${x-59} ${y-54} L${x-42} ${y-38} M${x+59} ${y-54} L${x+42} ${y-38}" style="stroke:#C9B48A" stroke-width="1.4"/><path d="M${x-42} ${y-37} Q${x} ${y-8} ${x+42} ${y-37}" style="stroke:${o.trim};fill:none" stroke-width="2"/>`),
  hottub: (x, y, o) => screenArt(x, y - 30) + sc(x, y, .6, () => GXBIG.hottub(x, y, o))
};
// fairy lights: swagged under the eaves and along the top of each side fence
function fairyLights(o){
  const runs = [], bulbs = [];
  for (let k = 0; k < 6; k++) runs.push([[20 + k*80, 32], [60 + k*80, 44], [100 + k*80, 32]]);
  const fx = o.side - 6;
  for (let k = 0; k < 5; k++) for (const s of [0, 1]) { const X = s ? 520 - fx : fx; runs.push([[X, GH + 4 + k*84], [X + (s ? -10 : 10), GH + 46 + k*84], [X, GH + 88 + k*84]]); }
  runs.forEach(([a, c, b]) => [.17, .5, .83].forEach(t => bulbs.push(qpt(a, c, b, t))));
  return `<g pointer-events="none"><path d="${runs.map(([a, c, b]) => `M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`).join(" ")}" style="stroke:#4A4038;fill:none" stroke-width="1"/>
    ${bulbs.map(([bx, by]) => `<circle cx="${bx.toFixed(1)}" cy="${(by + 2).toFixed(1)}" r="6" style="fill:#FFE9A8" opacity=".35"/><circle cx="${bx.toFixed(1)}" cy="${(by + 2).toFixed(1)}" r="2.4" style="fill:#FFE08A;stroke:#3A2E28" stroke-width=".7"/>`).join("")}</g>`;
}
function gardenScene(info, o){
  const ex = (info && info.extras) || {}, nice = !!ex.garden, S = o.side;
  let h = DEFS;
  // the lawn: mown in stripes, or long grass with weeds
  h += `<rect width="520" height="640" style="fill:${nice ? "#A8C784" : "#9AAE70"}"/>`;
  if (nice) h += `<g style="fill:#B6D293" opacity=".75">${rows(9, i => `<rect y="${GH + 24 + i*50}" width="520" height="25"/>`)}</g>`;
  else h += `<g style="stroke:#748A50;fill:none" stroke-width="1.3" stroke-linecap="round">${rows(110, i => { const x = (i*97) % 500 + 10, y = GH + 16 + (i*53) % 430; return `<path d="M${x} ${y} q-2 -7 -6 -10 M${x} ${y} q0 -8 1.5 -12 M${x} ${y} q3 -6 6 -8"/>`; })}</g>
    <g style="stroke:#B9C98A;fill:none" stroke-width="1.1" stroke-linecap="round">${rows(50, i => { const x = (i*151) % 500 + 10, y = GH + 24 + (i*89) % 420; return `<path d="M${x} ${y} q-1.5 -6 -4 -9 M${x} ${y} q2 -7 5 -9"/>`; })}</g>`;
  h += houseBack(o);
  if (nice) {
    // flower beds under the house wall either side of the door, and a gravel path down the middle
    const bed = (a, b) => sk(`<path d="M${a} ${GH} H${b} V${GH + 18} Q${(a + b)/2} ${GH + 26} ${a} ${GH + 18}z" style="fill:#8A6448"/>${rows(Math.floor((b - a - 10)/11), i => { const fx = a + 8 + i*11, fy = GH + 14 + (i % 2)*4;
        return `<path d="M${fx} ${fy} v-12" style="stroke:#6F9A5E" stroke-width="1.5"/><circle cx="${fx-3}" cy="${fy-4}" r="3" style="fill:#7FA36E"/><circle cx="${fx}" cy="${fy-13}" r="3.4" style="fill:${["#E3A5B0", "#F3C969", "#C2505F", "#B9A3D6", CREAM][i % 5]}"/>`; })}`,
      `<path d="M${a} ${GH + 18} Q${(a + b)/2} ${GH + 26} ${b} ${GH + 18}"/>`);
    h += sk(`<path d="M240 ${GH + 5} L280 ${GH + 5} L292 640 L228 640z" style="fill:#E2D6BE"/>${rows(110, i => { const y = GH + 12 + (i*53) % 430, hw = 17 + (y - GH)/444*13; return `<circle cx="${(260 + (((i*61) % 97)/48.5 - 1)*hw).toFixed(1)}" cy="${y}" r="${1 + (i % 3)*.4}" style="fill:${i % 2 ? "#B9A98A" : "#CDBFA3"}"/>`; })}`,
      `<path d="M240 ${GH + 5} L228 640 M280 ${GH + 5} L292 640"/>`) + bed(S + 4, 230) + bed(290, 516 - S);
  } else {
    // stepping stones, half lost in the grass, and dandelions and docks
    const stones = [[260, 222, 11], [256, 270, 12], [264, 322, 12], [257, 376, 13], [263, 432, 13], [258, 490, 13], [262, 548, 14]];
    h += sk(`${stones.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.45}" style="fill:#C9C2B4"/>`).join("")}
      ${[[70, 260], [180, 330], [330, 280], [450, 380], [120, 420], [380, 520], [60, 560], [460, 600], [180, 600], [300, 420], [440, 250], [150, 520]].map(([x, y]) => `<path d="M${x} ${y} q1 -6 -1 -10" style="stroke:#6F9A5E;fill:none" stroke-width="1.3"/><circle cx="${x-1}" cy="${y-11}" r="2.6" style="fill:#F3C969"/>`).join("")}
      ${[[100, 230], [400, 226], [200, 470], [340, 590]].map(([x, y]) => `<path d="M${x} ${y} q-10 -4 -11 -14 q9 1 11 14z M${x} ${y} q9 -6 8 -16 q-8 5 -8 16z" style="fill:#5E7A44"/>`).join("")}
      ${rows(34, i => `<path d="M${S + 6 + i*14} ${GH + 5} q-3 -11 -1 -18 M${S + 10 + i*14} ${GH + 6} q3 -10 6 -15" style="stroke:#7F9A5A;fill:none" stroke-width="1.6"/>`)}`,
      `${stones.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.45}"/>`).join("")}`);
  }
  // the fence or hedge down each side
  const side = o.fence === "picket" ? picketSide("#F1EEE6") : hedgeSide(S);
  h += side + `<g transform="translate(520 0) scale(-1 1)">${side}</g>`;
  if (o.fig) h += figTree();
  // the extras, back to front
  Object.keys(GX).filter(k => ex[k] && o.at[k]).sort((a, b) => o.at[a][1] - o.at[b][1]).forEach(k => { h += GX[k](o.at[k][0], o.at[k][1], o); });
  if (ex.lights) h += fairyLights(o);
  return `<g pointer-events="none">${h}</g>`;
}

// ---------- the shells ----------
const B_TRIM = "#5E7AB0", F_TRIM = "#C8923A";
export const LET_SHELLS = {
  // Bluebell: pale blue-grey walls over blue panelling, a beamed ceiling, a stone fireplace in the middle with the
  // sitting room round it, a little kitchen and the fridge on the right, the stairs up on the left
  bluebell: () => { const [wx, wy] = COTTAGES.bluebell.slots.curtains, fx = COTTAGES.bluebell.slots.picture[0], trim = B_TRIM;
    return DEFS + boards("#DCCBAE", "#BFA986") + `<rect width="520" height="${WALL}" style="fill:#DDE5EC"/>${sprigs(54, 5, "#B4C4D4")}
    ${sk(`<rect y="${WALL - 36}" width="520" height="36" style="fill:#C9D6E4"/><rect y="${WALL - 39}" width="520" height="4" style="fill:${trim}"/>`, `<path d="M0 ${WALL - 39} H520 M0 ${WALL - 35} H520"/><g opacity=".35">${rows(52, i => `<path d="M${i*10 + 5} ${WALL - 35} V${WALL - 6}"/>`)}</g>`)}
    ${skirting(trim)}
    ${sk(`<rect width="520" height="40" style="fill:#F1EEE6"/>${rows(8, i => `<rect x="${12 + i*68}" y="0" width="12" height="38" style="fill:#8A6A52"/>`)}<rect y="36" width="520" height="8" style="fill:#8A6A52"/>`, `<path d="M0 36 H520 M0 44 H520"/><path d="M70 40 h50 M300 40 h40" opacity=".4"/>`)}
    ${windowArt(wx, wy, trim, hills)}${radiator(wx - 24, WALL - 30, 48, "#EEF1F4")}
    ${sk(`<rect x="${fx-40}" y="44" width="80" height="${WALL - 44}" style="fill:#E7EDF2"/><rect x="${fx-27}" y="128" width="54" height="${WALL - 128}" style="fill:#CFC6BA"/>
      <path d="M${fx-15} ${WALL} V147 Q${fx} 137 ${fx+15} 147 V${WALL}z" style="fill:#3E302A"/><path d="M${fx-10} ${WALL - 2} l10 -5 l10 5z" style="fill:#8A5A3A"/><path d="M${fx-6} ${WALL - 5} q3 -10 7 -14 q2 7 6 4 q-1 6 -4 10z" style="fill:#F2A65A"/><path d="M${fx-2} ${WALL - 5} q2 -6 4 -8 q2 5 3 8z" style="fill:#F3C969"/>
      <rect x="${fx-33}" y="122" width="66" height="7" rx="1.5" style="fill:#9A6E48"/><rect x="${fx-36}" y="${WALL}" width="72" height="8" rx="1.5" style="fill:#BDB3A6"/>
      <rect x="${fx-28}" y="111" width="4" height="11" style="fill:${CREAM}"/><rect x="${fx+24}" y="111" width="4" height="11" style="fill:${CREAM}"/><path d="M${fx-26} 106 q2 3 0 5 q-2 -2 0 -5z M${fx+26} 106 q2 3 0 5 q-2 -2 0 -5z" style="fill:#F3C969"/>`,
      `<path d="M${fx-40} 44 V${WALL} M${fx+40} 44 V${WALL}"/><rect x="${fx-27}" y="128" width="54" height="${WALL - 128}"/><path d="M${fx-15} ${WALL} V147 Q${fx} 137 ${fx+15} 147 V${WALL}"/>
      <path d="M${fx-27} 142 h12 M${fx+15} 142 h12 M${fx-27} 157 h12 M${fx+15} 157 h12 M${fx-8} 129 v8 M${fx+8} 129 v8" opacity=".5"/><rect x="${fx-33}" y="122" width="66" height="7" rx="1.5"/><rect x="${fx-36}" y="${WALL}" width="72" height="8" rx="1.5"/>`)}
    ${sconce(fx - 54, 86)}${sconce(fx + 54, 86)}${logBasket(fx - 54, WALL + 10)}
    ${sk(`<rect x="334" y="70" width="40" height="42" rx="2" style="fill:${trim}"/><rect x="337" y="73" width="34" height="36" style="fill:#D6E8F2"/><path d="M337 96 q8 -6 17 -2 q9 -5 17 -1 v16 h-34z" style="fill:#A9C79A"/><path d="M337 90 h34 v10 q-4 3 -8.5 0 q-4 3 -8.5 0 q-4 3 -8.5 0 q-4 3 -8.5 0z" style="fill:#F3F0E8"/><rect x="332" y="110" width="44" height="4" rx="1" style="fill:${CREAM}"/>`,
      `<rect x="334" y="70" width="40" height="42" rx="2"/><rect x="337" y="73" width="34" height="36"/><path d="M354 73 v17"/><path d="M337 90 h34" /><g opacity=".4">${rows(5, i => `<path d="M${339 + i*7} 91 v7"/>`)}</g><rect x="332" y="110" width="44" height="4" rx="1"/>`)}
    ${kitchen(318, 398, "#B9C9DE", "#E7DCC8", 354)}
    ${shp([[R(398, KTOP - 2, 36, KFRONT - KTOP + 2, 3), "#F0E9DA"], [E(408, KTOP + 3, 6, 2.2), CHROME], [E(424, KTOP + 3, 6, 2.2), CHROME], [R(401, KTOP + 14, 14, 22, 1), "#E6DDCB"], [R(417, KTOP + 14, 14, 22, 1), "#E6DDCB"], [R(400, KTOP + 10, 32, 2, 1), CHROME]],
      `<path d="M418 ${KTOP - 2} q0 -8 6 -8 q6 0 6 8z" style="fill:#C2505F"/>`, `<path d="M418 ${KTOP - 2} q0 -8 6 -8 q6 0 6 8"/>`)}
    ${shp([[R(392, 100, 44, 3, 1), "#9A6E48"], [R(395, 91, 7, 9, 2), "#E3C58A"], [R(404, 92, 7, 8, 2), "#C9D9C0"], [C(418, 95, 4.5), CREAM], [C(428, 95, 4.5), CREAM], [C(418, 95, 2.4), "#7FA0D0"], [C(428, 95, 2.4), "#7FA0D0"]])}
    ${fridge(458, "#E9F0F5")}
    ${juteRug(COTTAGES.bluebell.slots.table[0], COTTAGES.bluebell.slots.table[1])}${runner(262, 400, 652, "#7F9BC8")}${doormat()}
    ${gardenDoor(trim, "#8FA7CF")}
    ${coatStand(486, 556, "#7F9BC8")}
    ${stairsUp()}${frontShade()}`; },

  // Fig Tree: warm cream limewash under low beams, the kitchen and the fridge on the left, a deep window seat, a range
  // in a brick fireplace with the sitting room round it, and a dresser in the corner
  figtree: () => { const [wx, wy] = COTTAGES.figtree.slots.curtains, fx = COTTAGES.figtree.slots.picture[0], trim = F_TRIM;
    return DEFS + flags() + `<rect width="520" height="${WALL}" style="fill:#F5E8CF"/>
    <g style="fill:#EADBBE" opacity=".7">${rows(12, i => `<ellipse cx="${(i*131) % 500 + 20}" cy="${(i*53) % 110 + 50}" rx="${12 + (i % 3)*6}" ry="${5 + (i % 2)*3}"/>`)}</g>
    ${skirting(trim)}
    ${sk(`<rect width="520" height="32" style="fill:${DARK}"/>${rows(7, i => `<rect x="${24 + i*80}" y="32" width="12" height="8" style="fill:${DARK}"/>`)}<rect x="0" y="32" width="10" height="${WALL - 32}" style="fill:#8A6448"/><rect x="510" y="32" width="10" height="${WALL - 32}" style="fill:#8A6448"/>`,
      `<rect width="520" height="32"/><path d="M10 32 V${WALL} M510 32 V${WALL}"/><path d="M40 14 h60 M180 10 h40 M330 16 h70" opacity=".4"/>`)}
    ${fridge(37, "#F2E3B3")}
    ${kitchen(58, 152, "#B9C69E", "#C99A62", 84)}
    ${shp([[R(60, 96, 88, 3, 1), "#9A6E48"], [R(62, 86, 8, 10, 2), "#E3C58A"], [R(72, 88, 7, 8, 2), "#C9D9C0"], [R(81, 85, 9, 11, 3), "#C98B6B"], [C(104, 90, 5), CREAM], [C(115, 90, 5), CREAM], [R(124, 87, 8, 9, 2), "#E3A5B0"], [R(135, 88, 8, 8, 2), "#F3C969"]],
      `<path d="M66 70 h76" style="stroke:#5A5550" stroke-width="1.6"/>${[74, 92, 112, 130].map((x, i) => `<path d="M${x} 70 v4" style="stroke:#5A5550" stroke-width="1"/><circle cx="${x}" cy="${78 + i % 2}" r="${4 + i % 2}" style="fill:${["#B8674A", "#8A8F94", "#C08D58", "#8A8F94"][i]}"/>`).join("")}`,
      `<path d="M66 70 h76"/>`)}
    ${sk(`<path d="M${wx-44} ${WALL} V70 Q${wx} 46 ${wx+44} 70 V${WALL}z" style="fill:#E6D2AE"/>`, `<path d="M${wx-44} ${WALL - 22} V70 Q${wx} 46 ${wx+44} 70 V${WALL - 22}"/>`)}
    ${windowArt(wx, wy, trim, garden)}
    ${shp([[R(wx-46, 150, 92, 10, 3), "#F3E7C8"], [R(wx-48, 160, 96, 28, 2), "#C99A62"], [R(wx-38, 141, 15, 11, 4), "#E3B26A"], [R(wx+22, 142, 14, 10, 4), "#9DB08A"]],
      rows(11, i => `<rect x="${wx-42 + i*8}" y="150" width="2.5" height="10" style="fill:#E3C58A"/>`), `<rect x="${wx-42}" y="164" width="42" height="20" rx="1" opacity=".55"/><rect x="${wx+2}" y="164" width="42" height="20" rx="1" opacity=".55"/>`)}
    ${sk(`<rect x="${fx-42}" y="32" width="84" height="${WALL - 32}" style="fill:#EFDFC2"/><rect x="${fx-38}" y="104" width="76" height="${WALL - 104}" style="fill:#C98B6B"/><rect x="${fx-28}" y="118" width="56" height="${WALL - 118}" style="fill:#3A2A24"/>
      <rect x="${fx-22}" y="134" width="44" height="${WALL - 134}" rx="1" style="fill:#2E2A28"/><rect x="${fx-18}" y="142" width="16" height="20" rx="1" style="fill:#3E3A38"/><rect x="${fx+3}" y="144" width="14" height="9" rx="2" style="fill:#F2A65A"/><rect x="${fx+6}" y="118" width="6" height="16" style="fill:#2E2A28"/>
      <path d="M${fx-16} 133 q0 -8 6 -8 q6 0 6 8z" style="fill:#5E6B78"/><rect x="${fx-42}" y="98" width="84" height="8" rx="1.5" style="fill:${DARK}"/><rect x="${fx-40}" y="${WALL}" width="80" height="8" rx="1.5" style="fill:#B5754F"/>
      ${rows(9, i => `<circle cx="${fx-36 + i*9}" cy="${95 + (i % 2)*2}" r="2.6" style="fill:#B9C98A"/>`)}`,
      `<path d="M${fx-42} 32 V98 M${fx+42} 32 V98"/><rect x="${fx-38}" y="104" width="76" height="${WALL - 104}"/><rect x="${fx-28}" y="118" width="56" height="${WALL - 118}"/><rect x="${fx-22}" y="134" width="44" height="${WALL - 134}" rx="1"/><rect x="${fx-18}" y="142" width="16" height="20" rx="1"/><rect x="${fx+3}" y="144" width="14" height="9" rx="2"/>
      ${rows(4, r => `<path d="M${fx-38} ${112 + r*14} h10 M${fx+28} ${112 + r*14} h10"/>`)}<path d="M${fx-16} 133 q0 -8 6 -8 q6 0 6 8z"/><rect x="${fx-42}" y="98" width="84" height="8" rx="1.5"/><rect x="${fx-40}" y="${WALL}" width="80" height="8" rx="1.5"/>`)}
    ${sconce(fx - 58, 80)}${sconce(fx + 58, 80)}${logBasket(fx - 54, WALL + 10)}
    ${juteRug(COTTAGES.figtree.slots.table[0], COTTAGES.figtree.slots.table[1])}${runner(262, 400, 652, "#C98B6B")}${doormat()}
    ${gardenDoor(trim, OAK)}
    ${coatStand(486, 556, "#C8923A")}
    ${stairsUp()}${frontShade()}`; },

  // upstairs. Bluebell: two beds under the eaves, a dormer over each, a bedside table each side, a chest of drawers
  // between them (the little touches go on it), a wardrobe, and the bathroom door
  bluebellup: () => { const s = COTTAGES.bluebell.slots, trim = B_TRIM;
    return DEFS + boards("#DCCBAE", "#BFA986") + `<rect width="520" height="${WALL}" style="fill:#DDE5EC"/>${sprigs(70, 6, "#B4C4D4")}
    ${skirting(trim)}
    ${sk(`<path d="M0 0 H520 V100 L456 36 H64 L0 100z" style="fill:#F3F0E8"/><path d="M0 100 L64 36 H456 L520 100" style="fill:none;stroke:#8A6A52" stroke-width="6"/>`, `<path d="M0 100 L64 36 H456 L520 100"/><path d="M130 36 V0 M260 36 V0 M390 36 V0 M30 70 L60 0 M490 70 L460 0" opacity=".35"/>`)}
    ${dormer(s.bed[0], 98, trim)}${dormer(s.bed2[0], 98, trim)}
    ${ragOval(250, 282, 170, 34, ["#C9D6E4", "#E8C9A8", "#7F9BC8", "#F3E7C8", "#A9BCD8"])}
    ${blanketBox(s.bed[0], WALL + 92, "#A9BCD8", "#E3A5B0")}${blanketBox(s.bed2[0], WALL + 92, "#A9BCD8", "#F3C969")}
    ${wardrobe(42, WALL + 16, "#A9BCD8")}
    ${[s.bed[0] - 42, s.bed[0] + 42, s.bed2[0] - 42, s.bed2[0] + 42].map(x => bedside(x, WALL + 14, "#9A6E48", "#F6E7C4")).join("")}
    ${chest(s.touches[0], s.touches[1], "#A9BCD8")}
    ${bathDoor(trim, "#A9BCD8", "#8FA7CF")}
    ${stairsDown()}${frontShade()}`; },

  // Fig Tree upstairs: one bedroom under low beams, the bed under the dormer, a washstand with a jug and bowl, a
  // wardrobe, and a chest of drawers for the little touches
  figtreeup: () => { const s = COTTAGES.figtree.slots, trim = F_TRIM;
    return DEFS + boards("#D9BD96", "#BE9E74") + `<rect width="520" height="${WALL}" style="fill:#F5E8CF"/>
    <g style="fill:#EADBBE" opacity=".7">${rows(10, i => `<ellipse cx="${(i*131) % 500 + 20}" cy="${(i*53) % 100 + 60}" rx="${12 + (i % 3)*6}" ry="${5 + (i % 2)*3}"/>`)}</g>
    ${skirting(trim)}
    ${sk(`<path d="M0 0 H520 V30 L440 48 H80 L0 30z" style="fill:${DARK}"/>${rows(5, i => `<rect x="${90 + i*80}" y="48" width="12" height="7" style="fill:${DARK}"/>`)}<rect x="0" y="30" width="10" height="${WALL - 30}" style="fill:#8A6448"/><rect x="510" y="30" width="10" height="${WALL - 30}" style="fill:#8A6448"/>`,
      `<path d="M0 30 L80 48 H440 L520 30"/><path d="M10 30 V${WALL} M510 30 V${WALL}"/>`)}
    ${dormer(s.bed[0], 98, trim)}
    ${wardrobe(48, WALL + 16, "#C08D58")}
    ${shp([[R(108, WALL - 22, 44, 5, 1.5), "#9A6E48"], [R(110, WALL - 17, 40, 14, 1), OAK], [E(130, WALL - 23, 13, 3), "#E3EEF2"], [Pa(`M123 ${WALL - 23} q-1 -12 4 -15 h6 q3 2 2 5 q4 0 3 5 l-3 1 q0 3 -2 4z`), "#F3F0E8"], [R(119, WALL - 50, 22, 26, 2), "#C08D58"], [R(122, WALL - 47, 16, 20), "#E6EEF2"]],
      `<path d="M114 ${WALL - 3} v17 M146 ${WALL - 3} v17" style="stroke:${DARK}" stroke-width="2.4"/>`, `<path d="M126 ${WALL - 44} l6 -6" opacity=".5"/>`)}
    ${[s.bed[0] - 42, s.bed[0] + 42].map(x => bedside(x, WALL + 14, OAK, "#F6E7C4")).join("")}
    ${chest(s.touches[0], s.touches[1], "#C08D58")}
    ${ragOval(s.bed[0], 280, 96, 30, ["#E3B26A", "#9DB08A", "#F3E7C8", "#C98B6B", "#F1D9A8"])}
    ${blanketBox(s.bed[0], WALL + 92, "#C08D58", "#9DB08A")}
    ${bathDoor(trim, "#C08D58", OAK)}
    ${stairsDown()}${frontShade()}`; },

  // the bathrooms, through the bedroom. Bluebell: blue-and-white tiles to the dado, sprig paper above; the bath under
  // the window, the basin and towels in the middle, the loo and the towel cupboard on the right
  bluebellbath: () => { const s = COTTAGES.bluebell.slots, trim = B_TRIM, DADO = 120;
    return DEFS + chequer("#EEEBE2", "#B9C4D2") + `<rect width="520" height="${WALL}" style="fill:#E8EEF3"/>${sprigs(46, 4, "#B4C4D4")}
    <rect y="${DADO}" width="520" height="${WALL - DADO}" style="fill:#F7F8F5"/>
    <g style="fill:#B9CBE3">${rows(5, r => rows(44, k => (r*3 + k*2) % 7 === 0 ? `<rect x="${k*12}" y="${DADO + 4 + r*9.6}" width="12" height="9.6"/>` : ""))}</g>
    <g style="stroke:#C9D3DE" stroke-width=".8">${rows(5, r => `<path d="M0 ${DADO + 4 + r*9.6} H520"/>`)}${rows(44, k => `<path d="M${k*12} ${DADO + 4} V${WALL}"/>`)}</g>
    ${sk(`<rect y="${DADO - 2}" width="520" height="5" style="fill:${trim}"/>`, `<path d="M0 ${DADO - 2} H520 M0 ${DADO + 3} H520" opacity=".6"/>`)}${skirting(trim)}
    ${sk(`<path d="M0 0 H520 V22 L470 34 H50 L0 22z" style="fill:#F3F0E8"/><path d="M0 22 L50 34 H470 L520 22" style="fill:none;stroke:#8A6A52" stroke-width="5"/>`, `<path d="M0 22 L50 34 H470 L520 22"/>`)}
    ${frosted(s.bath[0], 92, trim)}${sconce(s.basin[0] - 34, 70)}${sconce(s.basin[0] + 34, 70)}
    ${pegRail(s.toiletries[0] + 46, 74, trim, "#A9BCD8", "#F3F0E8")}
    ${loo(404, WALL + 16, "#9A6E48")}${wallShelf(404, 54, "#9A6E48")}
    ${towelCupboard(44, WALL + 16, "#C9D6E4")}
    ${laundry(s.toiletries[0] + 50, WALL + 16)}${frontShade()}`; },

  // Fig Tree: cream tongue-and-groove to the dado, limewash above, terracotta tiles underfoot; the towel cupboard and
  // the loo on the left, the basin, and the bath under the window on the right
  figtreebath: () => { const s = COTTAGES.figtree.slots, trim = F_TRIM, DADO = 116;
    return DEFS + terracotta() + `<rect width="520" height="${WALL}" style="fill:#F5E8CF"/>
    <g style="fill:#EADBBE" opacity=".7">${rows(8, i => `<ellipse cx="${(i*131) % 500 + 20}" cy="${(i*41) % 60 + 40}" rx="${12 + (i % 3)*6}" ry="${5 + (i % 2)*3}"/>`)}</g>
    ${sk(`<rect y="${DADO}" width="520" height="${WALL - DADO}" style="fill:#F1E3C2"/><rect y="${DADO - 4}" width="520" height="6" style="fill:${trim}"/><rect y="${WALL - 7}" width="520" height="7" style="fill:#C99A62"/>`,
      `<g opacity=".4">${rows(74, k => `<path d="M${4 + k*7} ${DADO + 2} V${WALL - 7}"/>`)}</g><path d="M0 ${DADO + 2} H520 M0 ${WALL - 7} H520" opacity=".6"/>`)}
    ${sk(`<rect width="520" height="20" style="fill:${DARK}"/>${rows(7, i => `<rect x="${24 + i*80}" y="20" width="12" height="7" style="fill:${DARK}"/>`)}`, `<rect width="520" height="20"/><path d="M40 10 h60 M180 7 h40 M330 12 h70" opacity=".4"/>`)}
    ${frosted(s.bath[0], 90, trim)}${sconce(s.basin[0], 50)}
    ${pegRail(s.towels[0] + 44, 70, OAK, "#F3E7C8", "#E3B26A")}
    ${loo(96, WALL + 16, OAK)}${wallShelf(96, 50, OAK)}
    ${towelCupboard(42, WALL + 16, "#E8D9B8")}
    ${laundry(130, WALL + 16)}${frontShade()}`; },

  // the gardens, out of the back door. Bluebell's is the bigger, with a picket fence; Fig Tree's is hedged, with its
  // fig tree in the corner
  bluebellgdn: info => gardenScene(info, {wall: "#EEF0EC", course: "#D5DAD6", roof: "#6D7685", trim: "#5E7AB0", door: "#7F9BC8", bike2: "#9DB08A", wins: [110, 410], fence: "picket", side: 22,
    at: {patio: [162, 262], bbq: [64, 258], firepit: [150, 440], bikes: [444, 262], hammock: [400, 364], hottub: [404, 508]}}),
  figtreegdn: info => gardenScene(info, {wall: "#F5E8CF", course: "#EADBBE", roof: "#B8674A", trim: "#C8923A", door: "#B07D4A", bike2: "#7FA0D0", wins: [392], fence: "hedge", side: 40, fig: true,
    at: {patio: [192, 266], bbq: [100, 396], firepit: [170, 476], bikes: [428, 262], hammock: [380, 372], hottub: [404, 520]}})
};

// ---------- the pieces: each takes its slot (where it stands on the floor), the tier and the tint ----------
// beds come in two halves so the bedding goes between the headboard and the footboard. A double bed: 54 wide, the
// headboard 38 high against the wall 60 behind the foot of the bed, the mattress 20 off the floor.
function bed(x, y, t){
  if (t === 1) return {back: shp([[R(x-29, y-96, 58, 40, 7), PINE], [R(x-27, y-80, 54, 62, 3), "#F4EFE4"]], "", `<path d="M${x-20} ${y-88} q10 -3 20 0 M${x+4} ${y-82} q9 -2 16 0" opacity=".4"/>`),
    front: shp([[R(x-29, y-22, 58, 11, 2), PINE]], `<path d="M${x-26} ${y-11} v11 M${x+26} ${y-11} v11" style="stroke:${D(PINE, .2)}" stroke-width="3"/>`, `<path d="M${x-27} ${y-11} v11 M${x+27} ${y-11} v11"/>`)};
  if (t === 2) return {back: shp([[R(x-32, y-100, 5, 46, 2), OAK], [R(x+27, y-100, 5, 46, 2), OAK], [C(x-29.5, y-101, 3.2), OAK], [C(x+29.5, y-101, 3.2), OAK], [Pa(`M${x-27} ${y-58} V${y-86} Q${x} ${y-104} ${x+27} ${y-86} V${y-58}z`), "#C08D58"], [R(x-27, y-80, 54, 62, 3), "#F4EFE4"]],
      "", `<path d="M${x-20} ${y-80} V${y-86} Q${x} ${y-98} ${x+20} ${y-86} V${y-80}" opacity=".5"/>`),
    front: shp([[R(x-29, y-27, 58, 17, 3), "#C08D58"], [R(x-32, y-31, 5, 31, 2), OAK], [R(x+27, y-31, 5, 31, 2), OAK], [C(x-29.5, y-32, 2.8), OAK], [C(x+29.5, y-32, 2.8), OAK]], "", `<rect x="${x-22}" y="${y-24}" width="44" height="10" rx="1.5" opacity=".5"/>`)};
  return {back: sk(`<path d="M${x-29} ${y-101} V${y-58} M${x+29} ${y-101} V${y-58} M${x-29} ${y-74} H${x+29}" style="stroke:${BRASS};fill:none" stroke-width="2.6"/><path d="M${x-29} ${y-96} Q${x} ${y-112} ${x+29} ${y-96}" style="stroke:${BRASS};fill:none" stroke-width="2.6"/>
      ${rows(5, i => `<path d="M${x-20 + i*10} ${y-74} V${y-99 - (i === 2 ? 4 : i % 2 ? 2 : 0)}" style="stroke:${BRASS}" stroke-width="1.6"/>`)}<circle cx="${x}" cy="${y-90}" r="3.4" style="fill:${CREAM}"/>
      <circle cx="${x-29}" cy="${y-102}" r="3" style="fill:${BRASS}"/><circle cx="${x+29}" cy="${y-102}" r="3" style="fill:${BRASS}"/><rect x="${x-27}" y="${y-80}" width="54" height="62" rx="4" style="fill:#F6F1E6"/>`,
      `<path d="M${x-30.5} ${y-101} V${y-58} M${x+30.5} ${y-101} V${y-58} M${x-29} ${y-96} Q${x} ${y-112} ${x+29} ${y-96}"/><circle cx="${x-29}" cy="${y-102}" r="3"/><circle cx="${x+29}" cy="${y-102}" r="3"/><circle cx="${x}" cy="${y-90}" r="3.4"/><rect x="${x-27}" y="${y-80}" width="54" height="62" rx="4"/>`),
    front: sk(`<path d="M${x-29} ${y-26} H${x+29} M${x-29} ${y-14} H${x+29}" style="stroke:${BRASS}" stroke-width="2.2"/>${rows(7, i => `<path d="M${x-21 + i*7} ${y-26} V${y-14}" style="stroke:${BRASS}" stroke-width="1.4"/>`)}<path d="M${x-29} ${y-30} V${y} M${x+29} ${y-30} V${y}" style="stroke:${BRASS}" stroke-width="2.6"/>
      <circle cx="${x-29}" cy="${y-31}" r="2.6" style="fill:${BRASS}"/><circle cx="${x+29}" cy="${y-31}" r="2.6" style="fill:${BRASS}"/>`,
      `<path d="M${x-30.5} ${y-30} V${y} M${x+30.5} ${y-30} V${y}"/><circle cx="${x-29}" cy="${y-31}" r="2.6"/><circle cx="${x+29}" cy="${y-31}" r="2.6"/><path d="M${x-29} ${y-27} H${x+29}" opacity=".5"/>`)};
}
// the bedding, on the bed at (x, y) or folded on the floor if there's no bed yet
function linenPileBig(x, y, t, c){
  const pile = [[CREAM, 0], [t === 3 ? "patch" : c, 1], ...(t > 1 ? [[CREAM, 2]] : []), ...(t === 3 ? [[L(c, .4), 3]] : [])];
  return sk(pile.map(([col, i]) => col === "patch" ? `<rect x="${x-36}" y="${y-14 - i*14}" width="72" height="14" rx="4" style="fill:${c}"/>${rows(6, k => k % 2 ? `<rect x="${x-36 + k*12}" y="${y-14 - i*14}" width="12" height="14" style="fill:${L(c, .55)}"/>` : "")}` : `<rect x="${x-36 + i*2}" y="${y-14 - i*14}" width="${72 - i*4}" height="14" rx="4" style="fill:${col}"/>`).join("") + (t > 1 ? `<path d="M${x-30} ${y-14 - pile.length*14} h60" style="stroke:${D(c, .2)}" stroke-width="3"/>` : ""),
    pile.map((p, i) => `<rect x="${x-36 + (p[0] === "patch" ? 0 : i*2)}" y="${y-14 - i*14}" width="${p[0] === "patch" ? 72 : 72 - i*4}" height="14" rx="4"/>`).join(""));
}
function linen(x, y, t, c, onBed){
  if (!onBed) return sc(x, y, .42, () => linenPileBig(x, y, t, c));
  if (t === 1) return shp([[R(x-16, y-81, 32, 11, 4.5), CREAM], [R(x-27, y-68, 54, 6, 2), CREAM], [R(x-27, y-63, 54, 45, 2), c]], "", `<path d="M${x-24} ${y-59} h48" stroke-dasharray="2 3" opacity=".6"/>`);
  if (t === 2) return shp([[R(x-25, y-83, 23, 13, 5), CREAM], [R(x+2, y-83, 23, 13, 5), CREAM], [Pa(`M${x-28} ${y-66} H${x+28} V${y-20} ${"q-3.5 4 -7 0 ".repeat(8)}z`), c], [R(x-28, y-66, 56, 7, 2.5), L(c, .45)]], "",
    `<g opacity=".45" stroke-dasharray="1.5 2.5">${rows(3, i => `<path d="M${x-25} ${y-52 + i*9} H${x+25}"/>`)}${rows(4, i => `<path d="M${x-15 + i*10} ${y-57} V${y-23}"/>`)}</g>`);
  const pc = [c, L(c, .55), "#FFF6E6", D(c, .2)];
  return sk(`<rect x="${x-26}" y="${y-89}" width="24" height="16" rx="6" style="fill:${CREAM}"/><rect x="${x+2}" y="${y-89}" width="24" height="16" rx="6" style="fill:${CREAM}"/>
    <rect x="${x-23}" y="${y-81}" width="19" height="12" rx="5" style="fill:${L(c, .25)}"/><rect x="${x+4}" y="${y-81}" width="19" height="12" rx="5" style="fill:${L(c, .25)}"/><rect x="${x-8}" y="${y-75}" width="16" height="7" rx="3.5" style="fill:${D(c, .15)}"/>
    <rect x="${x-28}" y="${y-68}" width="56" height="6" rx="2" style="fill:${CREAM}"/>
    ${rows(4, r => rows(8, k => `<rect x="${x-28 + k*7}" y="${y-62 + r*10.5}" width="7" height="10.5" style="fill:${pc[(r + k*3) % 4]}"/>`))}
    <rect x="${x-29}" y="${y-27}" width="58" height="6" rx="2" style="fill:${D(c, .3)}"/>`,
    `<rect x="${x-26}" y="${y-89}" width="24" height="16" rx="6"/><rect x="${x+2}" y="${y-89}" width="24" height="16" rx="6"/><rect x="${x-23}" y="${y-81}" width="19" height="12" rx="5"/><rect x="${x+4}" y="${y-81}" width="19" height="12" rx="5"/><rect x="${x-8}" y="${y-75}" width="16" height="7" rx="3.5"/>
    <rect x="${x-28}" y="${y-68}" width="56" height="6" rx="2"/><rect x="${x-28}" y="${y-62}" width="56" height="42" rx="1"/><g opacity=".3">${rows(3, r => `<path d="M${x-28} ${y-51.5 + r*10.5} h56"/>`)}${rows(7, k => `<path d="M${x-21 + k*7} ${y-62} v42"/>`)}</g>
    <rect x="${x-29}" y="${y-27}" width="58" height="6" rx="2"/><path d="M${x-29} ${y-21} ${rows(10, () => "l1.45 2.5 l1.45 -2.5 ").trim()}" opacity=".5"/>`);
}
// the seat faces the fire, so we see it from behind: (x, y) is the middle of its back, on the floor. An armchair is
// about half the player's width; the sofas about 1.2 times her height long, their backs half her height
function seat(x, y, t, c){
  if (t === 1) return shp([[R(x-18, y-26, 6, 22, 3), "#C9A46A"], [R(x+12, y-26, 6, 22, 3), "#C9A46A"], [Pa(`M${x-14} ${y-5} V${y-24} Q${x} ${y-40} ${x+14} ${y-24} V${y-5}z`), "#DDBF86"], [Pa(`M${x-9} ${y-30} q9 -5 18 0 l-1 13 q-8 3 -16 0z`), c]],
      `<path d="M${x-12} ${y-5} l-1 5 M${x+12} ${y-5} l1 5" style="stroke:#B58E58" stroke-width="2"/>`,
      `<g opacity=".4">${rows(4, i => `<path d="M${x-11 + i*7} ${y-32 + Math.abs(i - 1.5)*2} l6 26"/><path d="M${x-5 + i*7} ${y-32 + Math.abs(i - 1.5)*2} l-6 26"/>`)}</g><path d="M${x-12} ${y-5} l-1 5 M${x+12} ${y-5} l1 5"/>`);
  if (t === 2) return shp([[R(x-28, y-38, 27, 10, 5), L(c, .15)], [R(x+1, y-38, 27, 10, 5), L(c, .15)], [R(x-40, y-28, 13, 26, 6), D(c, .12)], [R(x+27, y-28, 13, 26, 6), D(c, .12)], [R(x-31, y-33, 62, 30, 8), c],
      [Pa(`M${x+6} ${y-34} q10 -3 20 0 l1 18 l-4 4 l-4 -4 l-4 4 l-4 -4 l-4 4 z`), "#F3E7C8"]],
    `<path d="M${x-35} ${y-2} v2 M${x+35} ${y-2} v2" style="stroke:${DARK}" stroke-width="2.4"/>`, `<path d="M${x-27} ${y-12} h54" opacity=".35"/><path d="M${x-35} ${y-2} v2 M${x+35} ${y-2} v2"/>`);
  const v = D(c, .18), fx = x - 54, fy = y + 10;
  const back = `M${x-36} ${y-4} V${y-22} Q${x-36} ${y-30} ${x-26} ${y-30} Q${x-14} ${y-30} ${x-8} ${y-36} Q${x} ${y-42} ${x+8} ${y-36} Q${x+14} ${y-30} ${x+26} ${y-30} Q${x+36} ${y-30} ${x+36} ${y-22} V${y-4}z`;
  return shp([[R(x-42, y-30, 11, 27, 5), c], [R(x+31, y-30, 11, 27, 5), c], [E(x-36.5, y-30, 6, 4), L(c, .12)], [E(x+36.5, y-30, 6, 4), L(c, .12)], [Pa(back), v], [R(x-38, y-6, 76, 4, 1.5), c]],
      `${rows(2, r => rows(5, i => `<circle cx="${x-20 + i*10}" cy="${y-24 + r*9}" r="1.2" style="fill:${D(c, .4)}"/>`))}<path d="M${x-24} ${y-28} Q${x} ${y-36} ${x+18} ${y-28}" style="stroke:${CREAM};fill:none" stroke-width="2" opacity=".35"/>
       <path d="M${x-34} ${y-2} l-1 3 M${x+34} ${y-2} l1 3" style="stroke:${DARK}" stroke-width="2.4"/>`
      + `<rect x="${fx-12}" y="${fy-13}" width="24" height="9" rx="4" style="fill:${c}"/><rect x="${fx-12}" y="${fy-6}" width="24" height="3" style="fill:${BRASS}"/><path d="M${fx-9} ${fy-3} v3 M${fx+9} ${fy-3} v3" style="stroke:${DARK}" stroke-width="2.4"/>`,
    `<path d="M${x-38} ${y-2} ${rows(13, () => "l3 2.5 l3 -2.5 ").trim()}" opacity=".5"/><rect x="${fx-12}" y="${fy-13}" width="24" height="9" rx="4"/><path d="M${fx-12} ${fy-3} ${rows(4, () => "l3 2 l3 -2 ").trim()}" opacity=".6"/>`);
}
// the dining table: about 0.9 of the player's height long, its top a little under half her height, chairs to match.
// The top is seen from above, from y-56 (the far edge) to y-29; the welcome is set out on it at y-46.
function table(x, y, t, c){
  const W = [0, 50, 58, 66][t], top = [0, PINE, "#C08D58", "#EAD7B4"][t], legC = [0, PINE, OAK, DARK][t], wood = t === 1 ? c : t === 2 ? OAK : DARK, pad = t === 1 ? null : c;
  const back = cx => t === 3 ? [[R(cx-8, y-92, 16, 36, 2), null], [R(cx-8, y-92, 3, 36, 1), wood], [R(cx+5, y-92, 3, 36, 1), wood], ...[0, 1, 2].map(i => [R(cx-6, y-88 + i*9, 12, 3, 1), L(wood, .25)])]
    : [[R(cx-8, y-84, 16, 26, 3), wood]];
  const end = (cx, d) => { const bx = cx + d*7;
    return [[R(cx-8, y-31, 16, 5, 2), pad || wood], [R(bx-2, y-(t === 3 ? 58 : 52), 4, t === 3 ? 30 : 24, 1.5), wood], ...(t === 3 ? [0, 1].map(i => [R(bx-3.5, y-52 + i*8, 7, 2.4, 1), wood]) : [])]; };
  const parts = [...(t > 1 ? [...back(x - W/4), ...back(x + W/4)] : []),
    [R(x-W/2, y-56, W, 27, 3), top], [R(x-W/2, y-30, W, 5, 1), t === 3 ? DARK : D(top, .15)], [R(x-W/2 + 3, y-25, 4, 25), legC], [R(x+W/2 - 7, y-25, 4, 25), legC],
    ...(t === 3 ? [[R(x-W/2 + 6, y-49, W - 12, 10, 1), c, 0]] : t === 1 ? [[R(x-W/2 + 6, y-52, 12, 10, 1), L(c, .3), 0]] : []),
    ...end(x - W/2 - 9, -1), ...end(x + W/2 + 9, 1)];
  return shp(parts, rows(2, i => { const cx = x + (i ? 1 : -1)*(W/2 + 9); return `<path d="M${cx-6} ${y-26} v16 M${cx+6} ${y-26} v16" style="stroke:${D(wood, .1)}" stroke-width="1.8"/>`; }),
    rows(2, i => { const cx = x + (i ? 1 : -1)*(W/2 + 9); return `<path d="M${cx-6} ${y-26} v16 M${cx+6} ${y-26} v16" opacity=".6"/>`; }) + (t === 2 ? `<path d="M${x-W/2 + 8} ${y-48} h${W/3}" opacity=".35"/>` : ""));
}
// the little touches, on the chest of drawers (its top is 30 up): wildflowers; cushions and a throw; a tea tray, a vase
// and a basket of books on the floor beside
function touches(x, y, t, c){
  const s = y - 34;
  if (t === 1) return sk(`<rect x="${x+4}" y="${s-9}" width="8" height="9" rx="2" style="fill:#D6E8F2" opacity=".85"/>${[[-6, -20, "#7FA0D0"], [0, -24, CREAM], [5, -19, "#C2505F"], [-2, -17, c], [3, -26, "#F3C969"]].map(([dx, dy, col]) => `<path d="M${x+8} ${s-8} L${x+8+dx} ${s+dy}" style="stroke:#6F9A5E" stroke-width="1"/><circle cx="${x+8+dx}" cy="${s+dy}" r="2.2" style="fill:${col}"/>`).join("")}`,
    `<rect x="${x+4}" y="${s-9}" width="8" height="9" rx="2"/>`);
  if (t === 2) return shp([[Pa(`M${x-20} ${s} h16 v22 l-4 3 l-4 -3 l-4 3 l-4 -3z`), c], [R(x+1, s-10, 14, 11, 4), L(c, .3)], [R(x+9, s-8, 12, 9, 4), CREAM]], `<path d="M${x+10} ${s-4} h10" style="stroke:${c}" stroke-width="2"/>`,
    `<path d="M${x-18} ${s+4} h12" opacity=".4"/>`);
  return shp([[R(x-19, s-3, 26, 3, 1), OAK], [E(x-10, s-7, 6, 5), CREAM], [R(x+1, s-6, 4, 4, 1), CREAM], [R(x-3, s-5, 3, 3, 1), CREAM], [R(x+11, s-10, 6, 10, 2), L(c, .4)], [R(x+24, y-11, 14, 11, 1.5), "#D9B97E"]],
    `<path d="M${x-4} ${s-9} l4 -3" style="stroke:${CREAM}" stroke-width="2"/>${[[-3, -17, "#F3C969"], [2, -20, CREAM], [5, -16, "#C2505F"]].map(([dx, dy, col]) => `<path d="M${x+14} ${s-10} L${x+14+dx} ${s+dy}" style="stroke:#6F9A5E" stroke-width="1"/><circle cx="${x+14+dx}" cy="${s+dy}" r="2.2" style="fill:${col}"/>`).join("")}
     ${[["#C2505F", 0], ["#7FA0D0", 1], ["#F3C969", 2], ["#9DB08A", 3]].map(([col, i]) => `<rect x="${x+26 + i*2.6}" y="${y-17 + i % 2*2}" width="2.4" height="8" style="fill:${col}"/>`).join("")}`,
    `<path d="M${x+25} ${y-6} h12" opacity=".4"/>`);
}
// the bath stands with its back to the back wall; (x, y) is the middle of its front, on the floor. About 1.05 times
// the player's height long, and its rim about a third of her height up
function bath(x, y, t, c){
  if (t === 1) return `<ellipse cx="${x}" cy="${y}" rx="30" ry="3.5" style="fill:#3A2E28" opacity=".1"/>` + shp([[Pa(`M${x-30} ${y-20} L${x-26} ${y-3} Q${x} ${y+2} ${x+26} ${y-3} L${x+30} ${y-20}z`), "#B9C2C8"], [E(x, y-20, 31, 6), "#D5DCE0"], [E(x, y-20, 27, 4), WATER, 0], [E(x-33, y-17, 2.4, 3.4), null], [E(x+33, y-17, 2.4, 3.4), null], [R(x+12, y-28, 7, 9, 2), c]],
    `<path d="M${x-29} ${y-14} Q${x} ${y-9} ${x+29} ${y-14} M${x-28} ${y-8} Q${x} ${y-3} ${x+28} ${y-8}" style="stroke:#9AA5AD;fill:none" stroke-width="1.6"/>`, `<ellipse cx="${x}" cy="${y-20}" rx="27" ry="4" opacity=".6"/>`);
  if (t === 2) return shp([[R(x-26, y-44, 3, 8, 1), CHROME], [R(x-18, y-44, 3, 8, 1), CHROME], [C(x-24.5, y-45, 2.6), CHROME], [C(x-16.5, y-45, 2.6), CHROME], [R(x-34, y-38, 68, 14, 5), PORC], [R(x-30, y-35, 60, 8, 3), WATER], [R(x-34, y-25, 68, 22, 2), c], [R(x-34, y-4, 68, 4), D(c, .25)]], "",
    `<rect x="${x-30}" y="${y-21}" width="28" height="14" rx="1" opacity=".5"/><rect x="${x+2}" y="${y-21}" width="28" height="14" rx="1" opacity=".5"/>`);
  // the clawfoot: a double-ended roll top on four brass feet, painted outside, a mixer in the middle and a bath rack
  const foot = fx => `<path d="M${fx-3} ${y-9} q-2 4 -4 9 h4 q1 -3 3 -3 q2 0 3 3 h4 q-2 -5 -4 -9z"/>`;
  const body = `M${x-34} ${y-28} Q${x-36} ${y-12} ${x-22} ${y-8} H${x+22} Q${x+36} ${y-12} ${x+34} ${y-28}z`, rim = `M${x-36} ${y-27} Q${x-37} ${y-37} ${x-30} ${y-36} Q${x} ${y-32} ${x+30} ${y-36} Q${x+37} ${y-37} ${x+36} ${y-27} Q${x} ${y-23} ${x-36} ${y-27}z`;
  return `<ellipse cx="${x}" cy="${y}" rx="30" ry="3" style="fill:#3A2E28" opacity=".1"/>` + shp([[foot(x - 22), BRASS], [foot(x + 22), BRASS], [Pa(body), c], [Pa(rim), PORC], [Pa(`M${x-30} ${y-31} Q${x} ${y-28} ${x+30} ${y-31} Q${x} ${y-30} ${x-30} ${y-31}z`), WATER, 0],
      [R(x+4, y-35, 24, 2.6, 1), OAK], [R(x+8, y-39, 7, 4, 2), "#F3D36A"], [R(x+19, y-41, 4, 6, 1), L(c, .5)]],
    `<path d="M${x-4} ${y-33} v-7 q4 -5 8 0 v7" style="stroke:${BRASS};fill:none" stroke-width="1.8"/><path d="M${x-29} ${y-20} Q${x-30} ${y-13} ${x-20} ${y-11}" style="stroke:${L(c, .4)};fill:none" stroke-width="2" opacity=".7"/>`,
    `<path d="M${x-4} ${y-33} v-7 q4 -5 8 0 v7"/>`);
}
// the brass glow for the bigger pieces drawn by the old hands, scaled down
function shelfBig(x, y, t, c){
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
function lampBig(x, y, t, c){
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
function rugBig(x, y, t, c){
  const ln = (w) => `style="stroke:${LINE}" stroke-width="${(w/SC).toFixed(2)}"`;
  if (t === 1) { const cs = [c, "#F3E7C8", D(c, .25), "#E8C9A8", c, "#FFFDF6"];
    return `<g filter="url(#wob)">${cs.map((col, i) => `<ellipse cx="${x}" cy="${y}" rx="${80 - i*12}" ry="${32 - i*4.8}" style="fill:${col}"/>`).join("")}<ellipse cx="${x}" cy="${y}" rx="80" ry="32" fill="none" ${ln(1.1)}/>
      ${cs.map((_, i) => `<ellipse cx="${x}" cy="${y}" rx="${80 - i*12}" ry="${32 - i*4.8}" fill="none" ${ln(.5)} stroke-dasharray="2 5" opacity=".5"/>`).join("")}</g>`; }
  if (t === 2) return `<g filter="url(#wob)"><rect x="${x-104}" y="${y-38}" width="208" height="76" rx="3" style="fill:${L(c, .4)}"/>${[-30, -22, 18, 26].map(d => `<rect x="${x-104}" y="${y+d}" width="208" height="6" style="fill:${c}"/>`).join("")}
      <path d="M${x-96} ${y-4} ${rows(16, () => "l6 -6 l6 6 ").trim()}" fill="none" style="stroke:${D(c, .2)}" stroke-width="2"/><rect x="${x-104}" y="${y-38}" width="208" height="76" rx="3" fill="none" ${ln(1.1)}/>
      <path d="${rows(12, i => `M${x-104} ${y-34 + i*6.4} h-7 M${x+104} ${y-34 + i*6.4} h7 `)}" ${ln(.7)} opacity=".6"/></g>`;
  const deep = D(c, .35);
  return `<g filter="url(#wob)"><rect x="${x-124}" y="${y-48}" width="248" height="96" rx="3" style="fill:${deep}"/><rect x="${x-110}" y="${y-36}" width="220" height="72" style="fill:${c}"/><rect x="${x-104}" y="${y-30}" width="208" height="60" style="fill:${L(c, .2)}"/>
    ${rows(22, i => `<path d="M${x-118 + i*11} ${y-42} l4 -3 l4 3 l-4 3z M${x-118 + i*11} ${y+42} l4 -3 l4 3 l-4 3z" style="fill:#F3E7C8"/>`)}
    <path d="M${x-62} ${y} L${x} ${y-26} L${x+62} ${y} L${x} ${y+26}z" style="fill:${deep}"/><path d="M${x-40} ${y} L${x} ${y-16} L${x+40} ${y} L${x} ${y+16}z" style="fill:#F3E7C8"/><circle cx="${x}" cy="${y}" r="7" style="fill:#C2505F"/>
    ${[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<path d="M${x + a*104} ${y + b*30} q${-a*22} 0 ${-a*28} ${-b*14} q${a*4} ${-b*2} ${a*28} ${-b*16}z" style="fill:${deep}"/>`).join("")}
    <rect x="${x-124}" y="${y-48}" width="248" height="96" rx="3" fill="none" ${ln(1.1)}/><rect x="${x-110}" y="${y-36}" width="220" height="72" fill="none" ${ln(.6)} opacity=".6"/>
    <path d="${rows(15, i => `M${x-124} ${y-44 + i*6.2} h-8 M${x+124} ${y-44 + i*6.2} h8 `)}" ${ln(.7)} opacity=".6"/></g>`;
}
function curtainsBig(x, y, t, c){
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
function pictureBig(x, y, t, c){
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
function plantBig(x, y, t, c){
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
  return sk(`<rect x="${x-26}" y="${y-46}" width="52" height="46" rx="3" style="fill:${c}"/><rect x="${x-30}" y="${y-50}" width="60" height="8" rx="2" style="fill:${D(c, .15)}"/><circle cx="${x-26}" cy="${y-52}" r="4" style="fill:${D(c, .15)}"/><circle cx="${x+26}" cy="${y-52}" r="4" style="fill:${D(c, .15)}"/>
      <path d="M${x} ${y-50} V${y-110}" style="stroke:#8A6A52" stroke-width="5"/>${leaves.map(([dx, dy, r]) => `<circle cx="${x+dx}" cy="${y+dy}" r="${r}" style="fill:${["#6F9A5E", "#7FA36E", "#5E8A48"][Math.abs(dx) % 3]}"/>`).join("")}
      ${lemons.map(([dx, dy]) => `<ellipse cx="${x+dx}" cy="${y+dy}" rx="6" ry="4.6" style="fill:#F3D34A"/>`).join("")}${[[-6, -160], [24, -140], [-34, -122]].map(([dx, dy]) => `<circle cx="${x+dx}" cy="${y+dy}" r="2.4" style="fill:${CREAM}"/>`).join("")}`,
    `<rect x="${x-26}" y="${y-46}" width="52" height="46" rx="3"/><rect x="${x-18}" y="${y-38}" width="36" height="30" rx="2" opacity=".5"/><rect x="${x-30}" y="${y-50}" width="60" height="8" rx="2"/><path d="M${x-44} ${y-118} q-6 -30 16 -40 q14 -22 40 -10 q26 -2 26 26 q16 18 0 34" opacity=".6"/>
      ${lemons.map(([dx, dy]) => `<ellipse cx="${x+dx}" cy="${y+dy}" rx="6" ry="4.6"/>`).join("")}`);
}
function basinBig(x, y, t, c){
  if (t === 1) return sk(`<rect x="${x-18}" y="${y-176}" width="36" height="44" rx="2" style="fill:${PINE}"/><rect x="${x-13}" y="${y-171}" width="26" height="34" style="fill:#E6EEF2"/><path d="M${x-8} ${y-150} l12 -14" style="stroke:#FFFFFF" stroke-width="3"/>
      <path d="M${x-34} ${y-72} V${y} M${x+34} ${y-72} V${y}" style="stroke:${PINE}" stroke-width="6"/><rect x="${x-36}" y="${y-26}" width="72" height="6" style="fill:${PINE}"/><rect x="${x-40}" y="${y-78}" width="80" height="8" rx="2" style="fill:${PINE}"/>
      <path d="M${x-30} ${y-78} q4 -12 22 -12 q18 0 22 12z" style="fill:${L(c, .45)}"/><path d="M${x+14} ${y-78} q-2 -14 2 -22 q-4 -4 2 -6 h10 q4 8 -2 10 q6 8 2 18z" style="fill:${c}"/><rect x="${x-24}" y="${y-36}" width="20" height="10" rx="2" style="fill:${CREAM}"/>`,
    `<path d="M${x} ${y-176} l-12 -10 M${x} ${y-176} l12 -10"/><rect x="${x-18}" y="${y-176}" width="36" height="44" rx="2"/><rect x="${x-13}" y="${y-171}" width="26" height="34"/><rect x="${x-40}" y="${y-78}" width="80" height="8" rx="2"/><path d="M${x-34} ${y-70} V${y} M${x+34} ${y-70} V${y}"/>
      <path d="M${x-30} ${y-78} q4 -12 22 -12 q18 0 22 12"/><path d="M${x+14} ${y-78} q-2 -14 2 -22 q-4 -4 2 -6 h10 q4 8 -2 10 q6 8 2 18z"/><rect x="${x-24}" y="${y-36}" width="20" height="10" rx="2"/>`);
  if (t === 2) { const bowl = `M${x-42} ${y-82} H${x+42} Q${x+40} ${y-58} ${x} ${y-56} Q${x-40} ${y-58} ${x-42} ${y-82}z`;
    return sk(`<ellipse cx="${x}" cy="${y-158}" rx="28" ry="36" style="fill:${c}"/><ellipse cx="${x}" cy="${y-158}" rx="21" ry="29" style="fill:#E6EEF2"/><path d="M${x-10} ${y-166} l14 -14 M${x-6} ${y-154} l10 -10" style="stroke:#FFFFFF" stroke-width="3"/>
        <path d="M${x-12} ${y} L${x-8} ${y-60} H${x+8} L${x+12} ${y}z" style="fill:${PORC}"/><path d="M${x-14} ${y-82} v-10 M${x+14} ${y-82} v-10" style="stroke:${CHROME}" stroke-width="4"/><circle cx="${x-14}" cy="${y-94}" r="4" style="fill:${CHROME}"/><circle cx="${x+14}" cy="${y-94}" r="4" style="fill:${CHROME}"/>
        <path d="${bowl}" style="fill:${PORC}"/><rect x="${x-44}" y="${y-86}" width="88" height="7" rx="3" style="fill:${PORC}"/><path d="M${x-36} ${y-72} Q${x} ${y-62} ${x+36} ${y-72}" style="stroke:${c};fill:none" stroke-width="3"/>`,
      `<ellipse cx="${x}" cy="${y-158}" rx="28" ry="36"/><ellipse cx="${x}" cy="${y-158}" rx="21" ry="29"/><path d="M${x-12} ${y} L${x-8} ${y-60} H${x+8} L${x+12} ${y}"/><path d="${bowl}"/><rect x="${x-44}" y="${y-86}" width="88" height="7" rx="3"/>`); }
  const arch = (i) => `M${x-34+i} ${y-112-i} V${y-176} Q${x} ${y-206+i*1.6} ${x+34-i} ${y-176} V${y-112-i}z`;
  return glow(x, y - 160, 60, .3) + sk(`<path d="${arch(0)}" style="fill:${BRASS}"/><path d="${arch(6)}" style="fill:#E6EEF2"/><path d="M${x-14} ${y-168} l18 -18 M${x-10} ${y-152} l14 -14" style="stroke:#FFFFFF" stroke-width="3"/><circle cx="${x}" cy="${y-200}" r="6" style="fill:${BRASS}"/><path d="M${x-14} ${y-196} q14 -10 28 0" style="stroke:${BRASS};fill:none" stroke-width="3"/>
      <rect x="${x-48}" y="${y-72}" width="96" height="66" rx="2" style="fill:${c}"/><path d="M${x-44} ${y-6} v6 M${x+44} ${y-6} v6" style="stroke:${D(c, .3)}" stroke-width="5"/>
      <path d="M${x} ${y-80} v-12 q0 -6 8 -6 h4" style="stroke:${BRASS};fill:none" stroke-width="4"/><circle cx="${x-10}" cy="${y-86}" r="3.5" style="fill:${BRASS}"/><circle cx="${x+18}" cy="${y-86}" r="3.5" style="fill:${BRASS}"/>
      <rect x="${x-52}" y="${y-82}" width="104" height="12" rx="2" style="fill:#F2EEE8"/><path d="M${x-46} ${y-78} q10 4 18 0 q8 -3 14 2 M${x+16} ${y-74} q10 -4 26 0" style="stroke:#B9B2A8;fill:none" stroke-width="1.2"/><ellipse cx="${x}" cy="${y-80}" rx="22" ry="3" style="fill:#D6E2E6"/>
      <rect x="${x+28}" y="${y-92}" width="18" height="10" rx="2" style="fill:${L(c, .55)}"/><path d="M${x-40} ${y-82} v-12 h8 v12z" style="fill:#E8C25A"/>`,
    `<path d="${arch(0)}"/><path d="${arch(6)}"/><circle cx="${x}" cy="${y-200}" r="6"/><rect x="${x-48}" y="${y-72}" width="96" height="66" rx="2"/><path d="M${x} ${y-70} v62"/><rect x="${x-42}" y="${y-64}" width="36" height="50" rx="2" opacity=".55"/><rect x="${x+6}" y="${y-64}" width="36" height="50" rx="2" opacity=".55"/>
      <circle cx="${x-8}" cy="${y-40}" r="2"/><circle cx="${x+8}" cy="${y-40}" r="2"/><rect x="${x-52}" y="${y-82}" width="104" height="12" rx="2"/><rect x="${x+28}" y="${y-92}" width="18" height="10" rx="2"/>`);
}
function towelsBig(x, y, t, c){
  if (t === 1) return sk(`<path d="M${x-15} ${y-146} h30 l4 66 h-38z" style="fill:${c}"/><rect x="${x-17}" y="${y-98}" width="34" height="6" style="fill:${CREAM}"/><circle cx="${x}" cy="${y-150}" r="3.5" style="fill:${DARK}"/>`,
    `<path d="M${x} ${y-150} q-6 -4 -4 -10"/><path d="M${x-15} ${y-146} h30 l4 66 h-38z"/><path d="M${x-8} ${y-146} q8 6 16 0" opacity=".6"/><rect x="${x-17}" y="${y-98}" width="34" height="6"/>`);
  if (t === 2) return sk(`<rect x="${x-28}" y="${y-152}" width="6" height="14" style="fill:${OAK}"/><rect x="${x+22}" y="${y-152}" width="6" height="14" style="fill:${OAK}"/><rect x="${x-32}" y="${y-146}" width="64" height="6" rx="3" style="fill:${OAK}"/>
      <path d="M${x-2} ${y-142} h26 v52 h-26z" style="fill:${CREAM}"/><rect x="${x-2}" y="${y-104}" width="26" height="5" style="fill:${c}"/><path d="M${x-26} ${y-142} h28 v64 h-28z" style="fill:${c}"/><rect x="${x-26}" y="${y-90}" width="28" height="5" style="fill:${L(c, .5)}"/>`,
    `<rect x="${x-32}" y="${y-146}" width="64" height="6" rx="3"/><path d="M${x-2} ${y-142} h26 v52 h-26z"/><path d="M${x-26} ${y-142} h28 v64 h-28z"/>`);
  return glow(x, y - 90, 50, .3) + sk(`<path d="M${x-22} ${y} V${y-148} M${x+22} ${y} V${y-148}" style="stroke:${BRASS}" stroke-width="5"/>${rows(7, i => `<path d="M${x-22} ${y-20 - i*18} H${x+22}" style="stroke:${BRASS}" stroke-width="3.5"/>`)}
      <path d="M${x-26} ${y-140} h52 v34 h-52z" style="fill:${c}"/><path d="M${x-26} ${y-140} h52 v8 h-52z" style="fill:${D(c, .12)}"/><path d="M${x-24} ${y-74} h48 v26 h-48z" style="fill:${CREAM}"/><rect x="${x-24}" y="${y-60}" width="48" height="5" style="fill:${c}"/>
      <path d="M${x-8} ${y-150} q-4 -6 0 -12 M${x+8} ${y-150} q-4 -6 0 -12" style="stroke:#E8C25A;fill:none" stroke-width="2" opacity=".7"/>`,
    `<path d="M${x-22} ${y} V${y-148} M${x+22} ${y} V${y-148}"/><path d="M${x-26} ${y-140} h52 v34 h-52z"/><path d="M${x-24} ${y-74} h48 v26 h-48z"/><path d="M${x-30} ${y} h16 M${x+14} ${y} h16"/>`);
}
function bathmatBig(x, y, t, c){
  const ln = `style="stroke:${LINE}" stroke-width="${(1.1/SC).toFixed(2)}"`;
  if (t === 1) return `<g filter="url(#wob)"><rect x="${x-62}" y="${y-20}" width="124" height="40" rx="4" style="fill:${L(c, .45)}"/><rect x="${x-62}" y="${y-12}" width="124" height="5" style="fill:${c}"/><rect x="${x-62}" y="${y+7}" width="124" height="5" style="fill:${c}"/>
    <rect x="${x-62}" y="${y-20}" width="124" height="40" rx="4" fill="none" ${ln}/></g>`;
  if (t === 2) return `<g filter="url(#wob)"><rect x="${x-64}" y="${y-22}" width="128" height="44" rx="18" style="fill:${c}"/>${rows(3, r => rows(10, k => `<circle cx="${x-50 + k*11 + (r % 2)*5}" cy="${y-11 + r*11}" r="3" style="fill:${L(c, .35)}"/>`))}
    <rect x="${x-64}" y="${y-22}" width="128" height="44" rx="18" fill="none" ${ln}/></g>`;
  return `<g filter="url(#wob)"><rect x="${x-58}" y="${y-24}" width="10" height="48" style="fill:#8A6448"/><rect x="${x+48}" y="${y-24}" width="10" height="48" style="fill:#8A6448"/>${rows(6, i => `<rect x="${x-64}" y="${y-24 + i*8.4}" width="128" height="6" rx="2" style="fill:${i % 2 ? "#C99A62" : "#B98552"}"/>`)}
    ${rows(6, i => `<rect x="${x-64}" y="${y-24 + i*8.4}" width="128" height="6" rx="2" fill="none" ${ln}/>`)}</g>`;
}
function toiletriesBig(x, y, t, c){
  const stool = t === 3 ? [`<rect x="${x-26}" y="${y-48}" width="52" height="7" rx="2" style="fill:${OAK}"/><path d="M${x-22} ${y-41} V${y} M${x+22} ${y-41} V${y}" style="stroke:${DARK}" stroke-width="4"/><path d="M${x-22} ${y-14} H${x+22}" style="stroke:${DARK}" stroke-width="3"/>`,
      `<rect x="${x-26}" y="${y-48}" width="52" height="7" rx="2"/><path d="M${x-22} ${y-41} V${y} M${x+22} ${y-41} V${y}"/>`]
    : [`<rect x="${x-20}" y="${y-40}" width="40" height="7" rx="3" style="fill:${PINE}"/><path d="M${x-15} ${y-33} L${x-18} ${y} M${x+15} ${y-33} L${x+18} ${y}" style="stroke:${OAK}" stroke-width="4"/>`,
      `<rect x="${x-20}" y="${y-40}" width="40" height="7" rx="3"/><path d="M${x-15} ${y-33} L${x-18} ${y} M${x+15} ${y-33} L${x+18} ${y}"/>`];
  if (t === 1) return sk(stool[0] + `<ellipse cx="${x}" cy="${y-42}" rx="15" ry="4" style="fill:${c}"/><rect x="${x-9}" y="${y-50}" width="18" height="8" rx="4" style="fill:${CREAM}"/><circle cx="${x+10}" cy="${y-56}" r="2.4" style="fill:#FFFFFF"/><circle cx="${x+5}" cy="${y-60}" r="1.6" style="fill:#FFFFFF"/>`,
    stool[1] + `<ellipse cx="${x}" cy="${y-42}" rx="15" ry="4"/><rect x="${x-9}" y="${y-50}" width="18" height="8" rx="4"/>`);
  if (t === 2) return sk(stool[0] + `<rect x="${x-6}" y="${y-62}" width="12" height="20" rx="3" style="fill:${L(c, .5)}"/><rect x="${x-5}" y="${y-66}" width="10" height="5" style="fill:${OAK}"/><circle cx="${x-12}" cy="${y-52}" r="5" style="fill:${c}"/><circle cx="${x+12}" cy="${y-52}" r="5" style="fill:#F3E7C8"/><path d="M${x-18} ${y-50} h36 l-3 10 h-30z" style="fill:#D9B97E"/>`,
    stool[1] + `<path d="M${x-18} ${y-50} h36 l-3 10 h-30z"/><path d="M${x-14} ${y-45} h28" opacity=".5"/><rect x="${x-6}" y="${y-62}" width="12" height="20" rx="3"/>`);
  return glow(x, y - 66, 40, .55) + sk(stool[0] + `<rect x="${x-22}" y="${y-54}" width="44" height="6" rx="2" style="fill:${BRASS}"/>${[-14, -6, 2].map((dx, i) => `<rect x="${x+dx}" y="${y-68 + i*3}" width="7" height="${14 - i*3}" style="fill:${CREAM}"/><path d="M${x+dx+3.5} ${y-70 + i*3} q-3 -4 0 -8 q3 4 0 8z" style="fill:#F3C969"/>`).join("")}
      <path d="M${x+10} ${y-54} v-12 q0 -4 3 -6 v-6 h4 v6 q3 2 3 6 v12z" style="fill:#D99A3A"/><rect x="${x-20}" y="${y-62}" width="7" height="8" rx="2" style="fill:${L(c, .4)}"/>`,
    stool[1] + `<rect x="${x-22}" y="${y-54}" width="44" height="6" rx="2"/><path d="M${x+10} ${y-54} v-12 q0 -4 3 -6 v-6 h4 v6 q3 2 3 6 v12z"/><rect x="${x-20}" y="${y-62}" width="7" height="8" rx="2"/>`);
}
// brown-paper parcels tied with string, waiting in the hall
function parcelsBig(n, x, y){
  const spots = [[-26, 0, 24, 18], [0, 0, 24, 20], [26, 0, 22, 16], [-13, -20, 22, 16], [13, -20, 24, 18], [0, -38, 20, 14]].slice(0, n);
  return sk(spots.map(([dx, dy, w, h]) => `<rect x="${x+dx-w/2}" y="${y+dy-h}" width="${w}" height="${h}" rx="2" style="fill:#C9A06E"/><rect x="${x+dx+2}" y="${y+dy-h+3}" width="7" height="5" style="fill:${CREAM}"/>`).join(""),
    spots.map(([dx, dy, w, h]) => `<rect x="${x+dx-w/2}" y="${y+dy-h}" width="${w}" height="${h}" rx="2"/><path d="M${x+dx} ${y+dy-h} v${h} M${x+dx-w/2} ${y+dy-h/2} h${w}" style="stroke:#8A5A3A" stroke-width="1.1"/><path d="M${x+dx} ${y+dy-h} q-4 -5 -6 -1 q2 3 6 1 q4 -5 6 -1 q-2 3 -6 1" style="stroke:#8A5A3A" stroke-width="1"/>`).join(""));
}
const parcels = (n, x, y) => { n = Math.min(6, n || 0); return n ? sc(x, y, .62, () => parcelsBig(n, x, y)) : ""; };

// how much each of the older pieces is set down by, tier by tier, so it comes out the right size next to the player
// (a bookcase about 0.6 of her height wide and 1.1 tall, a floor lamp a little under her height, a basin top half her height)
// (a rug about 1.5 times her height across; it lies flat, so it's squashed less from front to back than it was drawn)
const SCALE = {shelf: [0, .55, .53, .43], lamp: [0, .5, .5, .55], rug: [0, [.62, .9], [.52, .8], [.47, .66]], curtains: [0, .54, .54, .54], picture: [0, .4, .4, .4], plant: [0, .5, .42, .36],
  basin: [0, .42, .42, .42], towels: [0, .42, .42, .36], bathmat: [0, [.44, .62], [.42, .56], [.42, .56]], toiletries: [0, .42, .42, .42]};
const BIG = {shelf: shelfBig, lamp: lampBig, rug: rugBig, curtains: curtainsBig, picture: pictureBig, plant: plantBig, basin: basinBig, towels: towelsBig, bathmat: bathmatBig, toiletries: toiletriesBig};
const DRAW = {seat, table, touches, bath, ...Object.fromEntries(Object.keys(BIG).map(k => [k, (x, y, t, c) => sc(x, y, SCALE[k][t], () => BIG[k](x, y, t, c))]))};
const FLAT = {rug: 0, bathmat: 0, curtains: 1, picture: 1};   // drawn first, in this order; everything else by how far forward it stands
export const HALL = [420, 540];   // where the hall table stands (ROOMS.<id>.pos.H); the parcels wait beside it
// floor: "down", "up" or "bath" (round 221: the bathroom); parcels only ever wait downstairs in the hall
export function letFurniture(id, slots, pos, n, floor = "down"){
  const C = COTTAGES[id]; if (!C) return "";
  slots = Object.fromEntries(Object.entries(slots).filter(([s]) => floorOf(id, s) === floor));
  const tint = p => (COLOURS[p.col] || COLOURS.cream)[1];
  const items = Object.keys(slots).filter(s => pos[s] && slots[s]).map(s => ({s, cat: catOf(id, s), p: slots[s], at: pos[s]}));
  const bedFor = s => s.replace("linen", "bed");
  items.forEach(it => { it.z = it.cat in FLAT ? -1000 + FLAT[it.cat] : (it.cat === "linen" && slots[bedFor(it.s)] ? pos[bedFor(it.s)][1] + .5 : it.at[1]); });
  items.sort((a, b) => a.z - b.z);
  let h = "";
  for (const it of items) {
    const [x, y] = it.at, t = Math.max(1, Math.min(3, it.p.tier || 1)), c = tint(it.p);
    if (it.cat === "bed") {
      const b = bed(x, y, t), ls = it.s.replace("bed", "linen"), lp = slots[ls];
      h += b.back + (lp ? linen(x, y, Math.max(1, Math.min(3, lp.tier || 1)), tint(lp), true) : "") + b.front;
    } else if (it.cat === "linen") { if (!slots[bedFor(it.s)]) h += linen(x, y, t, c, false); }
    else if (DRAW[it.cat]) h += DRAW[it.cat](x, y, t, c);
  }
  return `<g pointer-events="none">${h}</g>` + (floor === "down" ? parcels(n, HALL[0] - 62, HALL[1] + 8) : "");
}
// the hall table: a console a little under half the player's height, with the guest book, a pen, the catalogue and a
// little vase. Its top runs from y-46 (the back) to y-32 (the front edge); the welcome goes at y-44 if there's no table.
export const hallTable = (x, y) => shp([[R(x-27, y-46, 54, 14, 2), "#9A6E48"], [R(x-26, y-32, 52, 7), OAK], [R(x-6, y-30, 12, 3.5, 1.5), "#C08D58"],
    [Pa(`M${x-22} ${y-40} l1 -4 h8 l1 4z M${x-12} ${y-40} l1 -4 h8 l1 4z`), CREAM], [R(x+2, y-43, 10, 3.5, .8), "#7FA0D0"], [Pa(`M${x+18} ${y-38} q-3.5 0 -3 -5 q.5 -3 2.5 -3.5 h1 q2 .5 2.5 3.5 q.5 5 -3 5z`), "#E3EEF2"]],
  `<path d="M${x-23} ${y-25} V${y} M${x+23} ${y-25} V${y}" style="stroke:${DARK}" stroke-width="2.6"/><path d="M${x-23} ${y-7} H${x+23}" style="stroke:${DARK}" stroke-width="1.8"/><path d="M${x-12} ${y-44} v6" style="stroke:#C2505F" stroke-width="1.2"/><path d="M${x-4} ${y-41} l8 -3.5" style="stroke:#2F3B73" stroke-width="1.6"/>
   <path d="M${x+18} ${y-46} q-3 -5 -6 -6 M${x+18} ${y-46} q2 -6 5 -7 M${x+18} ${y-46} v-7" style="stroke:#6F9A5E;fill:none" stroke-width="1"/><circle cx="${x+12}" cy="${y-52}" r="2" style="fill:#F3C969"/><circle cx="${x+23}" cy="${y-53}" r="2" style="fill:#E3A5B0"/><circle cx="${x+18}" cy="${y-54}" r="2" style="fill:${CREAM}"/>`,
  `<path d="M${x-23} ${y-25} V${y} M${x+23} ${y-25} V${y}"/><path d="M${x-20} ${y-42} h6 M${x-10} ${y-42} h6" opacity=".5"/>`);

// round 221: the welcome you've left out, on the table top at (x, y): a fruit bowl (fruit 0-3) and treats from the
// fridge (0-4: a bottle of wine, a wedge of cheese, a bar of chocolate, a jar of jam). Drawn big, set down small.
function welcomeBig(x, y, fruit, treats){
  const bx = x - 28, fr = [[bx - 8, y - 12, "#D9534F"], [bx + 7, y - 13, "#9BC26A"], [bx, y - 19, "#F2A65A"]].slice(0, fruit);
  const T = [
    [`<rect x="${x-4}" y="${y-30}" width="11" height="30" rx="4" style="fill:#6B1F3A"/><rect x="${x}" y="${y-40}" width="3.5" height="11" style="fill:#6B1F3A"/><rect x="${x-3}" y="${y-18}" width="9" height="9" style="fill:${CREAM}"/>`, `<rect x="${x-4}" y="${y-30}" width="11" height="30" rx="4"/><path d="M${x} ${y-40} v11 M${x+3.5} ${y-40} v11"/>`],
    [`<path d="M${x+9} ${y} L${x+27} ${y} L${x+27} ${y-11}z" style="fill:#F3D36A"/><circle cx="${x+22}" cy="${y-4}" r="1.6" style="fill:#D9B44A"/>`, `<path d="M${x+9} ${y} L${x+27} ${y} L${x+27} ${y-11}z"/>`],
    [`<rect x="${x+29}" y="${y-8}" width="17" height="8" rx="1" style="fill:#5A3A2A"/><rect x="${x+35}" y="${y-8}" width="6" height="8" style="fill:#C2505F"/>`, `<rect x="${x+29}" y="${y-8}" width="17" height="8" rx="1"/>`],
    [`<rect x="${x+48}" y="${y-14}" width="11" height="14" rx="2" style="fill:#B03A48"/><path d="M${x+46} ${y-14} q7 -6 15 0z" style="fill:#F3E7C8"/><path d="M${x+47} ${y-13} h13" style="stroke:#C2505F" stroke-width="1.4"/>`, `<rect x="${x+48}" y="${y-14}" width="11" height="14" rx="2"/><path d="M${x+46} ${y-14} q7 -6 15 0"/>`]].slice(0, treats);
  const bowl = fruit ? [`${fr.map(([fx, fy, col]) => `<circle cx="${fx}" cy="${fy}" r="6.5" style="fill:${col}"/>`).join("")}<path d="M${bx-18} ${y-10} Q${bx} ${y+2} ${bx+18} ${y-10}z" style="fill:#E3EEF2"/><path d="M${bx-14} ${y-7} Q${bx} ${y} ${bx+14} ${y-7}" style="stroke:#7FA0D0;fill:none" stroke-width="2"/><rect x="${bx-6}" y="${y-2}" width="12" height="3" style="fill:#E3EEF2"/>`,
    `<path d="M${bx-18} ${y-10} Q${bx} ${y+2} ${bx+18} ${y-10}z"/>${fr.map(([fx, fy]) => `<circle cx="${fx}" cy="${fy}" r="6.5"/>`).join("")}<path d="M${bx+7} ${y-19} l2 -4" />`] : ["", ""];
  return sk(bowl[0] + T.map(p => p[0]).join(""), bowl[1] + T.map(p => p[1]).join(""));
}
export const welcomeArt = (x, y, fruit, treats) => {
  fruit = Math.max(0, Math.min(3, fruit || 0)); treats = Math.max(0, Math.min(4, treats || 0));
  return `<g pointer-events="none">${sc(x + 15, y, .42, () => welcomeBig(x + 15, y, fruit, treats), x, y)}</g>`;
};
